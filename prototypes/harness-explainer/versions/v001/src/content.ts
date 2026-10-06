export type Evidence = { source: 'S1' | 'S2'; quote: string };
export type NodeId = 'boot' | 'cordis' | 'agent' | 'loop' | 'session' | 'services' | 'state';
export type Module = {
  id: NodeId; number: string; name: string; english: string; short: string;
  description: string; boundary: string; evidence: Evidence[];
  parts?: { name: string; description: string }[];
  rect?: [number, number, number, number];
};
export const modules: Module[] = [
  { id: 'boot', number: '01', name: '启动装配', english: 'Boot · Loader',
    short: '按配置组织插件', description: '创建容器，再把配置变成运行中的插件树。',
    boundary: 'bundle 是组合清单。preset 决定会话能力。它们都不是执行循环。',
    parts: [
      { name: 'profile', description: '选择应用形态，如 web、headless。' },
      { name: 'bundle / patch', description: '组合、调整插件配置。' },
      { name: 'preset', description: '为单个会话选择工具和说明。' },
    ],
    evidence: [
      { source: 'S1', quote: '创建容器，将 profile、bundle、patch 转换为运行中的插件树' },
      { source: 'S2', quote: '单个会话使用哪些工具和说明' },
    ], rect: [290, 14, 220, 80] },
  { id: 'cordis', number: '02', name: '插件运行底座', english: 'Cordis',
    short: '承载图中的运行模块', description: '负责服务解析、插件注册、事件和生命周期。',
    boundary: '插件能替换，是因为仍遵守这套运行机制。卸载插件不等于无损迁移状态。',
    evidence: [{ source: 'S1', quote: 'Context、服务解析、插件注册、事件、生命周期和资源清理；所有产品插件依赖这套机制' }] },
  { id: 'agent', number: '03', name: 'Agent 接口', english: 'Registry · Factory',
    short: '通过工厂创建 Agent', description: '统一控制接口。注册表使用工厂创建或恢复 Agent。',
    boundary: '接口不负责执行任务。默认循环提供工厂；其他实现必须满足相同契约。',
    evidence: [{ source: 'S1', quote: 'AgentRegistry 通过注册的 AgentFactory 创建/恢复 Agent；默认循环提供该工厂。' }],
    rect: [40, 217, 180, 90] },
  { id: 'loop', number: '04', name: '执行循环', english: 'Agent Loop',
    short: '协调模型与工具', description: '接收输入，处理模型输出，调度工具，控制任务退出。',
    boundary: '保留默认循环，就要保留它依赖的服务。服务实现可以换，职责不能空缺。',
    parts: [
      { name: '依赖六项服务', description: 'agents、sessions、llm、tools、systemPrompt、sessionProjections。' },
      { name: '内部工具调度', description: '并发、取消和结果顺序位于循环内部。' },
    ],
    evidence: [
      { source: 'S1', quote: "'agents', 'sessions', 'llm'," },
      { source: 'S1', quote: "'tools', 'systemPrompt', 'sessionProjections'" },
      { source: 'S1', quote: '这些服务的**实现可以换，保留默认循环时却不能把提供者全部删掉**。' },
    ], rect: [295, 209, 210, 106] },
  { id: 'session', number: '05', name: '会话日志', english: 'Session',
    short: '记录事件，提供历史', description: '保存事件日志，并从日志推导模型可见的历史。',
    boundary: '内存日志是默认循环的依赖。跨进程恢复需要落盘；JSONL 只是后端的一种实现。',
    evidence: [
      { source: 'S1', quote: '该项目从 Session 日志推导模型请求历史，默认循环据此构造并冻结请求。' },
      { source: 'S1', quote: '**Session 落盘后端**：新建内存 Agent 可以没有；跨进程恢复需要。' },
    ], rect: [580, 217, 180, 90] },
  { id: 'services', number: '06', name: '能力服务', english: 'LLM · Tools · Prompt',
    short: '模型调用、工具与提示词', description: '为循环提供三项服务。这里按职责合并展示。',
    boundary: 'LLM 服务需要有效 adapter。工具注册表可以没有具体工具。Web UI、skills 和定时任务并非每次模型交互都需要。',
    parts: [
      { name: 'LLM', description: '注册 adapter，调用模型。' },
      { name: 'Tools', description: '注册工具，执行工具调用。' },
      { name: 'System Prompt', description: '组装系统提示词。' },
    ],
    evidence: [
      { source: 'S1', quote: '工具执行管线、提示词组装、模型 adapter 注册与调用' },
      { source: 'S1', quote: '默认循环需要工具注册表，但可以没有具体工具；需要 LLM 服务与有效 adapter，但不必使用 DeepSeek 官方 adapter' },
    ], rect: [95, 385, 245, 99] },
  { id: 'state', number: '07', name: '状态与作用域', english: 'Projection · Scope',
    short: '投影状态，隔离 Agent', description: 'Projection 提供事件状态投影。Scope 负责 Agent 注册与事件隔离。',
    boundary: '图中的“投影”连接只指 Projection。Scope 的具体连接未在原讨论中展开；作用域隔离不等于安全沙箱。',
    evidence: [
      { source: 'S1', quote: '事件状态投影，以及不同 Agent 的注册与事件隔离' },
      { source: 'S1', quote: '作用域隔离也不等于操作系统安全沙箱。' },
    ], rect: [460, 385, 245, 99] },
];

export type Relation = {
  id: string; from: NodeId; to: NodeId; label: string; name: string;
  description: string; boundary: string; evidence: Evidence[];
  path: string; at: [number, number];
};
export const relations: Relation[] = [
  { id: 'assemble', from: 'boot', to: 'cordis', label: '装配', name: '配置 → 运行中的插件',
    description: '启动模块创建容器，再把 profile、bundle 和 patch 转成插件树。',
    boundary: '这条连接表达装配关系。图的上下位置不代表完整执行时序。',
    evidence: [{ source: 'S1', quote: '创建容器，将 profile、bundle、patch 转换为运行中的插件树' }],
    path: 'M400 94 L400 145', at: [400, 120] },
  { id: 'create', from: 'agent', to: 'loop', label: '创建', name: '注册表 → 工厂 → Agent',
    description: 'Registry 通过 Factory 创建或恢复 Agent。默认循环提供这个工厂。',
    boundary: '消费者依赖 Agent 接口。换循环时，仍须提供符合契约的工厂。',
    evidence: [{ source: 'S1', quote: 'AgentRegistry 通过注册的 AgentFactory 创建/恢复 Agent；默认循环提供该工厂。' }],
    path: 'M220 262 L295 262', at: [257, 262] },
  { id: 'history', from: 'session', to: 'loop', label: '历史', name: '会话日志 → 模型请求历史',
    description: 'Session 从事件日志推导历史。循环使用这份历史构造模型请求。',
    boundary: 'Session 还约束恢复、分叉和状态投影，不能只当成消息数组。',
    evidence: [{ source: 'S1', quote: '该项目从 Session 日志推导模型请求历史，默认循环据此构造并冻结请求。' }],
    path: 'M580 262 L505 262', at: [542, 262] },
  { id: 'services', from: 'loop', to: 'services', label: '调用', name: '执行循环 → 能力服务',
    description: '循环依赖模型、工具和提示词服务。这三项服务共同支撑任务执行。',
    boundary: '原文未给出完整内部调用顺序。图只表达职责与依赖。',
    evidence: [{ source: 'S1', quote: "'tools', 'systemPrompt', 'sessionProjections'" }, { source: 'S1', quote: "'agents', 'sessions', 'llm'," }],
    path: 'M355 315 C355 350 218 345 218 385', at: [282, 350] },
  { id: 'projection', from: 'state', to: 'loop', label: '投影', name: '状态投影 → 执行循环',
    description: '默认循环依赖 sessionProjections 服务。它提供事件的状态投影。',
    boundary: '原讨论未展开投影的精确调用时机，也未说明 Scope 与循环的完整连接。',
    evidence: [{ source: 'S1', quote: "'tools', 'systemPrompt', 'sessionProjections'" }, { source: 'S1', quote: '事件状态投影，以及不同 Agent 的注册与事件隔离' }],
    path: 'M582 385 C582 345 445 350 445 315', at: [517, 350] },
];

export const moduleById = Object.fromEntries(modules.map(m => [m.id, m])) as Record<NodeId, Module>;
export const sourceNames = { S1: '架构分析', S2: '使用解释' };
export const threadUrl = 'codex://threads/01a08e14-0a4a-7bf0-a004-b21d66401809';

export type Selection = { kind: 'module' | 'relation'; id: string } | null;
export type ReadingState = { selection: Selection; history: Selection[] };
export function navigate(state: ReadingState, action: { type: 'select'; selection: Selection } | { type: 'back' } | { type: 'reset' }): ReadingState {
  if (action.type === 'back') return state.history.length ? { selection: state.history.at(-1)!, history: state.history.slice(0, -1) } : state;
  if (action.type === 'reset') return { selection: null, history: [] };
  if (JSON.stringify(state.selection) === JSON.stringify(action.selection)) return state;
  return { selection: action.selection, history: [...state.history, state.selection] };
}
