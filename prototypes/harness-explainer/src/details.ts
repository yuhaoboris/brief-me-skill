import type { Evidence, NodeId } from './content';

type DetailItem = { name: string; summary: string; detail: string; evidence: Evidence[] };
type Flow = { name: string; note: string; steps: DetailItem[]; outcome: string };
type Link = { from: string; verb: string; to: string };
type Contact = { from: string; to: string; carries: string; detail: string; target?: NodeId; evidence: Evidence[] };
export type LocalDetail = {
  lens: string; flows: Flow[]; parts: DetailItem[]; links: Link[];
  structureNote: string; contacts: Contact[];
};
const ev = (quote: string): Evidence[] => [{ source: 'S3', quote }];
const item = (name: string, summary: string, detail: string, quote: string): DetailItem => ({ name, summary, detail, evidence: ev(quote) });
const contact = (from: string, to: string, carries: string, detail: string, quote: string, target?: NodeId): Contact => ({ from, to, carries, detail, target, evidence: ev(quote) });
const runtime = '入口调用 ctx.agents → 已注册 AgentFactory → Agent + Session';
const input = '→ inbox 接收输入\n  → turn / step';
const request = '→ prompt + tool schemas → pre-step / request 扩展点\n  → 绑定模型 adapter，提交已接受输入和请求记录\n  → Session.deriveMessages() → 冻结模型请求 → 消费模型流';
const result = '→ 提交 assistant 消息/失败尝试\n  → 调度工具 → 策略流水线 → 提交工具结果\n  → 下一 step 或 turn/end';
const loopFiles = '前者管运行状态机，后者管工厂、资源所有权、创建与恢复。';
const scheduling = '独占屏障、受限并发池、取消与按模型顺序提交结果，都直接在循环包内部实现。';
const projection = '把提交事件折叠成共享状态；默认循环硬依赖它并注册 turnBoundary';
const scope = '隔离不同 Agent 的工具、提示词贡献和事件；这是库，不是普通服务插件';
const boot = '先 `new Context()`，再 `ctx.plugin(Loader)`，之后挂载配置根并检查条目激活情况。';
const patch = 'bundle 列表 → profile patch → home patch → 调用的 `--patch`';

export const details: Record<NodeId, LocalDetail> = {
  loop: {
    lens: '跟着一次输入，看历史、模型和工具怎样进入循环。',
    flows: [{ name: '一次 turn 内的主路径', note: '含工具调用的简化主路径；无工具调用可直接继续或结束。', steps: [
      item('接收输入', 'inbox → turn / step', '输入先进入 inbox，再由运行状态机组织 turn 与 step。', input),
      item('准备上下文', 'prompt · 工具 schema', '组装提示词和工具 schema，经过 pre-step / request 扩展点。', request),
      item('形成请求', '日志 → 历史 → 冻结', '绑定 adapter，提交已接受输入和请求记录；从 Session 推导消息，再冻结模型请求。', request),
      item('消费模型流', '提交消息或失败尝试', '消费模型返回的流，并把 assistant 消息或失败尝试写入日志。', request + '\n  ' + result.split('\n')[0]),
      item('调度工具', '有调用时：策略 → 执行', '工具调度位于循环内部：控制并发与取消，并按模型顺序提交结果。具体执行经过 Tools 的策略流水线。', scheduling),
      item('继续或结束', '下一 step / turn end', '主路径回到下一 step，或结束本次 turn。原附件未列出全部分支判断条件。', result),
    ], outcome: '工具结果进入日志；后续 step 可据此重新构造请求。' }],
    parts: [
      item('工厂与资源', 'index.ts', '负责创建、恢复和资源所有权；通过 effect 注册 AgentFactory。', loopFiles),
      item('运行状态机', 'agent.ts', '负责 inbox、turn / step、模型流及运行状态。它是循环的执行主体。', '实现创建/恢复、inbox、turn/step、模型流、工具调度和 teardown'),
      item('工具调度', 'tool-calls.ts', '含独占屏障、并发池、取消和结果排序；不是可单独替换的 scheduler 插件。', scheduling),
    ], links: [{ from: '工厂与资源', verb: '创建 / 恢复', to: '运行状态机' }, { from: '运行状态机', verb: '需要工具时进入', to: '工具调度' }],
    structureNote: '按源码职责整理。修改工具调度，可能需要改循环实现。',
    contacts: [
      contact('Agent 注册表', '执行循环的工厂', '创建 / 恢复请求', '调用方使用统一接口；默认循环提供实现。', runtime, 'agent'),
      contact('执行循环', '会话日志', '输入、请求、消息、工具结果', '循环提交运行事实；日志反过来提供下一次模型请求的历史。', request + '\n  ' + result, 'session'),
      contact('会话日志', '执行循环', 'deriveMessages() 的历史', '循环读取投影出的消息，并冻结模型请求。', request, 'session'),
      contact('执行循环', '能力服务', '提示词组装、模型与工具调用', '三项服务各司其职，工具服务与循环还有内部调度协议。', '工具注册、schema、作用域、策略拦截和执行结果处理', 'services'),
      contact('状态投影', '执行循环', '共享状态', '默认循环依赖 sessionProjections，并注册 turnBoundary。', projection, 'state'),
    ],
  },
  boot: {
    lens: '先理解配置怎样组合，再看配置怎样成为运行实例。',
    flows: [
      { name: '配置覆盖顺序', note: '普通 profile；最终还可能加入遥测退出开关 patch。', steps: [
        item('bundle 列表', '从空树开始', '按列表顺序应用 bundle，形成基础插件配置。', patch),
        item('profile patch', '应用形态调整', '在 bundle 组合上叠加 profile 的调整。', patch),
        item('home patch', '用户配置', '继续应用用户 home patch。', patch),
        item('--patch', '本次调用调整', '应用命令传入的 patch；按 id 修改时，整块 config 替换，不是任意深合并。', '按 id patch 时整块 config 替换，而不是任意深合并。'),
      ], outcome: '得到待装配的插件配置树。' },
      { name: '启动装配', note: '来源明确给出的 boot() 顺序。', steps: [
        item('创建 Context', '建立根容器', 'Cordis 运行底座先存在，普通产品插件才可能加载。', boot),
        item('挂载 Loader', '加载配置机制', 'Loader 自身是插件，但先于普通用户配置行挂载。', boot),
        item('挂载配置根', '生成插件实例', '将配置树解析成插件实例，并处理分组与隔离。', '将配置树解析成插件实例、处理分组和隔离'),
        item('检查激活', '检查条目状态', '启动器检查配置条目的激活情况。', boot),
      ], outcome: '配置成为运行中的插件树。' },
    ],
    parts: [
      item('Profile', '选择应用形态', 'web、headless、sdk 等选择不同的 bundle 栈。', '| web | base → web-app |'),
      item('Bundle / Patch', '描述与调整插件树', 'bundle 是组合清单；patch 修改配置。它们不执行 Agent 循环。', '它是**官方组合清单**，不是不可替换的运行内核。'),
      item('Boot / Loader', '创建容器与实例', 'Boot 创建根容器并挂载 Loader；Loader 解析配置树。', boot),
      item('Preset', '单 Agent 能力组合', 'Web 会话预设依赖 host 底座。minimal preset 与 sdk-minimal profile 不是一个层次。', '只改变单 Agent 能力组合'),
    ], links: [{ from: 'Profile', verb: '选择并覆盖', to: 'Bundle / Patch' }, { from: 'Bundle / Patch', verb: '交给', to: 'Boot / Loader' }],
    structureNote: 'Preset 是会话层配置，未画成应用启动流程的下一步。',
    contacts: [contact('启动装配', 'Cordis', '根 Context + 插件配置', 'Boot 使用 Cordis 和 Loader 装配应用。', boot, 'cordis'), contact('Preset', '单 Agent', '工具与说明的组合', '同一 host 可以由 preset 决定单个 Agent 的能力。', '只改变单 Agent 能力组合', 'agent')],
  },
  cordis: {
    lens: '底座把插件连接起来，并管理它们从激活到卸载的生命周期。',
    flows: [{ name: '插件生命周期', note: '模型按原文职责整理的生命周期示意，不是完整调用时序。', steps: [
      item('建立根上下文', '内建服务先存在', 'Context 构造时建立根 Fiber、Reflect、Registry、Events 和 Logger。', '构造函数直接创建根 `Fiber`、`ReflectService`、`RegistryService`、`EventsService` 和 `LoggerService`。'),
      item('注册与注入', '连接提供者与消费者', 'Registry / Service 管理插件入口、服务提供及依赖注入。', '插件入口、服务提供、依赖注入'),
      item('运行与事件', '激活插件、调度事件', 'Fiber / Events 管理激活和事件调度。此处不表示每次事件都重新激活插件。', '激活、卸载、effects 清理、事件调度'),
      item('卸载与清理', '撤销注册、释放资源', 'effect 负责撤销和释放；不保证运行中状态自动迁移。', 'Cordis 的 effect 可以撤销注册和释放资源'),
    ], outcome: '能力可挂载、可撤销；状态迁移需要另外解决。' }],
    parts: [
      item('Context / Reflect', '上下文与服务可见性', '处理容器代理、服务查找、上下文继承与隔离域。', '容器代理、服务查找、上下文继承、隔离域'),
      item('Registry / Service', '注册与依赖', '连接服务提供者和消费者。', '插件入口、服务提供、依赖注入'),
      item('Fiber / Events', '生命周期与事件', '管理插件激活、卸载、effects 清理和事件调度。', '激活、卸载、effects 清理、事件调度'),
    ], links: [{ from: 'Context / Reflect', verb: '根 Context 内建', to: 'Registry / Service' }, { from: 'Context / Reflect', verb: '根 Context 内建', to: 'Fiber / Events' }],
    structureNote: '三组职责协作，箭头表示组成关系。',
    contacts: [contact('Boot / Loader', 'Cordis', '配置解析与插件挂载', '启动器先建立 Context，再挂载 Loader。', boot, 'boot'), contact('Cordis', '产品插件', '解析依赖、事件与清理', '默认循环等产品插件依赖宿主机制运行。', '这套机制先存在，普通产品插件才可能被加载。', 'loop')],
  },
  agent: {
    lens: '调用方使用稳定接口，实际创建和运行交给循环实现。',
    flows: [{ name: '创建或恢复 Agent', note: '前提：已注册工厂。同一 registry 不能同时注册两个工厂。', steps: [
      item('调用 Registry', 'ctx.agents', '入口通过统一注册表发起创建或恢复。', runtime),
      item('委托 Factory', '选择已注册工厂', '没有工厂会报错。默认循环注册自己的工厂。', '未注册工厂会抛出 `no agent factory registered (load an agent-loop plugin)`'),
      item('得到 Agent', '关联 Session', '工厂创建或恢复具体 Agent，随后由该实例执行任务。', runtime),
    ], outcome: '调用者面对 Agent 契约，不直接绑定默认循环的内部实现。' }],
    parts: [
      item('AgentRegistry', '调用入口', '负责接收创建 / 恢复请求，并委托注册工厂。', '把创建/恢复委托给注册的工厂'),
      item('AgentFactory', '实现接缝', '默认循环提供工厂；更换循环要满足这个契约。', '默认循环通过 effect 注册自身'),
      item('Agent', '运行实例的统一接口', '插件通过统一控制接口与实例交互。', '插件使用的统一控制接口；把调用方与具体循环实现分开'),
    ], links: [{ from: 'AgentRegistry', verb: '委托', to: 'AgentFactory' }, { from: 'AgentFactory', verb: '创建 / 恢复', to: 'Agent' }],
    structureNote: 'Registry 是注册层，Factory 是契约接缝，Agent 是实例接口。',
    contacts: [contact('入口 / 调用方', 'AgentRegistry', '创建或恢复请求', '原附件未展开所有 UI 到入口的实现链。', runtime), contact('默认循环', 'AgentRegistry', '注册 AgentFactory', '循环提供工厂，使调用者能通过 Registry 得到 Agent。', '默认循环通过 effect 注册自身', 'loop'), contact('工厂', 'Agent + Session', '实例与日志', '运行实例与会话日志关联，日志支持恢复语义。', runtime, 'session')],
  },
  session: {
    lens: '日志保存运行事实；模型历史与共享状态从这些事实推导。',
    flows: [{ name: '日志怎样进入模型请求', note: '主请求路径；不是磁盘读写流程。', steps: [
      item('提交运行事实', '输入与请求记录', '循环将已接受输入和请求记录提交到 Session。', request),
      item('推导消息', 'deriveMessages()', '从事件日志推导模型可见历史，而不是直接使用任意消息数组。', '它是请求历史的事实基础。'),
      item('冻结模型请求', '交给执行循环', '循环根据日志投影形成并冻结模型请求，再消费模型流。', request),
      item('追加运行结果', '消息 / 工具结果', 'assistant 消息、失败尝试及工具结果继续进入日志，供后续步骤使用。', result),
    ], outcome: '后续请求使用更新后的日志历史。跨进程恢复另需持久化后端。' }],
    parts: [
      item('事件日志', '有序运行事实', '保存消费者依赖的事件顺序与请求记录。', '必须保留事件顺序、消息投影、请求记录和恢复等消费者预期'),
      item('消息投影', '模型可见历史', 'deriveMessages() 为请求提供历史；不是把日志原样发给模型。', '日志决定模型看见什么'),
      item('持久化后端', '跨进程保存与恢复', '新建内存 Agent 可无后端；跨进程 resume 缺少后端会报错。', '**Session 日志必需，不等于落盘必需**'),
    ], links: [{ from: '事件日志', verb: '推导', to: '消息投影' }, { from: '事件日志', verb: '跨进程恢复时依赖', to: '持久化后端' }],
    structureNote: '持久化后端是外接实现，图中展示其与 Session 的组成边界。',
    contacts: [contact('执行循环', 'Session', '运行事件与请求记录', '模型消息、失败尝试和工具结果都参与运行事实记录。', result, 'loop'), contact('Session', '执行循环', '模型请求历史', '循环从 Session 推导消息并冻结请求。', request, 'loop'), contact('已提交事件', 'Projection', '事件序列', 'Projection 折叠提交事件，形成共享状态。', projection, 'state'), contact('Session', '持久化后端', '跨进程恢复用的日志', 'JSONL 是一种可替换的实现，日志语义仍须兼容。', 'Session persistence 后端、兼容的格式与日志')],
  },
  services: {
    lens: '这是三项独立服务的解释分组，各有自己的输入和输出。',
    flows: [
      { name: 'Prompt：组装上下文', note: '按职责整理的输入 / 输出示意。', steps: [
        item('接收贡献', '区段、变量、工具 schema', '提示词由插件提供的贡献共同组成。', '聚合插件提供的提示词区段、变量、工具 schema'),
        item('组装提示词', 'systemPrompt', '为循环构造请求提供系统提示词。', '聚合插件提供的提示词区段、变量、工具 schema'),
      ], outcome: '输出供循环使用的提示词内容。' },
      { name: 'LLM：统一模型调用', note: '简化链路，不展开重试及供应商协议。', steps: [
        item('选择 adapter', '注册与路由', '需要有效模型路由 / adapter；不限定 DeepSeek 官方实现。', '有效模型路由/adapter'),
        item('准备与调用', 'prepared call', '统一请求与流协议，隔离具体模型供应商。', '模型请求与流的统一协议，隔离具体模型供应商'),
        item('返回模型流', '由循环消费', '循环消费模型流并提交运行记录。', request),
      ], outcome: '输出模型流，交给循环继续处理。' },
      { name: 'Tools：处理工具调用', note: '原附件的简化主路径；调度策略由循环内部控制。', steps: [
        item('接收调度', '来自循环', '循环安排独占、并发与取消；Tools 接收工具执行请求。', scheduling),
        item('策略与执行', '作用域 / 拦截 / 结果处理', '注册 schema、作用域和策略参与工具执行管线。', '工具注册、schema、作用域、策略拦截和执行结果处理'),
        item('提交结果', '按模型顺序', '循环按模型顺序提交工具结果，再决定后续 step。', scheduling),
      ], outcome: '输出工具结果；空工具注册表也可满足服务存在的要求。' },
    ],
    parts: [
      item('System Prompt', '提示词服务', '收集和聚合插件贡献的区段、变量、工具 schema。', '聚合插件提供的提示词区段、变量、工具 schema'),
      item('LLM / Adapters', '契约与实现', 'LLM 统一协议；多个模型 adapter 在服务内注册。', 'LLM adapters、工具、prompt sections 等在服务内部注册，可多实例组合。'),
      item('Tools / 工具项', '注册表与具体能力', '服务管理执行管线，具体工具作为注册项提供功能。', 'LLM adapters、工具、prompt sections 等在服务内部注册，可多实例组合。'),
    ], links: [], structureNote: '三个并列服务，不把 Prompt → LLM → Tools 画成必经流水线。',
    contacts: [contact('提示词贡献插件', 'System Prompt', '区段与变量', '服务汇总这些贡献供循环使用。', '聚合插件提供的提示词区段、变量、工具 schema'), contact('执行循环', 'LLM', '模型请求', '模型调用通过 adapter；不是把具体模型供应商写死在循环里。', '模型请求与流的统一协议，隔离具体模型供应商', 'loop'), contact('LLM', '执行循环', '模型流', '循环消费模型流并写入运行记录。', request, 'loop'), contact('执行循环', 'Tools', '工具调用', '双方还有 TOOL_RUNTIME_SCHEDULER 内部阶段协议，替换需要兼容。', '这说明 tools 与默认 loop 存在比一个简单 `execute()` 更强的协议耦合。', 'loop'), contact('Tools', '执行循环', '执行结果', '循环按模型顺序提交结果；具体调度仍属于循环内部。', scheduling, 'loop')],
  },
  state: {
    lens: 'Projection 推导状态，Scope 隔离可见性。两者不是先后步骤。',
    flows: [
      { name: 'Projection：事件变为状态', note: '来源明确描述的投影关系，未展开更新时机。', steps: [
        item('提交事件', '来自会话运行', '投影消费提交事件。原附件未展开全部事件类型。', projection),
        item('折叠事件', 'sessionProjections', '将事件折叠成共享状态。', projection),
        item('提供状态', '如 turnBoundary', '默认循环依赖投影服务并注册 turnBoundary。', projection),
      ], outcome: '得到由运行事实推导的状态。' },
      { name: 'Scope：限制可见范围', note: '模型按职责整理的示意，不是库 API 的精确调用链。', steps: [
        item('按作用域注册', '工具与提示词贡献', '不同 Agent 的贡献保持各自的注册范围。', scope),
        item('按作用域路由', '可见性与事件', 'Scope 控制注册 / 依赖可见性及事件隔离。', '`scope/isolate` 解决注册与依赖可见性'),
      ], outcome: '避免不同 Agent 的注册与事件混在一起；不提供操作系统沙箱。' },
    ],
    parts: [
      item('Projection 服务', 'ctx.sessionProjections', '事件 → 折叠 → 共享状态。默认循环的六项依赖之一。', projection),
      item('Scope 库', 'scoped registration / routing', '隔离 Agent 工具、提示词贡献和事件。它是库，不是服务插件。', scope),
    ], links: [], structureNote: '两项独立机制按职责放在一起；没有来源支持它们直接调用彼此。',
    contacts: [contact('会话提交事件', 'Projection', '事件输入', '由提交事件形成共享状态。', projection, 'session'), contact('Projection', '执行循环', '状态与 turnBoundary', '默认循环使用投影服务。', projection, 'loop'), contact('Scope', '工具 / 提示词 / 事件', '作用域限制', '限制不同 Agent 的注册与事件范围，具体 API 链仍未展开。', scope, 'services')],
  },
};
