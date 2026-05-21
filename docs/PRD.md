# AI 小镇解谜游戏需求文档

## 1. 项目背景

AI 小镇是一款文本优先的 AI 解谜游戏。玩家以外来调查者的身份进入小镇，围绕一桩核心谜案展开调查：通过探索地点、盘问 NPC、收集线索、比对证词和推理真相，最终提交自己的结论。

小镇中生活着一组由 AI 驱动的 NPC。每个 NPC 都有自己的性格、关系、记忆、目标、秘密和可被追问的证词。AI 的核心价值不是随机生成剧情，而是让 NPC 在固定谜案框架内以自然、可信的方式回应玩家调查，并根据玩家已掌握的线索逐步暴露矛盾。

第一版应足够小，可以快速做出完整可玩的解谜闭环；同时结构要清晰，方便后续扩展更多案件、谜题类型、证据系统、地图探索和多结局叙事。

## 2. 产品目标

构建一个可玩的解谜 MVP，使系统具备以下能力：

- 小镇拥有一组固定地点，每个地点可以发现线索。
- 游戏包含一个明确的主线谜案、关键嫌疑人、真相和结局判定。
- NPC 可以根据性格、记忆、关系和隐瞒动机回答玩家问题。
- 玩家可以收集证据、标记线索、对照证词并形成推理。
- 系统会记录调查日志，并在玩家提交结论时判定推理是否成立。

MVP 的核心目标不是做复杂模拟，而是让玩家完成一次有明确谜面、调查过程、推理压力和结局反馈的解谜体验。

## 3. 目标用户

- 喜欢侦探、悬疑、密室、叙事解谜和互动小说的玩家。
- 想学习 AI 应用开发的开发者。
- 想探索 LLM Agent、记忆系统、证词约束和交互式推理玩法的构建者。

## 4. MVP 范围

### 4.1 主线谜案

MVP 只实现一个案件：“镇公所失踪账本案”。

案件基础设定：

- 镇公所一本记录小镇拨款和旧工程费用的账本失踪。
- 账本最后一次被看到是在镇公所档案室。
- 多名 NPC 都有接触账本的机会，也都有隐瞒部分事实的理由。
- 玩家需要找出账本被谁拿走、动机是什么、账本现在在哪里。

案件必须包含：

- 明确真相
- 3 到 5 个嫌疑 NPC
- 至少 8 条可收集线索
- 至少 3 条误导线索
- 至少 3 组证词矛盾
- 一个最终推理提交入口

### 4.1.1 案件包

游戏内容以“案件包”为单位组织。每个案件包是一组可编辑 JSON 配置文件，描述一个独立案件的地点、NPC、线索、话题、阶段和标准答案。

MVP 内置一个案件包：

```text
cases/
  missing-ledger/
    manifest.json
    case.json
    locations.json
    npcs.json
    clues.json
    topics.json
    stages.json
    truth.json
```

案件包要求：

- `manifest.json` 保存案件元信息，例如案件 ID、标题、作者、版本、入口文件和最低 App 版本。
- `case.json` 保存案件简报、目标、嫌疑人列表和推荐流程。
- `locations.json` 保存地点和可调查对象。
- `npcs.json` 保存 NPC 资料、已知事实、隐瞒事实、说谎边界和初始关系。
- `clues.json` 保存物证、证词、环境线索和推理线索。
- `topics.json` 保存可追问话题、触发条件和透露内容。
- `stages.json` 保存上午、下午、傍晚等调查阶段配置。
- `truth.json` 保存标准答案、关键证据和评分要点。

案件包只定义不可变内容。玩家是否发现线索、是否问过某个话题、NPC 是否已经透露某个事实，都属于玩家进度，写入 SQLite。

### 4.1.2 首案完整谜题设计

“镇公所失踪账本案”的标准真相：

- 真凶：镇长。
- 动机：账本记录了旧桥修缮款被挪用的证据，镇长担心记者公开此事。
- 作案过程：镇长在傍晚前借口整理档案进入镇公所档案室，用备用钥匙打开柜门，取走账本后撕下涉及旧桥款项的一页，将账本藏到图书馆旧报纸合订本后的暗格中。
- 账本位置：图书馆旧报纸架后的暗格。
- 关键证据：备用钥匙使用记录、被撕下的半张账页、图书馆旧报纸架灰尘断痕、镇长与记者的争执证词、咖啡杯印时间矛盾。

首案 NPC 设定：

- 镇长 周启明：表面稳重、强调秩序，真凶。知道账本内容会暴露挪用款项。初期说自己整晚在镇公所会议室，后期会在钥匙记录和记者证词压力下改口。
- 记者 许闻：敏锐、急躁，正在调查旧桥修缮款。知道镇长害怕账本曝光，但隐瞒自己曾私下翻看档案。
- 图书管理员 林澈：谨慎、记忆力好。知道镇长傍晚来过图书馆旧报纸区，但因为担心卷入政治麻烦，初期只说见过“一个熟人”。
- 咖啡馆老板 沈岚：圆滑、善观察。知道镇长案发前来过咖啡馆并带走一杯黑咖啡。会提供咖啡杯印线索，但误导玩家怀疑记者。
- 医生 白砚：冷静、克制。知道记者案发前手腕受伤，伤口来自档案柜边缘。医生不是犯人，但他的证词能证明记者确实接触过档案柜，形成误导。

首案核心线索：

- `clue_torn_ledger_page`：半张被撕下的账页，指向旧桥修缮款。
- `clue_spare_key_log`：档案室备用钥匙使用记录，显示镇长借过钥匙。
- `clue_coffee_stain`：档案柜旁的黑咖啡杯印，杯底纹路来自咖啡馆。
- `clue_library_dust_gap`：图书馆旧报纸架灰尘断痕，说明有人近期挪动过合订本。
- `clue_reporter_wrist`：记者手腕划伤，证明记者接触过档案柜，属于误导线索。
- `clue_mayor_reporter_argument`：镇长和记者在广场争执的证词。
- `clue_archive_schedule`：镇公所档案室登记表，证明镇长有进入时间窗口。
- `clue_old_bridge_article`：旧桥事故报道，解释账本内容的重要性。
- `clue_librarian_partial_sighting`：图书管理员看到镇长进入旧报纸区。
- `clue_cafe_receipt_time`：咖啡馆收据时间，打破镇长“整晚开会”的说法。

首案误导线索：

- 记者手腕划伤让玩家怀疑记者偷账本。
- 咖啡杯印让玩家先怀疑咖啡馆老板协助作案。
- 图书管理员初期含糊证词让玩家怀疑其藏匿账本。

首案证词矛盾：

- 镇长说整晚在会议室，但咖啡馆收据和备用钥匙记录证明他离开过。
- 记者说没有进入档案室，但医生证词和手腕伤口证明他接触过档案柜。
- 图书管理员说没看清来人，但旧报纸区借阅记录和后续追问可证明他认出了镇长。

第一阶段优先把这些线索、证词和矛盾做扎实，确保不依赖 NPC 即兴发挥也能完成推理闭环。

### 4.2 小镇地点

MVP 小镇包含 5 个地点：

- 小镇广场
- 咖啡馆
- 诊所
- 图书馆
- 镇公所

每个地点包含：

- 名称
- 简短描述
- 可调查对象
- 可发现线索
- 当前在该地点的 NPC
- 与案件相关的环境细节

### 4.3 NPC

MVP 包含 5 个 NPC：

- 咖啡馆老板
- 医生
- 图书管理员
- 记者
- 镇长

每个 NPC 包含：

- 姓名
- 职业或身份
- 性格特征
- 当前所在地点
- 公开资料
- 案发时间线证词
- 已知事实
- 隐瞒事实
- 说谎边界
- 与其他 NPC 的关系
- 对玩家的信任度

NPC 不应自由改写案件真相。AI 可以生成自然语言表达，但必须受结构化案件事实约束。

### 4.4 线索与证据

线索是解谜游戏的核心实体。MVP 线索分为：

- 物证：例如钥匙、账页、杯印、借阅记录。
- 证词：NPC 对某个时间、地点或人物的说法。
- 环境线索：地点中的异常细节。
- 推理线索：由两条或多条线索组合后解锁的结论。

每条线索包含：

- 标题
- 描述
- 来源
- 关联地点
- 关联 NPC
- 重要程度
- 是否关键线索
- 是否误导线索
- 可解锁的追问话题

### 4.5 谜题类型

MVP 至少包含以下 3 类谜题：

- 搜查谜题：玩家在地点中选择调查对象，发现物证或环境线索。
- 对话谜题：玩家根据已掌握线索追问 NPC，逼近证词矛盾。
- 推理谜题：玩家组合线索，回答“谁、为什么、怎么做、证据是什么”。

第一版不要求复杂机关、密码盘或物品合成。重点是信息型解谜和证词推理。

### 4.6 时间系统

游戏采用调查阶段推进，不使用开放式每日模拟作为核心循环。

MVP 包含 3 个调查阶段：

1. 上午：玩家初步了解案件，发现基础线索。
2. 下午：NPC 证词出现矛盾，开放追问和二次调查。
3. 傍晚：玩家整理证据，提交最终推理。

阶段推进规则：

- 玩家完成关键调查动作后可以进入下一阶段。
- 阶段推进会改变 NPC 所在位置、可问话题和可发现线索。
- 错过的关键线索不应永久丢失，避免玩家陷入死局。
- 非关键线索可以因阶段变化而改变获取方式。

### 4.7 玩家交互

玩家可以：

- 查看案件目标。
- 查看小镇地点。
- 调查地点中的对象。
- 查看 NPC 公开资料。
- 与 NPC 对话和追问。
- 查看线索板。
- 将线索标记为重要、可疑或已解释。
- 组合线索生成推理笔记。
- 推进调查阶段。
- 提交最终结论。

玩家对话时：

- NPC 应保持人设一致。
- NPC 只能基于案件事实、记忆和当前信任度透露信息。
- 玩家持有相关线索时，可以解锁更深入的追问。
- NPC 可以回避、撒谎或转移话题，但不能突破预设真相。
- 关键证词变化必须写入调查日志。

### 4.8 调查日志

系统需要记录重要调查事件：

- 玩家发现线索
- 玩家询问 NPC
- NPC 提供证词
- 玩家指出矛盾
- 新追问话题解锁
- 阶段推进
- 玩家形成推理
- 最终结论提交

调查日志既要方便玩家回看，也要能作为后续 AI 调用的上下文。

### 4.9 最终推理与结局

玩家在傍晚阶段可以提交最终推理。

最终推理至少包含：

- 谁拿走了账本
- 动机是什么
- 作案过程是什么
- 账本现在在哪里
- 支撑结论的关键证据

系统根据标准答案进行评分：

- 真凶判断
- 动机判断
- 作案过程判断
- 账本位置判断
- 证据链完整度

评分方式允许语义相似判定。玩家不需要逐字匹配标准答案，但必须在含义上覆盖关键事实和证据链。系统可以使用结构化字段匹配作为基础，再由 AI 辅助判断自由文本答案是否等价。

结局反馈分为：

- 完美破解：全部关键点正确，证据链完整。
- 基本破解：核心真相正确，但证据链不完整。
- 误判：真凶或关键动机错误。
- 证据不足：结论方向可能正确，但缺少必要证据。

## 5. 非 MVP 范围

以下内容可以后续扩展，不应阻塞第一版：

- 可视化 2D 地图和角色实时移动
- 背包与复杂物品合成
- 多案件章节
- 自动生成完整案件
- 复杂密码机关
- 语音对话
- AI 生成角色头像
- 关系和秘密的知识图谱
- 多日开放式模拟
- 存档槽
- 本地模型支持
- 战斗、养成或经营系统

## 6. 核心用户流程

1. 玩家打开应用。
2. 玩家看到案件简报和当前调查阶段。
3. 玩家进入地点，调查可疑对象。
4. 玩家发现线索，线索进入线索板。
5. 玩家查看 NPC 资料并选择对象问话。
6. NPC 根据案件事实和信任度回应。
7. 玩家使用已发现线索追问 NPC。
8. 系统记录证词、矛盾和新线索。
9. 玩家推进调查阶段，解锁新的地点状态和话题。
10. 玩家在线索板中整理证据链。
11. 玩家提交最终推理。
12. 系统给出结局、评分和真相复盘。

## 7. 信息架构建议

第一版 UI 做成 macOS 桌面 App，主窗口包含以下区域：

- 案件目标和调查阶段
- 地点列表与调查面板
- NPC 列表与对话面板
- 线索板
- 调查日志
- 推理笔记
- 最终提交面板

MVP 阶段优先做文本和信息组织，不必一开始就做完整游戏地图。桌面端需要支持窗口化运行、本地数据保存和离线查看已发现内容；调用 DeepSeek 的功能需要联网。

## 8. AI 行为要求

### 8.1 NPC 对话

NPC 对话系统需要接收：

- NPC 资料
- 案件真相中该 NPC 已知或隐瞒的事实
- 与玩家的信任度
- 玩家已发现线索
- 当前追问话题
- 当前调查阶段
- 最近调查日志

系统应返回：

- 对话文本
- 是否透露新事实
- 是否产生新证词
- 是否解锁追问话题
- 是否更新 NPC 对玩家的态度
- 可选的调查日志摘要

### 8.2 NPC 行为与阶段变化

NPC 不需要完全自主模拟日常生活，但可以在调查阶段变化时更新状态：

- 移动到某个地点
- 主动寻找或避开玩家
- 与另一个 NPC 发生短事件
- 对玩家调查进展产生反应
- 因被指出矛盾而改变说法

这些变化必须服务于案件节奏，而不是让主线谜题失控。

### 8.3 行为约束

NPC 必须：

- 保持性格一致。
- 不在没有触发条件的情况下泄露关键秘密。
- 不编造案件事实之外的关键证据。
- 不否定已经被玩家发现的硬证据。
- 可以撒谎，但谎言必须来自预设的隐瞒动机或误导线索。
- 输出结构化更新，便于应用校验和写入状态。

## 9. 数据模型草案

### 9.1 案件

```ts
type CasePackageManifest = {
  id: string;
  title: string;
  version: string;
  author?: string;
  minAppVersion: string;
  entry: {
    caseFile: string;
    locations: string;
    npcs: string;
    clues: string;
    topics: string;
    stages: string;
    truth: string;
  };
};
```

```ts
type CaseFile = {
  id: string;
  title: string;
  briefing: string;
  truth: CaseTruth;
  stages: InvestigationStage[];
  suspects: string[];
  requiredClueIds: string[];
};
```

### 9.2 案件真相

```ts
type CaseTruth = {
  culpritNpcId: string;
  motive: string;
  method: string;
  hiddenObjectLocationId: string;
  requiredEvidenceIds: string[];
};
```

### 9.3 NPC

```ts
type NPC = {
  id: string;
  name: string;
  role: string;
  personality: string[];
  locationId: string;
  publicBio: string;
  knownFacts: string[];
  hiddenFacts: string[];
  lieRules: string[];
  trustScore: number;
  relationships: Record<string, Relationship>;
};
```

### 9.4 地点

```ts
type Location = {
  id: string;
  name: string;
  description: string;
  searchableObjects: SearchableObject[];
};
```

### 9.5 可调查对象

```ts
type SearchableObject = {
  id: string;
  name: string;
  description: string;
  clueIds: string[];
  requiredStageId?: string;
};
```

### 9.6 线索

```ts
type Clue = {
  id: string;
  title: string;
  description: string;
  type: "physical" | "testimony" | "environment" | "deduction";
  source: string;
  relatedNpcIds: string[];
  relatedLocationIds: string[];
  isKey: boolean;
  isRedHerring: boolean;
  unlocksTopicIds: string[];
};
```

### 9.7 对话话题

```ts
type DialogueTopic = {
  id: string;
  title: string;
  npcId: string;
  requiredClueIds: string[];
  stageId: string;
  revealsClueIds: string[];
};
```

### 9.8 调查日志

```ts
type InvestigationEvent = {
  id: string;
  stageId: string;
  type: string;
  summary: string;
  npcIds: string[];
  clueIds: string[];
  locationId?: string;
  importance: number;
};
```

### 9.9 最终推理

```ts
type FinalDeduction = {
  culpritNpcId: string;
  motive: string;
  method: string;
  hiddenObjectLocationId: string;
  evidenceClueIds: string[];
};
```

### 9.10 案件包 JSON Schema 要求

MVP 阶段不需要引入复杂内容编辑器，但所有案件包 JSON 必须有稳定字段，便于校验和后续扩展。

`manifest.json` 必填字段：

```ts
type ManifestJson = {
  id: string;
  title: string;
  version: string;
  minAppVersion: string;
  entry: Record<"caseFile" | "locations" | "npcs" | "clues" | "topics" | "stages" | "truth", string>;
};
```

`case.json` 必填字段：

```ts
type CaseJson = {
  id: string;
  title: string;
  briefing: string;
  objectives: string[];
  suspectNpcIds: string[];
  recommendedFlow: string[];
};
```

`npcs.json` 每项必填字段：

```ts
type NpcJson = NPC & {
  initialStageId: string;
  alibi: string;
  timelineClaims: string[];
};
```

`clues.json` 每项必填字段：

```ts
type ClueJson = Clue & {
  discoveryText: string;
  requiredObjectId?: string;
  requiredTopicId?: string;
  contradictionIds: string[];
  scoringWeight: number;
};
```

`topics.json` 每项必填字段：

```ts
type TopicJson = DialogueTopic & {
  promptHint: string;
  revealCondition: "always" | "trust" | "clue" | "stage";
  attitudeDelta?: number;
};
```

`truth.json` 必填字段：

```ts
type TruthJson = {
  culpritNpcId: string;
  motiveKeywords: string[];
  methodKeywords: string[];
  hiddenObjectLocationId: string;
  requiredEvidenceIds: string[];
  scoringRubric: ScoringRubricItem[];
};
```

### 9.11 SQLite 表结构草案

SQLite 只保存玩家状态和运行期数据，首版采用以下表：

- `saves`：存档基础信息，包含 `id`、`case_id`、`case_version`、`current_stage_id`、`created_at`、`updated_at`、`completed_at`。
- `discovered_clues`：已发现线索，包含 `save_id`、`clue_id`、`discovered_at`、`source_type`、`source_id`、`player_mark`。
- `investigation_events`：调查日志，包含 `id`、`save_id`、`stage_id`、`type`、`summary`、`importance`、`created_at`。
- `event_npcs`：调查日志与 NPC 关联，包含 `event_id`、`npc_id`。
- `event_clues`：调查日志与线索关联，包含 `event_id`、`clue_id`。
- `dialogue_messages`：对话记录，包含 `id`、`save_id`、`npc_id`、`topic_id`、`role`、`content`、`created_at`。
- `npc_runtime_state`：NPC 运行状态，包含 `save_id`、`npc_id`、`trust_score`、`revealed_fact_ids`、`confronted_topic_ids`、`updated_at`。
- `deduction_notes`：玩家推理笔记，包含 `id`、`save_id`、`title`、`content`、`linked_clue_ids`、`updated_at`。
- `final_deductions`：最终推理结果，包含 `id`、`save_id`、`culprit_npc_id`、`motive_text`、`method_text`、`location_id`、`evidence_clue_ids`、`score_json`、`created_at`。
- `app_settings`：本机设置，包含 `key`、`value`、`updated_at`。

所有多值字段首版可以用 JSON 字符串保存；涉及检索的 NPC 和线索关联必须使用关联表，避免依赖字符串模糊匹配。

### 9.12 记忆检索规则

记忆采用“长期保存、按需加载”。每次 NPC 对话前，系统从案件包和 SQLite 组装本次上下文，不全量加载历史。

每次对话必须加载：

- 当前 NPC 的固定资料、已知事实、隐瞒事实和说谎边界。
- 当前调查阶段、当前地点和当前话题。
- 玩家已发现的关键线索。
- 当前 NPC 的信任度、已透露事实和已被追问话题。
- 与当前话题相关的证词、矛盾和关键调查日志。

每次对话限制加载：

- 当前 NPC 最近 8 条对话。
- 重要调查事件最多 10 条，按 `importance` 和时间排序。
- 与当前话题相关线索最多 6 条。
- 当前 NPC 已透露事实全量加载。
- 案件真相只加载当前 NPC 可知道或可隐瞒的部分，不把完整真相直接交给自由生成层。

检索优先级：

1. 当前 NPC 直接相关内容。
2. 当前话题直接相关内容。
3. 玩家已发现且重要度高的线索。
4. 最近发生的调查事件。
5. 当前阶段必须知道的案件状态。

首版不使用向量数据库。后续案件数量和对话量明显增加后，再考虑为调查日志摘要增加 embedding 检索。

### 9.13 最终推理评分规则

最终推理采用“结构化匹配 + 语义相似判定”的混合评分。

评分项：

- 真凶：结构化匹配 `culpritNpcId`。
- 账本位置：结构化匹配 `hiddenObjectLocationId`。
- 关键证据：匹配 `requiredEvidenceIds` 覆盖率。
- 动机：先匹配 `motiveKeywords`，再由 DeepSeek 判断玩家自由文本是否语义等价。
- 作案过程：先匹配 `methodKeywords`，再由 DeepSeek 判断是否覆盖关键步骤。

AI 评分必须返回结构化结果：

```ts
type DeductionScore = {
  culpritCorrect: boolean;
  motiveCorrect: boolean;
  methodCorrect: boolean;
  locationCorrect: boolean;
  evidenceCoverage: number;
  ending: "perfect" | "solved" | "wrong" | "insufficient";
  reasons: string[];
};
```

AI 只能解释和辅助判断语义相似，不得修改 `truth.json` 中的标准答案。

## 10. 技术方向

推荐 MVP 技术栈：

- 桌面容器：Tauri
- 构建工具：Vite
- 前端：React
- 本地逻辑：TypeScript
- 包管理器：pnpm
- UI 组件：优先使用自定义组件和 lucide 图标，避免引入重型组件库
- 状态管理：Zustand
- 存储：案件配置使用 JSON，玩家进度和本地状态使用 SQLite
- SQLite 访问：Tauri SQLite 插件或 Rust sidecar 封装，业务层统一走 repository
- AI 服务：使用 DeepSeek API
- 测试：Vitest 覆盖核心状态逻辑、案件包校验和评分规则

第一版应作为 macOS 桌面 App 运行，玩家通过 `.app` 启动游戏，不依赖手动打开浏览器。案件真相、线索和 NPC 边界应使用结构化配置保存，DeepSeek 只负责生成自然语言和有限状态更新。

macOS App 要求：

- 支持在 macOS 上本地启动。
- 开发阶段可通过 Tauri dev server 调试。
- 首版本只要求支持开发运行，不要求产出 `.app` 打包产物；后续版本再扩展 `.app` 和 `.dmg` 安装包。
- 存档、线索板、调查日志和设置保存在本机 SQLite 数据库中。
- DeepSeek API Key 由玩家在设置页填写并保存在本机，不写死在代码中；开发环境可使用环境变量兜底。
- 没有网络或 API Key 缺失时，App 应展示明确错误状态，不破坏本地存档。

数据存储策略：

- 案件内容以案件包形式组织，案件包由多份 JSON 文件组成。
- 案件配置使用 JSON 文件保存，包括案件元信息、案件真相、NPC、地点、线索、对话话题和阶段配置。
- 玩家进度使用 SQLite 保存，包括已发现线索、调查日志、对话记录、推理笔记、阶段进度和结局结果。
- App 设置使用 SQLite 保存，包括 DeepSeek API Key 配置、窗口偏好和最近打开的存档。
- JSON 配置只作为案件定义来源，不直接记录玩家游玩进度。
- SQLite 只记录玩家状态和运行期数据，不承载不可变的案件真相配置。

案件包加载规则：

- App 启动时扫描内置 `cases/` 目录，读取每个案件包的 `manifest.json`。
- 玩家开始新游戏时，选择一个案件包并创建对应 SQLite 存档。
- SQLite 存档必须记录 `caseId` 和 `caseVersion`，避免案件包升级后进度无法识别。
- 同一个案件包允许创建多个存档。
- 案件包 JSON 必须在进入游戏前完成结构校验，缺少关键字段时禁止开始游戏并展示错误。
- MVP 只要求加载内置案件包；后续版本再支持用户导入第三方案件包。

UI 实现规则：

- 首屏为案件选择页，展示内置案件包、已有存档和新游戏入口。
- 进入案件后默认显示调查桌界面，包含案件目标、阶段、地点、线索板、调查日志和推理笔记。
- NPC 问询界面从 NPC 列表进入，左侧显示嫌疑人，中央显示对话，右侧显示信任度、已知事实、可追问话题和可出示证据。
- 镇内地图作为地点导航视图，不要求实时移动，只用于进入地点调查和查看 NPC 所在位置。
- 设置页必须包含 DeepSeek API Key 输入、连接测试、清除本机 Key、存档管理入口。
- API Key 输入框默认隐藏内容，保存后只显示配置状态，不在普通界面明文展示。
- 缺少 API Key 时，允许玩家查看案件、线索板和本地日志，但禁止发起 AI 对话并展示设置入口。
- 线索板支持标记“重要”“可疑”“已解释”，这些标记写入 SQLite。

开发运行要求：

- 首版本只要求开发运行，命令约定为 `pnpm install`、`pnpm dev`。
- `pnpm dev` 应启动 Tauri 开发环境并打开 macOS 桌面窗口。
- 案件包 JSON 校验失败时，开发控制台和 App 界面都要显示可定位的错误信息。
- 首版不要求签名、公证、`.app` 发布包和 `.dmg` 安装包。

DeepSeek 接入要求：

- 正式 App 通过设置页填写 DeepSeek API Key。
- 开发环境允许读取环境变量 `DEEPSEEK_API_KEY` 作为兜底。
- AI 调用层封装成独立服务，避免业务代码直接散落调用模型。
- 所有 NPC 对话、证词变化和推理反馈都要求返回可校验的结构化结果。
- 模型输出不得直接覆盖案件真相、关键线索和最终答案配置。
- MVP 默认使用 DeepSeek 的聊天模型完成 NPC 对话、追问回应、调查日志摘要和结局复盘文本。

## 11. 成功标准

MVP 达成的标准：

- 用户可以在 macOS 上以桌面 App 形式运行游戏。
- 游戏包含 1 个完整案件、5 个 NPC 和 5 个地点。
- 用户可以调查地点并获得线索。
- 用户可以和 NPC 对话，并通过线索解锁追问。
- 线索板能展示已发现线索和相关 NPC、地点。
- 玩家可以提交最终推理。
- 系统可以判定推理结果并展示真相复盘。
- NPC 不会在关键案件事实上生成与配置相冲突的内容。

## 12. 已定关键决策

- 运行形态：macOS 桌面 App，首版本只支持开发运行，后续再打包 `.app` 和 `.dmg`。
- 数据存储：案件配置使用 JSON，玩家进度和本地状态使用 SQLite。
- DeepSeek API Key：正式 App 在设置页填写，开发环境允许读取 `DEEPSEEK_API_KEY` 兜底。
- 最终推理评分：允许语义相似判定，不要求逐字匹配。
- 案件内容管理：以案件包形式抽成可编辑 JSON 配置，不硬编码在业务逻辑中。
- 第一阶段优先级：优先加强谜题设计，再提升 NPC 对话自然度。
- 首案真相：镇长为真凶，动机为掩盖旧桥修缮款挪用，账本藏在图书馆旧报纸架后的暗格。
- 记忆系统：长期保存在 SQLite，运行时按 NPC、话题、线索和重要度检索加载。
- 首屏：案件选择页；核心界面包括调查桌、NPC 问询、镇内地图、最终推理和设置页。
- 开发栈细节：Tauri + Vite + React + TypeScript + pnpm + Zustand + SQLite + Vitest。

## 13. 推荐第一里程碑

先构建一个文本优先的可玩解谜原型：

- 固定的 1 个案件。
- 固定的 5 个 NPC 和 5 个地点。
- 至少 8 条线索和 3 条误导线索。
- 地点调查功能。
- NPC 对话和线索追问功能。
- 线索板和调查日志。
- 简单推理笔记。
- 最终推理提交与结局判定。

这一里程碑应避免地图渲染、复杂背包、战斗、经营和开放式日常模拟。目标是用一个小而清晰的状态模型，验证“AI NPC + 结构化案件事实”能否形成完整、有趣、可判定的解谜体验。
