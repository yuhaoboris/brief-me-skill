# Video brief

Use this reference when the selected output is a video.
Completion means a playable, inspected MP4 that explains the conversation's result.
A script, storyboard, animation source, or slideshow is an intermediate artifact.

## 1. Establish the explanation

Use the internal account prepared under SKILL.md as the factual source.
Choose one question the viewer should be able to answer after watching.
Use the conversation's language unless the user requests another language.
Start with the result, show the mechanism, then state the consequence or next action.
Aim for 60–120 seconds for one concept; adapt to the content and the user's duration.
Keep completed work, verified results, proposals, and unresolved questions distinct.
Mark hypothetical numbers and toy examples as illustrative when they first appear.
Keep the actual units, scales, uncertainty, and qualifications visible where they matter.
This step is complete when each proposed scene has one supported explanatory purpose.

## 2. Choose a working production path

Inspect the client's available media tools and local rendering capabilities.
Prefer a working native video tool or an existing local production workflow.
For local code animation, use an installed renderer such as Manim or a suitable equivalent.
Confirm the renderer's installed version and supported commands before writing its integration.
Read official documentation when unfamiliar options or behavior require verification.
Use the existing environment; creating a video does not require a new framework or paid API.
Use a configured narration tool or local speech synthesis when it supports the chosen language.
Treat API keys as secrets; reference configured credentials without printing or embedding them.
Apply SKILL.md's privacy and authorization boundaries to narration and rendering services.
When a capability is missing, complete independent local work before reporting the specific blocker.
Avoid installing large dependencies or starting paid jobs merely to discover whether the path works.
This step is complete when rendering, encoding, and the intended audio path are available.

## 3. Write scenes that explain through motion

Use an original visual explanation inspired by 3Blue1Brown's teaching approach.
Build objects step by step; use spatial relationships and transformations to explain why the result follows.
Give each color and symbol one meaning, and retain that meaning across scenes.
Introduce a visual object before manipulating it; keep referents visible during the explanation.
Choose motion that communicates change: flow, accumulation, comparison, decomposition, or a changing parameter.
For example, move one input through a process and show how each transformation changes the output.
Use simple geometry, labels, diagrams, or graphs according to the topic; mathematics is optional.
Use short text for labels and claims, with detail carried by the visual demonstration and narration.
Avoid treating fades between static title cards as the requested explanatory animation.
Use an original composition and available voice; retain the user's topic and evidence as the content.
Keep one compact scene plan in the editable source or a small companion file:

| Time | Claim and source | Visible change | Narration | Caption |
| --- | --- | --- | --- | --- |
| Start–end | Supported claim or marked example | What changes and why | Spoken words | Readable text |

Finish the scene plan before full rendering, without requiring a routine approval round.
This step is complete when the visuals themselves explain a causal or conceptual relationship.

## 4. Build and inspect a 15-second sample

Render a representative 15-second excerpt using the intended fonts, animation, narration, and captions.
If the requested total duration is shorter than 15 seconds, render the full short video as the sample.
Include the hardest visual transition and at least one complete spoken or captioned explanation.
Use the sample to verify legibility, pacing, pronunciation, clipping, synchronization, and render feasibility.
Preview it through an available media player or media inspection tool; inspect frames at transition boundaries.
Measure narration duration and place animations around the actual audio instead of estimating speech speed.
Repair sample defects before the full render; reuse the sample work when possible.
This step is complete when the sample passes the applicable checks, not merely when encoding exits successfully.

## 5. Render the final artifact

For code-based animation, render from editable source, with relative asset references where practical.
For a native generation tool, retain its prompt, scene plan, narration, and available timing controls.
Keep a single timeline for scene boundaries, narration, and captions.
Pause long enough after a new diagram or result for the viewer to read and connect it to the explanation.
Keep captions clear of important visual labels, and provide readable contrast at the delivered resolution.
Provide synchronized captions in the video or its supported player, plus an SRT or VTT companion file.
If narration is unavailable, produce a caption-led video only when that satisfies the user's request.
Report a missing requested voice track as incomplete; a transcript is not an audio track.
Encode a broadly playable MP4; prefer H.264 with yuv420p and AAC when the available encoder supports them.
Preserve available source, narration text, timeline, and required assets so the explanation can be revised.
State what is editable when a native tool returns only a rendered video; do not promise unavailable source.
Use one small output folder; include only files needed to watch, revise, or verify the result.

## 6. Verify the delivered file

Probe the actual final MP4 for duration, dimensions, codec, and expected audio/video streams.
Decode the complete MP4 with a media decoder and treat decode errors or a nonzero exit as a failure.
If the client cannot probe or decode a tool-generated video, deliver it as generated with those checks unverified.
That state is different from a missing video and does not meet the full verification criteria.
Inspect the opening, ending, each scene, and representative transition frames for layout and missing assets.
Watch the sample and the final video where playback is available; verify that the intended motion is present.
Listen to the narration where audio inspection is available; check pronunciation, clipping, and long unintended silence.
Check the first and last captions and every scene boundary against the spoken sentence and visible state.
Check caption timing for overlaps, out-of-range cues, and truncated final speech.
Compare claims, labels, figures, and units in the rendered output with the brief's evidence.
Distinguish a completed encode, a successful decode, inspected frames, and actual audio/video playback.
State any unavailable perceptual checks explicitly; never imply that metadata or screenshots prove them.
Repair defects and repeat the affected checks on the revised final file.

## 7. Deliver or report the remaining gap

Show the actual MP4 with the client's supported inline player or preview, and provide its usable file link.
Link the editable source and captions, and summarize the verified checks in a few lines.
If no working renderer or encoder is available, report “Video not completed” and name the missing capability.
Provide any useful script, scene plan, or source as explicitly labeled intermediate work.
Keep the requested video open as unfinished; do not substitute an image, webpage, or storyboard without saying so.
