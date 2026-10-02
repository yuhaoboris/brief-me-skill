from pathlib import Path
import json, subprocess, wave, struct

ROOT = Path(__file__).resolve().parent
cues = json.loads((ROOT / 'narration.json').read_text())
for cue in cues:
    path = ROOT / 'audio' / f'{cue["id"]}.aiff'
    subprocess.run(['say', '-v', 'Tingting', '-r', '205', '-o', str(path), cue['text']], check=True)
    result = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'json', str(path)], check=True, capture_output=True, text=True)
    cue['duration'] = float(json.loads(result.stdout)['format'].get('duration', 0))
    if cue['duration'] <= 0:
        raise RuntimeError(f'Local speech synthesis produced no audio samples for {cue["id"]}; video production is blocked')
    print(cue['id'], cue['duration'], flush=True)

speech = sum(c['duration'] for c in cues)
if speech > 37.5:
    raise RuntimeError(f'Voice is too long for a readable 40-second timeline: {speech:.2f}s')
gap = (40 - 0.65 - speech - 0.85) / (len(cues) - 1)
if gap < 0.15:
    raise RuntimeError('Insufficient pause budget')
cursor = 0.65
for cue in cues:
    cue['start'] = round(cursor, 3)
    cue['end'] = round(cursor + cue['duration'], 3)
    cursor = cue['end'] + gap
(ROOT / 'timeline.json').write_text(json.dumps(cues, ensure_ascii=False, indent=2))

rate = 48000
mix = bytearray(40 * rate * 2)
for cue in cues:
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(ROOT / 'audio' / f'{cue["id"]}.aiff'), '-f', 's16le', '-ar', str(rate), '-ac', '1', 'pipe:1'], check=True, capture_output=True).stdout
    offset = round(cue['start'] * rate) * 2
    if offset + len(pcm) > len(mix):
        raise RuntimeError('Narration exceeds timeline')
    mix[offset:offset+len(pcm)] = pcm
with wave.open(str(ROOT / 'narration.wav'), 'wb') as output:
    output.setnchannels(1)
    output.setsampwidth(2)
    output.setframerate(rate)
    output.writeframes(mix)

def srt_time(t):
    ms=round(t*1000)
    return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
(ROOT / 'captions.srt').write_text('\n\n'.join(f'{i+1}\n{srt_time(c["start"])} --> {srt_time(c["end"])}\n{c["text"]}' for i,c in enumerate(cues))+'\n')
print('speech seconds:', round(speech,3), 'inter-cue gap:', round(gap,3), 'timeline seconds: 40')
