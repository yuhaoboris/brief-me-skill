import { useEffect, useReducer, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Disclosure, DisclosureButton, DisclosurePanel, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { modules, moduleById, relations, navigate, sourceNames, threadUrl, type Evidence, type NodeId, type Selection } from './content';
import source from '../source.json';

declare const __EDITION__: { id: string; date: string; changes: string; previous: { id: string; date: string; changes: string }[] };

function Icon({ name, className = '' }: { name: 'arrow' | 'back' | 'close' | 'plus' | 'layers' | 'book' | 'out'; className?: string }) {
  const paths = {
    arrow: 'M4 12h15m-6-6 6 6-6 6', back: 'M19 12H4m6-6-6 6 6 6',
    close: 'm6 6 12 12M6 18 18 6', plus: 'M5 12h14M12 5v14',
    layers: 'm3 7 9-4 9 4-9 4-9-4Zm0 5 9 4 9-4M3 17l9 4 9-4',
    book: 'M12 5v15M3 4c4-1 7 0 9 2 2-2 5-3 9-2v14c-4-1-7 0-9 2-2-2-5-3-9-2V4Z',
    out: 'M14 4h6v6m0-6-11 11M10 4H4v16h16v-6',
  };
  return <svg className={`icon ${className}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

function EvidenceBlock({ items, onOpenSources }: { items: Evidence[]; onOpenSources: () => void }) {
  return <Disclosure as="div" className="disclosure">
    <DisclosureButton className="disclosure-trigger group"><span><Icon name="book" />查看原文依据</span><Icon name="plus" className="group-data-open:rotate-45" /></DisclosureButton>
    <DisclosurePanel className="evidence-panel">
      {items.map((item, i) => <figure key={i} className="evidence-item"><figcaption>{item.source} · {sourceNames[item.source]}</figcaption><blockquote>{item.quote.replaceAll('**', '')}</blockquote></figure>)}
      <button className="text-link mt-3" onClick={onOpenSources}>阅读完整来源 <Icon name="out" /></button>
    </DisclosurePanel>
  </Disclosure>;
}

function App() {
  const [reading, dispatch] = useReducer(navigate, { selection: null, history: [] });
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [sourceTab, setSourceTab] = useState(0);
  const detailTitle = useRef<HTMLHeadingElement>(null);
  const didSelect = useRef(false);
  const selected = reading.selection;
  const selectedModule = selected?.kind === 'module' ? moduleById[selected.id as NodeId] : undefined;
  const selectedRelation = selected?.kind === 'relation' ? relations.find(r => r.id === selected.id) : undefined;
  const linked = new Set<NodeId>();
  if (selectedModule) {
    linked.add(selectedModule.id);
    if (selectedModule.id === 'cordis') modules.filter(m => m.id !== 'boot').forEach(m => linked.add(m.id));
    relations.filter(r => r.from === selectedModule.id || r.to === selectedModule.id).forEach(r => { linked.add(r.from); linked.add(r.to); });
  }
  if (selectedRelation) { linked.add(selectedRelation.from); linked.add(selectedRelation.to); }
  const select = (next: Selection) => { didSelect.current = true; dispatch({ type: 'select', selection: next }); };
  useEffect(() => {
    if (!didSelect.current) return;
    detailTitle.current?.focus({ preventScroll: true });
    if (window.matchMedia('(max-width: 760px)').matches) detailTitle.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [selected]);
  const openSources = (tab = 0) => { setSourceTab(tab); setSourcesOpen(true); };
  const isRelationLit = (id: string) => {
    const r = relations.find(r => r.id === id)!;
    return selectedRelation ? r.id === selectedRelation.id : !!selectedModule && (r.from === selectedModule.id || r.to === selectedModule.id);
  };

  function NodeButton({ id, mobile = false }: { id: NodeId; mobile?: boolean }) {
    const m = moduleById[id];
    const rect = m.rect;
    const focused = selected?.kind === 'module' && selected.id === id;
    const faded = !!selected && !linked.has(id);
    return <button aria-label={`查看${m.name}`} aria-pressed={focused}
      className={`map-node ${id === 'loop' ? 'loop-node' : ''} ${focused ? 'is-selected' : ''} ${faded ? 'is-muted' : ''} ${mobile ? 'mobile-node' : ''}`}
      style={!mobile && rect ? { left: `${rect[0] / 8}%`, top: `${rect[1] / 5.4}%`, width: `${rect[2] / 8}%`, height: `${rect[3] / 5.4}%` } : undefined}
      onClick={() => select({ kind: 'module', id })}>
      <span className="node-name">{m.name}</span>
      <span className="node-english">{m.english}</span>
      <span className="node-short">{m.short}</span>
    </button>;
  }

  return <>
    <a href="#overview" className="skip-link">跳到架构总览</a>
    <header className="site-header">
      <div className="brand"><span className="brand-mark"><Icon name="layers" /></span><span>brief-me</span><span className="header-slash">/</span><span className="header-label">架构解释</span></div>
      <button className="quiet-button" onClick={() => openSources()}><Icon name="book" />来源与版本</button>
    </header>
    <main>
      <section className="hero">
        <div><p className="eyebrow"><span className="tiny-line" />交互样本 · {__EDITION__.id}</p><h1>DeepSeek Harness 的核心结构</h1><p className="hero-description">底座承载插件，装配选择组合，循环协调执行。</p></div>
        <div className="hero-aside"><span>本页要讲清</span><p>有什么 · 各做什么 · 怎样连接</p></div>
      </section>

      <div className="workspace">
        <section className="map-panel" aria-labelledby="overview" id="overview-section">
          <div className="panel-bar"><h2 id="overview">整体关系</h2><button className="reset-button" disabled={!selected} onClick={() => { didSelect.current = true; dispatch({ type: 'reset' }); }}><Icon name="back" />回到总览</button></div>
          <div className="desktop-map" aria-label="架构关系图">
            <div className="foundation" />
            <svg className="connections" viewBox="0 0 800 540" aria-hidden="true">
              <defs><marker id="arrow-normal" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#8d9e99" /></marker><marker id="arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#177362" /></marker></defs>
              {relations.map(r => <path key={r.id} d={r.path} className={`connection ${isRelationLit(r.id) ? 'connection-active' : ''} ${selected && !isRelationLit(r.id) ? 'connection-muted' : ''}`} markerEnd={`url(#arrow-${isRelationLit(r.id) ? 'active' : 'normal'})`} />)}
            </svg>
            <button className={`foundation-title ${selected?.id === 'cordis' ? 'foundation-selected' : ''}`} aria-label="查看插件运行底座" aria-pressed={selected?.kind === 'module' && selected.id === 'cordis'} onClick={() => select({ kind: 'module', id: 'cordis' })}><span className="foundation-symbol"><Icon name="layers" /></span><span><strong>Cordis</strong><span>插件运行底座</span></span><Icon name="arrow" /></button>
            {modules.filter(m => m.rect).map(m => <NodeButton key={m.id} id={m.id} />)}
            {relations.map(r => <button key={r.id} className={`edge-label ${isRelationLit(r.id) ? 'edge-active' : ''}`} style={{ left: `${r.at[0] / 8}%`, top: `${r.at[1] / 5.4}%` }} aria-label={`查看关系：${r.name}`} aria-pressed={selected?.kind === 'relation' && selected.id === r.id} onClick={() => select({ kind: 'relation', id: r.id })}>{r.label}</button>)}
            <p className="foundation-caption">框内模块由 Cordis 承载 · 按职责分组</p>
          </div>

          <div className="mobile-map" aria-label="紧凑架构总览">
            <NodeButton id="boot" mobile />
            <button className="mobile-assemble text-link" onClick={() => select({ kind: 'relation', id: 'assemble' })}>装配插件 ↓</button>
            <div className="mobile-foundation"><button className="mobile-foundation-title" onClick={() => select({ kind: 'module', id: 'cordis' })}><Icon name="layers" />Cordis · 插件运行底座 <Icon name="arrow" /></button><div className="mobile-grid">{modules.filter(m => m.id !== 'boot' && m.id !== 'cordis').map(m => <NodeButton key={m.id} id={m.id} mobile />)}</div></div>
            <div className="mobile-relations"><p className="small-label">关键连接</p>{relations.filter(r => r.id !== 'assemble').map(r => <button key={r.id} onClick={() => select({ kind: 'relation', id: r.id })}><span>{moduleById[r.from].name}</span><span className="mobile-relation-label">{r.label} →</span><span>{moduleById[r.to].name}</span></button>)}</div>
          </div>
          <div className="map-footer"><span><i className="legend-dot" />主要职责与关系</span><span>选择模块或连线，查看解释</span></div>
        </section>

        <aside className="detail-panel" aria-label="局部解释">
          <div className="detail-nav"><span className="small-label">{selected ? (selected.kind === 'module' ? '模块' : '关系') : '阅读起点'}</span>{reading.history.length > 0 && <button aria-label="返回上一处" className="text-link" onClick={() => dispatch({ type: 'back' })}><Icon name="back" />上一处</button>}</div>
          <div key={selected ? `${selected.kind}-${selected.id}` : 'overview'}>
            {!selected && <>
              <h2 ref={detailTitle} tabIndex={-1} className="detail-title">先抓住三件事</h2>
              <div className="overview-steps">
                <button onClick={() => select({ kind: 'module', id: 'cordis' })}><span className="step-number">1</span><span><strong>底座让插件能运行</strong><span>注册、事件和生命周期。</span></span><Icon name="arrow" /></button>
                <button onClick={() => select({ kind: 'module', id: 'loop' })}><span className="step-number">2</span><span><strong>循环把服务接起来</strong><span>使用历史，协调模型与工具。</span></span><Icon name="arrow" /></button>
                <button onClick={() => select({ kind: 'module', id: 'boot' })}><span className="step-number">3</span><span><strong>装配决定能力组合</strong><span>应用配置与会话预设各有范围。</span></span><Icon name="arrow" /></button>
              </div>
              <div className="takeaway"><span className="small-label">理解这点就有了主线</span><p>核心可以插件化。<br /><strong>核心职责仍然不能缺。</strong></p></div>
              <p className="detail-footnote">这张图解释职责与依赖，不表示执行顺序。</p>
            </>}
            {selectedModule && <>
              <p className="detail-english">{selectedModule.english}</p>
              <h2 ref={detailTitle} tabIndex={-1} className="detail-title">{selectedModule.name}</h2>
              <p className="detail-description">{selectedModule.description}</p>
              {selectedModule.parts && <div className="parts-list">{selectedModule.parts.map(p => <div key={p.name}><strong>{p.name}</strong><p>{p.description}</p></div>)}</div>}
              <div className="related-list"><h3>它和谁相连</h3>{selectedModule.id === 'cordis' && <p className="muted-note">图中框内的模块都由 Cordis 承载。</p>}{relations.filter(r => r.from === selectedModule.id || r.to === selectedModule.id).map(r => <button key={r.id} onClick={() => select({ kind: 'relation', id: r.id })}><span>{r.name}</span><Icon name="arrow" /></button>)}</div>
              <div className="boundary"><h3>需要分清</h3><p>{selectedModule.boundary}</p></div>
              <EvidenceBlock items={selectedModule.evidence} onOpenSources={() => openSources()} />
            </>}
            {selectedRelation && <>
              <p className="detail-english">{moduleById[selectedRelation.from].english} → {moduleById[selectedRelation.to].english}</p>
              <h2 ref={detailTitle} tabIndex={-1} className="detail-title relation-title">{selectedRelation.name}</h2>
              <p className="detail-description">{selectedRelation.description}</p>
              <div className="relation-endpoints"><button onClick={() => select({ kind: 'module', id: selectedRelation.from })}>{moduleById[selectedRelation.from].name}<Icon name="arrow" /></button><button onClick={() => select({ kind: 'module', id: selectedRelation.to })}>{moduleById[selectedRelation.to].name}<Icon name="arrow" /></button></div>
              <div className="boundary"><h3>解释范围</h3><p>{selectedRelation.boundary}</p></div>
              <EvidenceBlock items={selectedRelation.evidence} onOpenSources={() => openSources()} />
            </>}
          </div>
        </aside>
      </div>

      <footer className="page-footer"><span>依据：两轮讨论 · 源码版本 <code>c291e7961a</code></span><button className="text-link" onClick={() => openSources()}>来源、推断与未知 <Icon name="out" /></button></footer>
    </main>

    <Dialog open={sourcesOpen} onClose={setSourcesOpen} className="source-dialog">
      <DialogBackdrop className="dialog-backdrop" />
      <div className="dialog-position"><DialogPanel className="dialog-panel">
        <div className="dialog-heading"><div><p className="eyebrow">解释依据</p><DialogTitle>来源与版本</DialogTitle></div><button className="close-button" aria-label="关闭来源与版本" onClick={() => setSourcesOpen(false)}><Icon name="close" /></button></div>
        <TabGroup selectedIndex={sourceTab} onChange={setSourceTab}>
          <TabList className="tabs"><Tab className="tab">来源与边界</Tab><Tab className="tab">版本记录</Tab></TabList>
          <TabPanels>
            <TabPanel className="source-body">
              <a href={threadUrl} className="source-thread"><Icon name="book" /><span>分析 DeepSeek Harness 核心插件</span><Icon name="out" /></a>
              <p className="source-scope">基于两轮回答整理。原分析对应 <code>c291e7961a</code>，未运行真实模型或最小启动实验。本稿未重新核验源码。</p>
              <div className="provenance-row"><span className="status status-source">原文依据</span><p>模块职责、服务依赖及替换边界，均可展开查看摘录。</p></div>
              <div className="provenance-row"><span className="status status-inference">模型整理</span><p>原文开头的箭头含义不明。本稿将其理解为职责层次，并为每条连接写明含义；这项解释尚未经用户确认。</p></div>
              <div className="provenance-row"><span className="status status-unknown">仍未明确</span><p>UI 如何调用循环、Scope 的完整连接、循环内部的精确时序。本稿保留这些缺口。</p></div>
              <div className="source-accordions">{source.turns.map((turn, i) => <Disclosure as="div" className="disclosure" key={turn.id}><DisclosureButton className="disclosure-trigger group"><span>S{i + 1} · {i === 0 ? '架构分析' : '使用解释'}原文</span><Icon name="plus" className="group-data-open:rotate-45" /></DisclosureButton><DisclosurePanel><pre className="source-original">{turn.answer}</pre></DisclosurePanel></Disclosure>)}</div>
            </TabPanel>
            <TabPanel className="source-body">
              <div className="version-item"><span className="status status-source">当前 · {__EDITION__.id}</span><time>{__EDITION__.date}</time><p>{__EDITION__.changes}</p></div>
              {__EDITION__.previous.length ? __EDITION__.previous.map(v => <div className="version-item" key={v.id}><span className="status status-unknown">{v.id}</span><time>{v.date}</time><p>{v.changes}</p></div>) : <p className="source-scope">这是首稿，暂无更早版本。</p>}
              <p className="muted-note">再次主动调用时更新这份解释稿，同时保存旧版。需要恢复时，在对话中指定版本。</p>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </DialogPanel></div>
    </Dialog>
  </>;
}

createRoot(document.getElementById('root')!).render(<App />);
