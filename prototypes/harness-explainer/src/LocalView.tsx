import type { CSSProperties, ReactNode } from 'react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { details } from './details';
import { moduleById, type Evidence, type NodeId } from './content';

export type LocalReading = { tab: number; flowIndex: number; step: number; part: number; connection: number };
export const initialLocalReading: LocalReading = { tab: 0, flowIndex: 0, step: 0, part: 0, connection: 0 };
export function LocalView({ id, onSelect, evidence, reading, update }: {
  reading: LocalReading; update: (patch: Partial<LocalReading>) => void;
  id: NodeId; onSelect: (id: NodeId) => void; evidence: (items: Evidence[]) => ReactNode;
}) {
  const d = details[id];
  const { flowIndex, step, part, connection } = reading;
  const flow = d.flows[flowIndex];
  const current = flow.steps[step];
  const contact = d.contacts[connection];
  return <div className="local-content">
    <p className="local-lens">{d.lens}</p>
    <TabGroup selectedIndex={reading.tab} onChange={tab => update({ tab })}>
      <TabList className="local-tabs"><Tab>执行流程</Tab><Tab>内部结构</Tab><Tab>对外关系 <span>{d.contacts.length}</span></Tab></TabList>
      <TabPanels>
        <TabPanel className="local-tab-panel">
          {d.flows.length > 1 && <div className="flow-options" aria-label="选择流程">{d.flows.map((f, i) => <button key={f.name} aria-pressed={flowIndex === i} onClick={() => { update({ flowIndex: i, step: 0 }); }}>{f.name}</button>)}</div>}
          <div className="local-section-heading"><h3>{flow.name}</h3><span>选择步骤查看细节</span></div>
          <p className="diagram-note">{flow.note}</p>
          <ol className="flow-track" style={{ '--step-count': Math.min(flow.steps.length, 3) } as CSSProperties}>
            {flow.steps.map((s, i) => <li key={s.name}><button className="flow-step" aria-pressed={step === i} onClick={() => update({ step: i })}><span className="flow-number">{String(i + 1).padStart(2, '0')}</span><strong>{s.name}</strong><span>{s.summary}</span><span className="flow-next" aria-hidden="true">{i < flow.steps.length - 1 ? '→' : '↳'}</span></button></li>)}
          </ol>
          <div className="flow-outcome"><span>输出 / 去向</span><p>{flow.outcome}</p></div>
          <section className="inspection" aria-label="步骤详情" aria-live="polite"><span className="small-label">步骤 {step + 1} / {flow.steps.length}</span><h4>{current.name}</h4><p>{current.detail}</p>{evidence(current.evidence)}</section>
        </TabPanel>
        <TabPanel className="local-tab-panel">
          <div className="local-section-heading"><h3>{moduleById[id].name}里面有什么</h3><span>选择组成部分查看职责</span></div>
          <p className="diagram-note">{d.structureNote}</p>
          <div className="structure-box"><span className="structure-label">{moduleById[id].english} · 职责分解</span><div className="structure-parts">{d.parts.map((p, i) => <button key={p.name} aria-pressed={part === i} onClick={() => update({ part: i })}><strong>{p.name}</strong><span>{p.summary}</span></button>)}</div>
            {!!d.links.length && <div className="structure-links">{d.links.map((l, i) => <div key={i}><strong>{l.from}</strong><span>{l.verb} →</span><strong>{l.to}</strong></div>)}</div>}
          </div>
          <section className="inspection" aria-label="组成详情" aria-live="polite"><span className="small-label">组成部分</span><h4>{d.parts[part].name}</h4><p>{d.parts[part].detail}</p>{evidence(d.parts[part].evidence)}</section>
        </TabPanel>
        <TabPanel className="local-tab-panel">
          <div className="local-section-heading"><h3>谁向谁交付什么</h3><span>选择连接查看约束</span></div>
          <p className="diagram-note">箭头表示交付方向；这里只展开与当前局部有关的连接。</p>
          <div className="contact-list">{d.contacts.map((c, i) => <button key={i} className="contact-row" aria-pressed={connection === i} onClick={() => update({ connection: i })}><strong>{c.from}</strong><span className="contact-transfer"><span>{c.carries}</span><span aria-hidden="true">────────→</span></span><strong>{c.to}</strong></button>)}</div>
          <section className="inspection" aria-label="连接详情" aria-live="polite"><span className="small-label">连接说明</span><h4>{contact.from} → {contact.to}</h4><p>{contact.detail}</p>{contact.target && <button className="local-jump" onClick={() => onSelect(contact.target!)}>进入{moduleById[contact.target].name} →</button>}{evidence(contact.evidence)}</section>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </div>;
}
