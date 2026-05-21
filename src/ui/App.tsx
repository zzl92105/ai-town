import {
  Archive,
  BookOpen,
  Building2,
  Check,
  ChevronLeft,
  ClipboardList,
  Coffee,
  FileText,
  GitBranch,
  KeyRound,
  Library,
  Lightbulb,
  Link2,
  Map,
  MapPin,
  MessageSquare,
  NotebookPen,
  Sparkles,
  Search,
  Settings,
  ShieldQuestion,
  Stethoscope,
  Target,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";
import cafeShenAvatar from "../assets/ai/avatars/cafe-shen.png";
import doctorBaiAvatar from "../assets/ai/avatars/doctor-bai.png";
import librarianLinAvatar from "../assets/ai/avatars/librarian-lin.png";
import mayorZhouAvatar from "../assets/ai/avatars/mayor-zhou.png";
import reporterXuAvatar from "../assets/ai/avatars/reporter-xu.png";
import archiveScheduleImage from "../assets/ai/clues/archive-schedule.png";
import cafeReceiptImage from "../assets/ai/clues/cafe-receipt-time.png";
import coffeeStainImage from "../assets/ai/clues/coffee-stain.png";
import deductionNoteImage from "../assets/ai/clues/deduction-note.png";
import libraryDustImage from "../assets/ai/clues/library-dust-gap.png";
import librarianSightingImage from "../assets/ai/clues/librarian-sighting.png";
import mayorReporterArgumentImage from "../assets/ai/clues/mayor-reporter-argument.png";
import oldBridgeArticleImage from "../assets/ai/clues/old-bridge-article.png";
import reporterWristImage from "../assets/ai/clues/reporter-wrist.png";
import spareKeyLogImage from "../assets/ai/clues/spare-key-log.png";
import tornLedgerPageImage from "../assets/ai/clues/torn-ledger-page.png";
import cafeScene from "../assets/ai/locations/cafe.png";
import clinicScene from "../assets/ai/locations/clinic.png";
import libraryScene from "../assets/ai/locations/library.png";
import squareScene from "../assets/ai/locations/square.png";
import townHallScene from "../assets/ai/locations/town-hall.png";
import { missingLedgerCase } from "../data/casePackage";
import { caseCatalog } from "../data/caseCatalog";
import { buildNpcDisclosureContext } from "../domain/aiGuardrails";
import { getAvailableContradictions } from "../domain/contradictionRules";
import { getAvailableDeductionRules } from "../domain/deductionRules";
import { buildDeductionAssist } from "../domain/evidenceChain";
import type { ClueMark, FinalDeduction } from "../domain/types";
import { testDeepSeekConnection } from "../services/deepseek";
import { canUseTopic, getCurrentTasks, getFinalGate, getStageGate, isStageAvailable, useGameStore } from "../store/gameStore";
import { getLocationMapStatuses, getNpcMapMarkers, locationMapNodes } from "./mapPresentation";
import { TownMapEngine } from "./TownMapEngine";

const locationIcons: Record<string, ElementType> = {
  square: Map,
  cafe: Coffee,
  clinic: Stethoscope,
  library: Library,
  town_hall: Building2,
};

const npcAvatars: Record<string, string> = {
  mayor_zhou: mayorZhouAvatar,
  reporter_xu: reporterXuAvatar,
  librarian_lin: librarianLinAvatar,
  cafe_shen: cafeShenAvatar,
  doctor_bai: doctorBaiAvatar,
};

const locationScenes: Record<string, string> = {
  square: squareScene,
  cafe: cafeScene,
  clinic: clinicScene,
  library: libraryScene,
  town_hall: townHallScene,
};

const clueImages: Record<string, string> = {
  clue_torn_ledger_page: tornLedgerPageImage,
  clue_spare_key_log: spareKeyLogImage,
  clue_coffee_stain: coffeeStainImage,
  clue_library_dust_gap: libraryDustImage,
  clue_reporter_wrist: reporterWristImage,
  clue_mayor_reporter_argument: mayorReporterArgumentImage,
  clue_archive_schedule: archiveScheduleImage,
  clue_old_bridge_article: oldBridgeArticleImage,
  clue_librarian_partial_sighting: librarianSightingImage,
  clue_cafe_receipt_time: cafeReceiptImage,
  deduction_mayor_alibi_broken: deductionNoteImage,
  deduction_hidden_route_library: deductionNoteImage,
};

function getNpcAvatar(npcId: string) {
  return npcAvatars[npcId] ?? mayorZhouAvatar;
}

function getClueImage(clueId: string) {
  return clueImages[clueId] ?? deductionNoteImage;
}

const markLabels: Record<ClueMark, string> = {
  none: "未标记",
  important: "重要",
  suspicious: "可疑",
  explained: "已解释",
};

const storyBackground = [
  "旧桥修缮款的去向一直是镇上的禁忌。昨晚，镇公所准备封存年度账本时，负责整理档案的人发现账本不见了。",
  "账本里可能记录了拨款异常、临时签批和被人刻意藏起的票据。镇长、记者、图书管理员、咖啡馆老板和医生都在关键时间段靠近过相关地点。",
  "你扮演外来的调查员，需要在一天之内找出是谁拿走账本、为什么拿走、怎么避开登记，以及账本现在被藏在哪里。",
];

const firstSteps = [
  "先去“镇公所”调查档案室、登记表和工具箱。",
  "再去“咖啡馆”查找小票、目击证词和时间线。",
  "遇到嫌疑人就进入问询，拿线索追问矛盾说法。",
  "线索足够后到“推理”页提交真相。",
];

export function App() {
  const view = useGameStore((state) => state.view);
  const hydrateDesktopStorage = useGameStore((state) => state.hydrateDesktopStorage);

  useEffect(() => {
    void hydrateDesktopStorage();
  }, [hydrateDesktopStorage]);

  return (
    <div className="app-shell">
      <TopBar />
      {view === "select" && <CaseSelect />}
      {view === "desk" && <DeskView />}
      {view === "interrogation" && <InterrogationView />}
      {view === "map" && <MapView />}
      {view === "deduction" && <DeductionView />}
      {view === "settings" && <SettingsView />}
    </div>
  );
}

function TopBar() {
  const setView = useGameStore((state) => state.setView);
  return (
    <header className="topbar">
      <div className="window-dots">
        <span />
        <span />
        <span />
      </div>
      <strong>AI 小镇</strong>
      <nav>
        <button onClick={() => setView("desk")} title="调查桌">
          <ClipboardList size={17} /> 调查桌
        </button>
        <button onClick={() => setView("map")} title="镇内地图">
          <Map size={17} /> 地图
        </button>
        <button onClick={() => setView("deduction")} title="最终推理">
          <ShieldQuestion size={17} /> 推理
        </button>
        <button onClick={() => setView("settings")} title="设置">
          <Settings size={17} /> 设置
        </button>
      </nav>
    </header>
  );
}

function CaseSelect() {
  const startNewGame = useGameStore((state) => state.startNewGame);
  const loadSave = useGameStore((state) => state.loadSave);
  const saveSummaries = useGameStore((state) => state.saveSummaries);
  return (
    <main className="select-screen">
      <section className="case-hero">
        <div className="case-file-visual">
          <FileText size={54} />
          <span>TM-2024-0517</span>
        </div>
        <div>
          <p className="eyebrow">内置案件包 · v{missingLedgerCase.manifest.version}</p>
          <h1>{missingLedgerCase.caseFile.title}</h1>
          <p>{missingLedgerCase.caseFile.briefing}</p>
          <div className="hero-actions">
            <button className="primary" onClick={startNewGame}>
              <Search size={18} /> 开始新调查
            </button>
            <button onClick={() => useGameStore.getState().setView("settings")}>
              <Settings size={18} /> 设置 DeepSeek
            </button>
          </div>
        </div>
      </section>
      <section className="select-grid">
        <Panel title="案件库" icon={Archive}>
          <div className="case-catalog">
            {caseCatalog.map((entry) => (
              <article key={entry.id} className={entry.status === "playable" ? "playable" : "planned"}>
                <div>
                  <strong>{entry.title}</strong>
                  <span>{entry.status === "playable" ? "可游玩" : "规划中"} · {entry.version}</span>
                </div>
                <p>{entry.briefing}</p>
                <div className="tag-row">{entry.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                <button disabled={entry.status !== "playable"} onClick={startNewGame}>
                  {entry.status === "playable" ? "开始此案" : "等待案件包"}
                </button>
              </article>
            ))}
          </div>
        </Panel>
        <Panel title="故事背景" icon={BookOpen}>
          <div className="story-copy">
            {storyBackground.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </Panel>
        <Panel title="案件目标" icon={Check}>
          <ul className="clean-list">
            {missingLedgerCase.caseFile.objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
        </Panel>
        <Panel title="推荐流程" icon={NotebookPen}>
          <ul className="clean-list">
            {missingLedgerCase.caseFile.recommendedFlow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Panel>
        <Panel title="开始后先做什么" icon={Search}>
          <ol className="clean-list numbered">
            {firstSteps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </Panel>
      </section>
      <section className="save-section">
        <Panel title="已有存档" icon={Archive}>
          <div className="save-list">
            {saveSummaries.length === 0 && <p className="muted">暂无本机存档。开始新调查后会自动保存进度。</p>}
            {saveSummaries.map((save) => (
              <article key={save.id}>
                <div>
                  <strong>{missingLedgerCase.caseFile.title}</strong>
                  <span>{stageName(save.currentStageId)} · 线索 {save.discoveredClueCount}/{missingLedgerCase.clues.length} · 日志 {save.eventCount}</span>
                  <small>更新于 {formatDateTime(save.updatedAt)}</small>
                </div>
                <button onClick={() => loadSave(save.id)}>继续调查</button>
              </article>
            ))}
          </div>
        </Panel>
      </section>
    </main>
  );
}

function DeskView() {
  return (
    <main className="workspace three-col">
      <Sidebar />
      <section className="main-stack">
        <CaseBrief />
        <LocationInvestigation />
        <ClueStrip />
      </section>
      <section className="side-stack">
        <ClueBoard />
        <EvidenceChainPanel />
        <DeductionNote />
      </section>
      <LogPanel />
    </main>
  );
}

function Sidebar() {
  const activeSaveId = useGameStore((state) => state.activeSaveId);
  const stageId = useGameStore((state) => state.stageId);
  const currentLocationId = useGameStore((state) => state.currentLocationId);
  const discoveredClueIds = useGameStore((state) => state.discoveredClueIds);
  const dialogue = useGameStore((state) => state.dialogue);
  const setView = useGameStore((state) => state.setView);
  const selectLocation = useGameStore((state) => state.selectLocation);
  const advanceStage = useGameStore((state) => state.advanceStage);
  const discoveredCount = useGameStore((state) => state.discoveredClueIds.length);
  const stage = missingLedgerCase.stages.find((item) => item.id === stageId)!;
  const stageGate = getStageGate(stageId, discoveredClueIds, dialogue);

  return (
    <aside className="sidebar">
      <div className="file-card">
        <FileText size={35} />
        <div>
          <strong>{missingLedgerCase.caseFile.title}</strong>
          <span>案件编号：TM-2024-0517</span>
          <span>存档：{activeSaveId ? activeSaveId.slice(0, 16) : "未创建"}</span>
        </div>
      </div>
      <Panel title="调查阶段" icon={ClipboardList}>
        <div className="stage-now">
          <div>
            <span>{stage.name}</span>
            <small>{stage.description}</small>
          </div>
          <button disabled={!stageGate.ok} onClick={advanceStage}>推进</button>
        </div>
        <p className={stageGate.ok ? "status-ok" : "muted"}>{stageGate.message}</p>
      </Panel>
      <CurrentTaskPanel />
      <Panel title="地点" icon={Map}>
        <div className="nav-list">
          {missingLedgerCase.locations.map((location) => {
            const Icon = locationIcons[location.id] ?? Map;
            return (
              <button
                className={location.id === currentLocationId ? "active" : ""}
                key={location.id}
                onClick={() => selectLocation(location.id)}
              >
                <Icon size={18} /> {location.name}
              </button>
            );
          })}
        </div>
      </Panel>
      <button className="wide" onClick={() => setView("map")}>镇内地图</button>
      <div className="meter">
        <span>线索进度</span>
        <strong>{discoveredCount}/{missingLedgerCase.clues.length}</strong>
        <div><i style={{ width: `${(discoveredCount / missingLedgerCase.clues.length) * 100}%` }} /></div>
      </div>
    </aside>
  );
}

function CurrentTaskPanel() {
  const stageId = useGameStore((state) => state.stageId);
  const currentLocationId = useGameStore((state) => state.currentLocationId);
  const currentNpcId = useGameStore((state) => state.currentNpcId);
  const discoveredClueIds = useGameStore((state) => state.discoveredClueIds);
  const dialogue = useGameStore((state) => state.dialogue);
  const confrontedTopicIds = useGameStore((state) => state.confrontedTopicIds);
  const resolvedContradictionIds = useGameStore((state) => state.resolvedContradictionIds);
  const setView = useGameStore((state) => state.setView);
  const advanceStage = useGameStore((state) => state.advanceStage);
  const selectNpc = useGameStore((state) => state.selectNpc);
  const tasks = getCurrentTasks({
    stageId,
    currentLocationId,
    currentNpcId,
    discoveredClueIds,
    dialogue,
    confrontedTopicIds,
    resolvedContradictionIds,
  });

  return (
    <Panel title="当前任务" icon={Target}>
      <div className="task-list">
        {tasks.map((task) => (
          <article key={task.id} className={`task-card ${task.priority}`}>
            <div>
              <strong>{task.title}</strong>
              <p>{task.detail}</p>
            </div>
            <button onClick={() => task.id === "advance_stage" ? advanceStage() : task.targetNpcId ? selectNpc(task.targetNpcId) : setView(task.view)}>{task.actionLabel}</button>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function CaseBrief() {
  const stageId = useGameStore((state) => state.stageId);
  const stage = missingLedgerCase.stages.find((item) => item.id === stageId)!;
  return (
    <Panel title="案件简报" icon={BookOpen}>
      <div className="story-copy compact">
        <p>{missingLedgerCase.caseFile.briefing}</p>
        <p>你的核心任务不是收集所有物品，而是把“时间、动机、作案方式、藏匿地点”串成完整证据链。</p>
      </div>
      <div className="facts-row">
        <span><FileText size={15} /> 关键物品：年度账本</span>
        <span><ClipboardList size={15} /> 当前阶段：{stage.name}</span>
        <span><KeyRound size={15} /> {stage.advanceHint}</span>
      </div>
      <div className="next-actions">
        {firstSteps.slice(0, 3).map((step) => <span key={step}>{step}</span>)}
      </div>
    </Panel>
  );
}

function LocationInvestigation() {
  const stageId = useGameStore((state) => state.stageId);
  const currentLocationId = useGameStore((state) => state.currentLocationId);
  const investigateObject = useGameStore((state) => state.investigateObject);
  const selectNpc = useGameStore((state) => state.selectNpc);
  const stage = missingLedgerCase.stages.find((item) => item.id === stageId)!;
  const location = missingLedgerCase.locations.find((item) => item.id === currentLocationId)!;
  const npcsHere = missingLedgerCase.npcs.filter((npc) => stage.npcLocations[npc.id] === location.id);

  return (
    <Panel title={`当前位置 · ${location.name}`} icon={locationIcons[location.id] ?? Map}>
      <div className="location-scene">
        <img src={locationScenes[location.id]} alt={`${location.name}调查场景`} />
        <div>
          <strong>{location.name}</strong>
          <span>{npcsHere.length > 0 ? `现场人物：${npcsHere.map((npc) => npc.name).join("、")}` : "现场暂无可问询人物"}</span>
        </div>
      </div>
      <p>{location.description}</p>
      <div className="environment">
        {location.environmentDetails.map((detail) => <span key={detail}>{detail}</span>)}
      </div>
      <div className="object-list">
        {location.searchableObjects.map((object) => {
          const locked = !isStageAvailable(stageId, object.requiredStageId);
          return (
            <article key={object.id} className={locked ? "locked" : ""}>
              <img className="object-thumb" src={object.clueIds[0] ? getClueImage(object.clueIds[0]) : locationScenes[location.id]} alt={`${object.name}线索图`} />
              <div>
                <strong>{object.name}</strong>
                <p>{object.description}</p>
              </div>
              <button onClick={() => investigateObject(object.id)}>{locked ? "未开放" : "调查"}</button>
            </article>
          );
        })}
      </div>
      <div className="npc-row">
        {npcsHere.map((npc) => (
          <button key={npc.id} onClick={() => selectNpc(npc.id)}>
            <MessageSquare size={16} /> {npc.name} · {npc.role}
          </button>
        ))}
      </div>
    </Panel>
  );
}

function ClueStrip() {
  const discoveredClueIds = useGameStore((state) => state.discoveredClueIds);
  const clues = missingLedgerCase.clues.filter((clue) => discoveredClueIds.includes(clue.id));
  return (
    <Panel title={`已发现线索（${clues.length}）`} icon={Archive}>
      <div className="clue-strip">
        {clues.length === 0 && <p className="muted">调查地点中的对象后，线索会进入线索板。</p>}
        {clues.slice(-4).map((clue) => (
          <article key={clue.id}>
            <img className="clue-thumb" src={getClueImage(clue.id)} alt={`${clue.title}证物图`} />
            <strong>{clue.title}</strong>
            <p>{clue.description}</p>
            <small>{clue.isKey ? "关键" : clue.isRedHerring ? "误导" : "普通"} · {clue.source}</small>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function ClueBoard() {
  const discoveredClueIds = useGameStore((state) => state.discoveredClueIds);
  const resolvedContradictionIds = useGameStore((state) => state.resolvedContradictionIds);
  const clueMarks = useGameStore((state) => state.clueMarks);
  const markClue = useGameStore((state) => state.markClue);
  const identifyContradiction = useGameStore((state) => state.identifyContradiction);
  const combineDeduction = useGameStore((state) => state.combineDeduction);
  const selectNpc = useGameStore((state) => state.selectNpc);
  const clues = missingLedgerCase.clues.filter((clue) => discoveredClueIds.includes(clue.id));
  const contradictions = getAvailableContradictions(discoveredClueIds, resolvedContradictionIds);
  const deductionRules = getAvailableDeductionRules(discoveredClueIds);
  const groupedClues = {
    physical: clues.filter((clue) => clue.type === "physical"),
    testimony: clues.filter((clue) => clue.type === "testimony"),
    environment: clues.filter((clue) => clue.type === "environment"),
    deduction: clues.filter((clue) => clue.type === "deduction"),
  };
  return (
    <Panel title="证据墙" icon={Archive}>
      <div className="evidence-wall">
        {clues.length === 0 && <p className="muted">尚未发现线索。先调查地点中的可疑对象。</p>}
        {Object.entries(groupedClues).map(([type, items]) => items.length > 0 && (
          <section key={type} className="evidence-column">
            <header>{clueTypeLabel(type)}</header>
            {items.map((clue) => {
              const firstNpc = clue.relatedNpcIds[0];
              return (
                <article key={clue.id} className={clue.isKey ? "key-clue" : clue.isRedHerring ? "red-herring" : ""}>
                  <img className="clue-card-image" src={getClueImage(clue.id)} alt={`${clue.title}证物图`} />
                  <div className="clue-card-head">
                    <strong>{clue.title}</strong>
                    <span>{clue.isKey ? "关键" : clue.isRedHerring ? "误导" : "普通"}</span>
                  </div>
                  <p>{clue.description}</p>
                  <div className="clue-meta">
                    {clue.relatedNpcIds.map((npcId) => (
                      <span key={npcId}>{missingLedgerCase.npcs.find((npc) => npc.id === npcId)?.name ?? npcId}</span>
                    ))}
                    {clue.relatedLocationIds.map((locationId) => (
                      <span key={locationId}>{missingLedgerCase.locations.find((location) => location.id === locationId)?.name ?? locationId}</span>
                    ))}
                  </div>
                  <div className="clue-card-actions">
                    <select value={clueMarks[clue.id] ?? "none"} onChange={(event) => markClue(clue.id, event.target.value as ClueMark)}>
                      {Object.entries(markLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <button
                      draggable
                      onDragStart={(event) => event.dataTransfer.setData("text/plain", clue.id)}
                      onClick={() => useGameStore.getState().toggleEvidenceChainClue(clue.id)}
                    >
                      <Link2 size={14} /> 入链
                    </button>
                    {firstNpc && <button onClick={() => selectNpc(firstNpc)}><MessageSquare size={14} /> 问相关人</button>}
                  </div>
                </article>
              );
            })}
          </section>
        ))}
      </div>
      <div className="contradiction-list">
        {deductionRules.map((rule) => (
          <button key={rule.id} onClick={() => combineDeduction(rule.id)}>
            <NotebookPen size={15} /> 组合推理 · {rule.title}
          </button>
        ))}
        {contradictions.map((rule) => (
          <button key={rule.id} onClick={() => identifyContradiction(rule.id)}>
            <ShieldQuestion size={15} /> 指出矛盾 · {rule.title}
          </button>
        ))}
      </div>
    </Panel>
  );
}

function clueTypeLabel(type: string) {
  if (type === "physical") return "物证";
  if (type === "testimony") return "证词";
  if (type === "environment") return "环境";
  return "推理";
}

function EvidenceChainPanel() {
  const evidenceChainIds = useGameStore((state) => state.evidenceChainIds);
  const discoveredClueIds = useGameStore((state) => state.discoveredClueIds);
  const toggleEvidenceChainClue = useGameStore((state) => state.toggleEvidenceChainClue);
  const moveEvidenceChainClue = useGameStore((state) => state.moveEvidenceChainClue);
  const chainClues = evidenceChainIds
    .map((id) => missingLedgerCase.clues.find((clue) => clue.id === id))
    .filter(Boolean) as typeof missingLedgerCase.clues;
  const assist = buildDeductionAssist({
    requiredEvidenceIds: missingLedgerCase.truth.requiredEvidenceIds,
    selectedEvidenceIds: evidenceChainIds,
    discoveredClueIds,
  });

  return (
    <Panel title="证据链" icon={GitBranch}>
      <div
        className="evidence-chain-drop"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const clueId = event.dataTransfer.getData("text/plain");
          if (clueId) toggleEvidenceChainClue(clueId);
        }}
      >
        {chainClues.length === 0 && <p className="muted">把线索卡拖到这里，或点击“入链”，整理最终推理证据链。</p>}
        {chainClues.map((clue, index) => (
          <article
            key={clue.id}
            draggable
            onDragStart={(event) => event.dataTransfer.setData("text/chain-clue", clue.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const draggedId = event.dataTransfer.getData("text/chain-clue");
              if (draggedId) moveEvidenceChainClue(draggedId, clue.id);
            }}
          >
            <span>{index + 1}</span>
            <img className="mini-clue-image" src={getClueImage(clue.id)} alt="" />
            <div>
              <strong>{clue.title}</strong>
              <small>{clue.source}</small>
            </div>
            <button onClick={() => toggleEvidenceChainClue(clue.id)}>移除</button>
          </article>
        ))}
      </div>
      <div className="assist-meter">
        <span>关键覆盖</span>
        <strong>{Math.round(assist.coverage * 100)}%</strong>
        <div><i style={{ width: `${assist.coverage * 100}%` }} /></div>
      </div>
      {assist.missingDiscoveredEvidenceIds.length > 0 && (
        <p className="muted">已发现但未入链：{assist.missingDiscoveredEvidenceIds.map((id) => missingLedgerCase.clues.find((clue) => clue.id === id)?.title ?? id).join("、")}</p>
      )}
    </Panel>
  );
}

function DeductionNote() {
  const note = useGameStore((state) => state.note);
  const setNote = useGameStore((state) => state.setNote);
  const deductionNotes = useGameStore((state) => state.deductionNotes);
  const discoveredClueIds = useGameStore((state) => state.discoveredClueIds);
  const combineDeduction = useGameStore((state) => state.combineDeduction);
  const availableRules = getAvailableDeductionRules(discoveredClueIds);
  return (
    <Panel title="推理记录" icon={NotebookPen}>
      <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="记录你的推理、矛盾和证据链。" />
      <div className="deduction-composer">
        {availableRules.length === 0 && <p className="muted">收集并比对相关线索后，可以在这里形成推理线索。</p>}
        {availableRules.map((rule) => (
          <button key={rule.id} onClick={() => combineDeduction(rule.id)}>
            <NotebookPen size={15} /> {rule.title}
          </button>
        ))}
      </div>
      <div className="structured-notes">
        {deductionNotes.filter((item) => item.id !== "manual_note").map((item) => (
          <article key={item.id}>
            <strong>{item.title}</strong>
            <p>{item.content}</p>
            <small>关联线索 {item.linkedClueIds.length} 条</small>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function LogPanel() {
  const events = useGameStore((state) => state.events);
  return (
    <section className="log-panel">
      <header><ClipboardList size={17} /> 调查日志</header>
      <div>
        {events.slice(0, 8).map((event) => (
          <p key={event.id}><time>{new Date(event.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</time>{event.summary}</p>
        ))}
      </div>
    </section>
  );
}

function InterrogationView() {
  const stageId = useGameStore((state) => state.stageId);
  const currentNpcId = useGameStore((state) => state.currentNpcId);
  const selectNpc = useGameStore((state) => state.selectNpc);
  const npcTrustScores = useGameStore((state) => state.npcTrustScores);
  const confrontedTopicIds = useGameStore((state) => state.confrontedTopicIds);
  const revealedFactIds = useGameStore((state) => state.revealedFactIds);
  const discoveredClueIds = useGameStore((state) => state.discoveredClueIds);
  const dialogue = useGameStore((state) => state.dialogue);
  const askTopic = useGameStore((state) => state.askTopic);
  const presentEvidenceToNpc = useGameStore((state) => state.presentEvidenceToNpc);
  const apiKeyConfigured = useGameStore((state) => state.apiKeyConfigured);
  const askFreeQuestion = useGameStore((state) => state.askFreeQuestion);
  const aiBusy = useGameStore((state) => state.aiBusy);
  const aiError = useGameStore((state) => state.aiError);
  const [question, setQuestion] = useState("");
  const npc = missingLedgerCase.npcs.find((item) => item.id === currentNpcId)!;
  const stage = missingLedgerCase.stages.find((item) => item.id === stageId)!;
  const topics = missingLedgerCase.topics.filter((topic) => topic.npcId === currentNpcId);
  const visibleMessages = dialogue.filter((message) => message.npcId === currentNpcId);
  const availableClues = missingLedgerCase.clues.filter((clue) => discoveredClueIds.includes(clue.id));
  const disclosure = buildNpcDisclosureContext({
    casePackage: missingLedgerCase,
    npc,
    stageId,
    discoveredClueIds,
  });

  return (
    <main className="workspace interrogation-layout">
      <aside className="suspect-list">
        <header>嫌疑人列表</header>
        {missingLedgerCase.npcs.map((item) => {
          const location = missingLedgerCase.locations.find((entry) => entry.id === stage.npcLocations[item.id]);
          const trust = npcTrustScores[item.id] ?? item.trustScore;
          return (
            <button key={item.id} className={item.id === currentNpcId ? "active" : ""} onClick={() => selectNpc(item.id)}>
              <img className="portrait-img" src={getNpcAvatar(item.id)} alt={`${item.name}头像`} />
              <strong>{item.name}</strong>
              <small>{item.role} · {location?.name ?? "未知地点"}</small>
              <span className="suspect-trust"><i style={{ width: `${trust}%` }} />信任 {trust}</span>
            </button>
          );
        })}
      </aside>
      <section className="chat-panel">
        <header>
          <img className="portrait-img large" src={getNpcAvatar(npc.id)} alt={`${npc.name}头像`} />
          <div>
            <h2>{npc.name} · {npc.role}</h2>
            <p>{npc.publicBio}</p>
            <p>信任度 {npcTrustScores[npc.id] ?? npc.trustScore}/100 · 已追问 {(confrontedTopicIds[npc.id] ?? []).length} 个话题</p>
          </div>
        </header>
        <div className="chat-stream">
          {visibleMessages.length === 0 && <p className="muted">选择右侧话题开始问询。NPC 回答受案件事实和触发条件约束。</p>}
          {visibleMessages.map((message) => (
            <p key={message.id} className={message.role === "player" ? "bubble player" : "bubble npc"}>{message.content}</p>
          ))}
        </div>
        {aiError && <p className="inline-error">{aiError}</p>}
        <footer>
          <input
            disabled={!apiKeyConfigured || aiBusy}
            value={question}
            placeholder={apiKeyConfigured ? "输入你的问题，AI 回复会受案件事实约束。" : "缺少 API Key，不能发起自由 AI 对话。"}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void askFreeQuestion(question).then(() => setQuestion(""));
              }
            }}
          />
          <button
            disabled={!apiKeyConfigured || aiBusy || !question.trim()}
            onClick={() => void askFreeQuestion(question).then(() => setQuestion(""))}
          >
            {aiBusy ? "发送中" : "发送"}
          </button>
        </footer>
      </section>
      <aside className="interrogate-side">
        <Panel title="已知事实" icon={FileText}>
          <ul className="clean-list">{npc.knownFacts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
          {(revealedFactIds[npc.id] ?? []).length > 0 && (
            <div className="runtime-facts">
              {(revealedFactIds[npc.id] ?? []).map((factId) => <span key={factId}>{factId}</span>)}
            </div>
          )}
        </Panel>
        <Panel title="AI 透露边界" icon={Lightbulb}>
          <div className="ai-boundary">
            <p>{disclosure.stageDisclosure}</p>
            <span>证据强度：{disclosure.evidenceCompleteness.status === "strong" ? "强" : disclosure.evidenceCompleteness.status === "partial" ? "中" : "弱"}</span>
            <span>允许话题：{disclosure.allowedTopicIds.length}</span>
          </div>
        </Panel>
        <Panel title="已解锁话题" icon={MessageSquare}>
          <div className="topic-list">
            {topics.map((topic) => {
              const topicGate = canUseTopic(stageId, discoveredClueIds, topic.id);
              const locked = !topicGate.ok;
              return (
                <button key={topic.id} disabled={locked} title={topicGate.message} onClick={() => askTopic(topic.id)}>
                  {locked ? "锁定" : "追问"} · {topic.title}
                </button>
              );
            })}
          </div>
        </Panel>
        <Panel title="可出示证据" icon={Archive}>
          <div className="evidence-list">
            {availableClues.length === 0 && <p className="muted">发现线索后，可以在这里向 NPC 出示证据。</p>}
            {availableClues.slice(0, 8).map((clue) => {
              const matchingTopic = topics.find((topic) => {
                const alreadyAsked = confrontedTopicIds[npc.id]?.includes(topic.id);
                return !alreadyAsked && topic.requiredClueIds.includes(clue.id) && canUseTopic(stageId, discoveredClueIds, topic.id).ok;
              });
              return (
                <button key={clue.id} className={matchingTopic ? "evidence-hot" : ""} onClick={() => presentEvidenceToNpc(clue.id)}>
                  <Archive size={14} />
                  <span>{clue.title}</span>
                  {matchingTopic && <small>可突破：{matchingTopic.title}</small>}
                </button>
              );
            })}
          </div>
        </Panel>
      </aside>
    </main>
  );
}

function MapView() {
  const stageId = useGameStore((state) => state.stageId);
  const selectLocation = useGameStore((state) => state.selectLocation);
  const selectNpc = useGameStore((state) => state.selectNpc);
  const currentLocationId = useGameStore((state) => state.currentLocationId);
  const discoveredClueIds = useGameStore((state) => state.discoveredClueIds);
  const events = useGameStore((state) => state.events);
  const [hoveredLocationId, setHoveredLocationId] = useState<string>();
  const stage = missingLedgerCase.stages.find((item) => item.id === stageId)!;
  const locationStatuses = useMemo(
    () =>
      getLocationMapStatuses({
        locations: missingLedgerCase.locations,
        clues: missingLedgerCase.clues,
        discoveredClueIds,
      }),
    [discoveredClueIds],
  );
  const npcMarkers = useMemo(
    () => getNpcMapMarkers({ npcs: missingLedgerCase.npcs, stage }),
    [stage],
  );
  const focusedLocationId = hoveredLocationId ?? currentLocationId;
  const focusedLocation = missingLedgerCase.locations.find((location) => location.id === focusedLocationId);
  const focusedStatus = locationStatuses.find((status) => status.locationId === focusedLocationId);
  const focusedNpcs = missingLedgerCase.npcs.filter((npc) => stage.npcLocations[npc.id] === focusedLocationId);
  const focusedClues = missingLedgerCase.clues.filter(
    (clue) => discoveredClueIds.includes(clue.id) && clue.relatedLocationIds.includes(focusedLocationId),
  );

  return (
    <main className="workspace map-layout">
      <Sidebar />
      <section className="town-map">
        <header>
          <Map size={18} /> 镇内地图
          <span>点击地图上的地点进入调查</span>
        </header>
        <div className="map-canvas">
          <TownMapEngine />
          {locationStatuses.map((status) => {
            const node = locationMapNodes[status.locationId];
            if (!node || status.discoveredClueCount === 0) return null;
            return (
              <span
                key={status.locationId}
                className={`map-clue-glow ${status.discoveredKeyClueCount > 0 ? "key" : ""}`}
                style={{ left: `${node.marker.left}%`, top: `${node.marker.top}%` }}
                title={`已发现 ${status.discoveredClueCount} 条线索`}
              />
            );
          })}
          {missingLedgerCase.locations.map((location) => {
            const Icon = locationIcons[location.id] ?? Map;
            const node = locationMapNodes[location.id];
            if (!node) return null;
            return (
              <button
                key={`${location.id}_label`}
                className={`map-location-label ${location.id === currentLocationId ? "active" : ""}`}
                style={{ left: `${node.label.left}%`, top: `${node.label.top}%` }}
                onMouseEnter={() => setHoveredLocationId(location.id)}
                onMouseLeave={() => setHoveredLocationId(undefined)}
                onFocus={() => setHoveredLocationId(location.id)}
                onBlur={() => setHoveredLocationId(undefined)}
                onClick={() => selectLocation(location.id)}
              >
                <Icon size={16} />
                {location.name}
              </button>
            );
          })}
          {missingLedgerCase.locations.map((location) => {
            const Icon = locationIcons[location.id] ?? Map;
            const node = locationMapNodes[location.id];
            const status = locationStatuses.find((item) => item.locationId === location.id);
            const hasDiscovered = (status?.discoveredClueCount ?? 0) > 0;
            const hasRemaining = (status?.undiscoveredObjectCount ?? 0) > 0;
            return (
              <button
                key={location.id}
                className={`map-pin ${location.id === currentLocationId ? "active" : ""} ${hasDiscovered ? "has-clue" : ""} ${hasRemaining ? "has-remaining" : ""}`}
                style={
                  node
                    ? {
                        left: `${node.hotspot.left}%`,
                        top: `${node.hotspot.top}%`,
                        width: `${node.hotspot.width}%`,
                        height: `${node.hotspot.height}%`,
                      }
                    : undefined
                }
                onMouseEnter={() => setHoveredLocationId(location.id)}
                onMouseLeave={() => setHoveredLocationId(undefined)}
                onFocus={() => setHoveredLocationId(location.id)}
                onBlur={() => setHoveredLocationId(undefined)}
                onClick={() => selectLocation(location.id)}
              >
                <Icon size={21} /> {location.name}
              </button>
            );
          })}
          {npcMarkers.map((marker) => {
            const npc = missingLedgerCase.npcs.find((item) => item.id === marker.npcId);
            if (!npc) return null;
            return (
              <button
                key={npc.id}
                className="map-npc-marker"
                style={{ left: `${marker.left}%`, top: `${marker.top}%` }}
                onClick={() => selectNpc(npc.id)}
                title={`${npc.name} · ${npc.role}`}
              >
                <img src={getNpcAvatar(npc.id)} alt={`${npc.name}头像`} />
              </button>
            );
          })}
          {focusedLocation && (
            <aside className="map-popover">
              <header>
                <MapPin size={15} />
                <strong>{focusedLocation.name}</strong>
                <span>{focusedStatus?.undiscoveredObjectCount ?? 0} 处待查</span>
              </header>
              <p>{focusedLocation.description}</p>
              <div className="map-popover-row">
                <span><MessageSquare size={13} /> {focusedNpcs.length > 0 ? focusedNpcs.map((npc) => npc.name).join("、") : "暂无 NPC"}</span>
                <span><Sparkles size={13} /> {focusedStatus?.discoveredClueCount ?? 0} 条已发现</span>
              </div>
              <div className="map-popover-clues">
                {focusedClues.slice(0, 3).map((clue) => <span key={clue.id}>{clue.title}</span>)}
              </div>
              <button onClick={() => selectLocation(focusedLocation.id)}>进入调查</button>
            </aside>
          )}
        </div>
      </section>
      <aside className="map-side">
        <Panel title={`当前线索（${discoveredClueIds.length}/${missingLedgerCase.clues.length}）`} icon={Archive}>
          <div className="mini-list">
            {missingLedgerCase.clues.filter((clue) => discoveredClueIds.includes(clue.id)).slice(0, 5).map((clue) => (
              <span key={clue.id}>
                <img className="mini-clue-image" src={getClueImage(clue.id)} alt="" />
                {clue.title}
              </span>
            ))}
          </div>
        </Panel>
        <Panel title="NPC 行踪" icon={MessageSquare}>
          <div className="mini-list">
            {missingLedgerCase.npcs.map((npc) => {
              const location = missingLedgerCase.locations.find((item) => item.id === stage.npcLocations[npc.id]);
              return <span key={npc.id}>{npc.name} · {location?.name}</span>;
            })}
          </div>
        </Panel>
        <Panel title="最近记录" icon={ClipboardList}>
          <div className="mini-list">{events.slice(0, 6).map((event) => <span key={event.id}>{event.summary}</span>)}</div>
        </Panel>
      </aside>
    </main>
  );
}

function DeductionView() {
  const stageId = useGameStore((state) => state.stageId);
  const discoveredClueIds = useGameStore((state) => state.discoveredClueIds);
  const evidenceChainIds = useGameStore((state) => state.evidenceChainIds);
  const submitFinal = useGameStore((state) => state.submitFinal);
  const finalScore = useGameStore((state) => state.finalScore);
  const lastFinalDeduction = useGameStore((state) => state.lastFinalDeduction);
  const endingReview = useGameStore((state) => state.endingReview);
  const setView = useGameStore((state) => state.setView);
  const [answer, setAnswer] = useState<FinalDeduction>({
    culpritNpcId: "mayor_zhou",
    motive: "",
    method: "",
    hiddenObjectLocationId: "library",
    evidenceClueIds: [],
  });
  const discoveredClues = missingLedgerCase.clues.filter((clue) => discoveredClueIds.includes(clue.id));
  const finalGate = getFinalGate(stageId);
  const assist = buildDeductionAssist({
    requiredEvidenceIds: missingLedgerCase.truth.requiredEvidenceIds,
    selectedEvidenceIds: answer.evidenceClueIds,
    discoveredClueIds,
  });
  const confidence = useMemo(() => {
    const keyCount = discoveredClues.filter((clue) => clue.isKey).length;
    return Math.min(98, Math.round((keyCount / 6) * 70 + (answer.evidenceClueIds.length / 5) * 28));
  }, [answer.evidenceClueIds.length, discoveredClues]);

  const toggleEvidence = (clueId: string) => {
    setAnswer((current) => ({
      ...current,
      evidenceClueIds: current.evidenceClueIds.includes(clueId)
        ? current.evidenceClueIds.filter((id) => id !== clueId)
        : [...current.evidenceClueIds, clueId],
    }));
  };

  return (
    <main className="deduction-page">
      <button onClick={() => setView("desk")}><ChevronLeft size={17} /> 返回调查</button>
      <h1>最终推理提交</h1>
      <p>请基于已收集的线索完整提交真相。提交后系统会按结构化标准答案评分。</p>
      <p className={finalGate.ok ? "status-ok" : "inline-error"}>{finalGate.message}</p>
      <section className="deduction-form">
        <Panel title="1. 谁拿走了账本" icon={ShieldQuestion}>
          <div className="choice-grid">
            {missingLedgerCase.npcs.map((npc) => (
              <label key={npc.id} className={answer.culpritNpcId === npc.id ? "selected" : ""}>
                <input type="radio" checked={answer.culpritNpcId === npc.id} onChange={() => setAnswer({ ...answer, culpritNpcId: npc.id })} />
                <img className="portrait-img" src={getNpcAvatar(npc.id)} alt={`${npc.name}头像`} />{npc.name}<small>{npc.role}</small>
              </label>
            ))}
          </div>
        </Panel>
        <Panel title="2. 动机" icon={FileText}>
          <textarea value={answer.motive} onChange={(event) => setAnswer({ ...answer, motive: event.target.value })} placeholder="例如：为掩盖旧桥修缮款挪用，担心记者曝光账本内容。" />
        </Panel>
        <Panel title="3. 作案过程" icon={KeyRound}>
          <textarea value={answer.method} onChange={(event) => setAnswer({ ...answer, method: event.target.value })} placeholder="按时间说明进入档案室、取走账本、撕页和藏匿过程。" />
        </Panel>
        <Panel title="4. 账本现在在哪里" icon={Library}>
          <select value={answer.hiddenObjectLocationId} onChange={(event) => setAnswer({ ...answer, hiddenObjectLocationId: event.target.value })}>
            {missingLedgerCase.locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
          </select>
        </Panel>
        <Panel title="5. 关键证据" icon={Archive}>
          <div className="deduction-helper">
            <button onClick={() => setAnswer({ ...answer, evidenceClueIds: evidenceChainIds })}>
              <GitBranch size={15} /> 使用证据链
            </button>
            <span>关键覆盖 {Math.round(assist.coverage * 100)}%</span>
            {assist.missingDiscoveredEvidenceIds.length > 0 && <span>可补入 {assist.missingDiscoveredEvidenceIds.length} 条已发现关键证据</span>}
            {assist.undiscoveredEvidenceIds.length > 0 && <span>仍有 {assist.undiscoveredEvidenceIds.length} 条关键证据未发现</span>}
          </div>
          <div className="evidence-pills">
            {discoveredClues.map((clue) => (
              <button key={clue.id} className={answer.evidenceClueIds.includes(clue.id) ? "selected" : ""} onClick={() => toggleEvidence(clue.id)}>
                {clue.title}
              </button>
            ))}
          </div>
        </Panel>
      </section>
      <section className="result-row">
        <div className="confidence"><strong>{confidence}%</strong><span>推理可信度</span></div>
        <button className="primary submit" disabled={!finalGate.ok} onClick={() => submitFinal(answer)}>提交推理</button>
        {finalScore && (
          <div className="score-box">
            <strong>{finalScore.ending === "perfect" ? "完美破解" : finalScore.ending === "solved" ? "基本破解" : finalScore.ending === "insufficient" ? "证据不足" : "误判"}</strong>
            {lastFinalDeduction && (
              <>
                <p>提交对象：{missingLedgerCase.npcs.find((npc) => npc.id === lastFinalDeduction.culpritNpcId)?.name ?? lastFinalDeduction.culpritNpcId}</p>
                <p>账本位置：{missingLedgerCase.locations.find((location) => location.id === lastFinalDeduction.hiddenObjectLocationId)?.name ?? lastFinalDeduction.hiddenObjectLocationId}</p>
                <p>证据数量：{lastFinalDeduction.evidenceClueIds.length}</p>
              </>
            )}
            {finalScore.reasons.map((reason) => <p key={reason}>{reason}</p>)}
            {endingReview ? <pre className="ending-review">{endingReview}</pre> : <p>真相复盘：{missingLedgerCase.truth.canonicalTruth}</p>}
          </div>
        )}
      </section>
    </main>
  );
}

function SettingsView() {
  const apiKeyConfigured = useGameStore((state) => state.apiKeyConfigured);
  const setApiKeyConfigured = useGameStore((state) => state.setApiKeyConfigured);
  const saveApiKey = useGameStore((state) => state.saveApiKey);
  const saveSummaries = useGameStore((state) => state.saveSummaries);
  const loadSave = useGameStore((state) => state.loadSave);
  const deleteSave = useGameStore((state) => state.deleteSave);
  const activeSaveId = useGameStore((state) => state.activeSaveId);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [testStatus, setTestStatus] = useState<string>();
  const [testing, setTesting] = useState(false);
  return (
    <main className="settings-page">
      <Panel title="DeepSeek API Key" icon={Settings}>
        <p>API Key 保存在本机设置中。未配置时，本地调查、线索板和推理仍可使用，自由 AI 对话会被禁用。</p>
        <p className={apiKeyConfigured ? "status-ok" : "inline-error"}>{apiKeyConfigured ? "当前状态：已配置，普通界面不会明文显示。" : "当前状态：未配置。"}</p>
        <input
          type="password"
          value={apiKeyInput}
          placeholder={apiKeyConfigured ? "输入新 Key 可覆盖当前配置" : "输入 DeepSeek API Key"}
          onChange={(event) => setApiKeyInput(event.target.value)}
        />
        <div className="hero-actions">
          <button
            onClick={() => {
              saveApiKey(apiKeyInput);
              setApiKeyInput("");
              setTestStatus("已保存到本机设置。");
            }}
          >
            保存 Key
          </button>
          <button
            disabled={!apiKeyInput.trim() || testing}
            onClick={() => {
              setTesting(true);
              void testDeepSeekConnection(apiKeyInput).then((result) => {
                setTestStatus(result.ok ? "连接测试通过。" : result.error);
                setTesting(false);
              });
            }}
          >
            {testing ? "测试中" : "连接测试"}
          </button>
          <button
            onClick={() => {
              setApiKeyConfigured(false);
              setApiKeyInput("");
              setTestStatus("已清除本机 Key。");
            }}
          >
            清除本机 Key
          </button>
        </div>
        {testStatus && <p className={testStatus.includes("通过") || testStatus.includes("保存") ? "status-ok" : "inline-error"}>{testStatus}</p>}
      </Panel>
      <Panel title="存档管理" icon={Archive}>
        <p>存档只保存在这台电脑上。你可以载入已有调查进度，或删除不需要的存档。</p>
        <div className="save-list settings-saves">
          {saveSummaries.length === 0 && <p className="muted">暂无本机存档。</p>}
          {saveSummaries.map((save) => (
            <article key={save.id} className={save.id === activeSaveId ? "active-save" : ""}>
              <div>
                <strong>{save.id === activeSaveId ? "当前存档" : "本机存档"}</strong>
                <span>{stageName(save.currentStageId)} · 线索 {save.discoveredClueCount}/{missingLedgerCase.clues.length}</span>
                <small>{formatDateTime(save.updatedAt)}</small>
              </div>
              <div className="save-actions">
                <button onClick={() => loadSave(save.id)}>载入</button>
                <button
                  onClick={() => {
                    if (window.confirm("确定删除这个本机存档？")) deleteSave(save.id);
                  }}
                >
                  删除
                </button>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </main>
  );
}

function stageName(stageId: string) {
  return missingLedgerCase.stages.find((stage) => stage.id === stageId)?.name ?? stageId;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Panel({ title, icon: Icon, children }: { title: string; icon: ElementType; children: ReactNode }) {
  return (
    <section className="panel">
      <header><Icon size={18} /> {title}</header>
      {children}
    </section>
  );
}
