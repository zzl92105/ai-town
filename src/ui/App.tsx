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
import archivistMengAvatar from "../assets/ai/canal-masks/avatars/archivist-meng.png";
import artistQiaoAvatar from "../assets/ai/canal-masks/avatars/artist-qiao.png";
import captainLuoAvatar from "../assets/ai/canal-masks/avatars/captain-luo.png";
import floristYanAvatar from "../assets/ai/canal-masks/avatars/florist-yan.png";
import sponsorHanAvatar from "../assets/ai/canal-masks/avatars/sponsor-han.png";
import canalClueImage from "../assets/ai/canal-masks/clues/canal-clues.png";
import absintheReceiptImage from "../assets/ai/canal-masks/clues/absinthe-receipt.png";
import artistBackdoorLogImage from "../assets/ai/canal-masks/clues/artist-backdoor-log.png";
import artistPalmCutImage from "../assets/ai/canal-masks/clues/artist-palm-cut.png";
import backstageStampImage from "../assets/ai/canal-masks/clues/backstage-stamp.png";
import blackoutSwitchImage from "../assets/ai/canal-masks/clues/blackout-switch.png";
import canalContractPressureImage from "../assets/ai/canal-masks/clues/canal-contract-pressure.png";
import deductionArtistRouteImage from "../assets/ai/canal-masks/clues/deduction-artist-route.png";
import deductionHiddenMaskArchiveImage from "../assets/ai/canal-masks/clues/deduction-hidden-mask-archive.png";
import deductionMicrofilmMotiveImage from "../assets/ai/canal-masks/clues/deduction-microfilm-motive.png";
import displaySlotDustImage from "../assets/ai/canal-masks/clues/display-slot-dust.png";
import floatRouteImage from "../assets/ai/canal-masks/clues/float-route.png";
import guestbookTimeImage from "../assets/ai/canal-masks/clues/guestbook-time.png";
import keyTrayImprintImage from "../assets/ai/canal-masks/clues/key-tray-imprint.png";
import maskStandPaintImage from "../assets/ai/canal-masks/clues/mask-stand-paint.png";
import missingMicrofilmImage from "../assets/ai/canal-masks/clues/missing-microfilm.png";
import sedativeRedHerringImage from "../assets/ai/canal-masks/clues/sedative-red-herring.png";
import silverFeatherFragmentImage from "../assets/ai/canal-masks/clues/silver-feather-fragment.png";
import canalCafeScene from "../assets/ai/canal-masks/locations/canal-cafe.png";
import hydroArchiveScene from "../assets/ai/canal-masks/locations/hydro-archive.png";
import aidStationScene from "../assets/ai/canal-masks/locations/aid-station.png";
import paradeSquareScene from "../assets/ai/canal-masks/locations/parade-square.png";
import sponsorHouseScene from "../assets/ai/canal-masks/locations/sponsor-house.png";
import engineerLuAvatar from "../assets/ai/station-last-train/avatars/engineer-lu.png";
import porterMaAvatar from "../assets/ai/station-last-train/avatars/porter-ma.png";
import reporterChenAvatar from "../assets/ai/station-last-train/avatars/reporter-chen.png";
import stationmasterDuAvatar from "../assets/ai/station-last-train/avatars/stationmaster-du.png";
import vendorSongAvatar from "../assets/ai/station-last-train/avatars/vendor-song.png";
import alteredTimetableImage from "../assets/ai/station-last-train/clues/altered-timetable.png";
import broadcastTapeSwapImage from "../assets/ai/station-last-train/clues/broadcast-tape-swap.png";
import cutRecorderWireImage from "../assets/ai/station-last-train/clues/cut-recorder-wire.png";
import deductionSidingMotiveImage from "../assets/ai/station-last-train/clues/deduction-siding-motive.png";
import deductionStationmasterWindowImage from "../assets/ai/station-last-train/clues/deduction-stationmaster-window.png";
import deductionTapeHiddenLostFoundImage from "../assets/ai/station-last-train/clues/deduction-tape-hidden-lost-found.png";
import halfTapeBoxImage from "../assets/ai/station-last-train/clues/half-tape-box.png";
import lostFoundTimeEditImage from "../assets/ai/station-last-train/clues/lost-found-time-edit.png";
import medicineRedHerringImage from "../assets/ai/station-last-train/clues/medicine-red-herring.png";
import missingWireCutterImage from "../assets/ai/station-last-train/clues/missing-wire-cutter.png";
import platformClockStoppedImage from "../assets/ai/station-last-train/clues/platform-clock-stopped.png";
import porterArmScratchImage from "../assets/ai/station-last-train/clues/porter-arm-scratch.png";
import reporterWetTicketImage from "../assets/ai/station-last-train/clues/reporter-wet-ticket.png";
import sidingSwitchLogImage from "../assets/ai/station-last-train/clues/siding-switch-log.png";
import staffGateRecordImage from "../assets/ai/station-last-train/clues/staff-gate-record.png";
import stationmasterTeaReceiptImage from "../assets/ai/station-last-train/clues/stationmaster-tea-receipt.png";
import vendorBackdoorSightingImage from "../assets/ai/station-last-train/clues/vendor-backdoor-sighting.png";
import lostFoundScene from "../assets/ai/station-last-train/locations/lost-found.png";
import platformScene from "../assets/ai/station-last-train/locations/platform.png";
import railClinicScene from "../assets/ai/station-last-train/locations/rail-clinic.png";
import signalTowerScene from "../assets/ai/station-last-train/locations/signal-tower.png";
import teaStandScene from "../assets/ai/station-last-train/locations/tea-stand.png";
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
import { activeCasePackage as missingLedgerCase, getCasePackage } from "../data/casePackage";
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
  sponsor_han: sponsorHanAvatar,
  artist_qiao: artistQiaoAvatar,
  captain_luo: captainLuoAvatar,
  florist_yan: floristYanAvatar,
  archivist_meng: archivistMengAvatar,
  stationmaster_du: stationmasterDuAvatar,
  engineer_lu: engineerLuAvatar,
  porter_ma: porterMaAvatar,
  vendor_song: vendorSongAvatar,
  reporter_chen: reporterChenAvatar,
};

const locationScenes: Record<string, string> = {
  square: squareScene,
  cafe: cafeScene,
  clinic: clinicScene,
  library: libraryScene,
  town_hall: townHallScene,
};

const canalLocationScenes: Record<string, string> = {
  square: paradeSquareScene,
  cafe: canalCafeScene,
  clinic: aidStationScene,
  library: hydroArchiveScene,
  town_hall: sponsorHouseScene,
};

const stationLocationScenes: Record<string, string> = {
  square: platformScene,
  cafe: teaStandScene,
  clinic: railClinicScene,
  library: lostFoundScene,
  town_hall: signalTowerScene,
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

const canalClueImages: Record<string, string> = {
  clue_blackout_switch: blackoutSwitchImage,
  clue_float_route: floatRouteImage,
  clue_absinthe_receipt: absintheReceiptImage,
  clue_artist_palm_cut: artistPalmCutImage,
  clue_missing_microfilm: missingMicrofilmImage,
  clue_key_tray_imprint: keyTrayImprintImage,
  clue_mask_stand_paint: maskStandPaintImage,
  clue_artist_backdoor_log: artistBackdoorLogImage,
  clue_canal_contract_pressure: canalContractPressureImage,
  clue_silver_feather_fragment: silverFeatherFragmentImage,
  clue_display_slot_dust: displaySlotDustImage,
  clue_guestbook_time: guestbookTimeImage,
  clue_backstage_stamp: backstageStampImage,
  clue_sedative_red_herring: sedativeRedHerringImage,
  deduction_artist_route: deductionArtistRouteImage,
  deduction_hidden_mask_archive: deductionHiddenMaskArchiveImage,
  deduction_microfilm_motive: deductionMicrofilmMotiveImage,
};

const stationClueImages: Record<string, string> = {
  clue_platform_clock_stopped: platformClockStoppedImage,
  clue_staff_gate_record: staffGateRecordImage,
  clue_reporter_wet_ticket: reporterWetTicketImage,
  clue_stationmaster_tea_receipt: stationmasterTeaReceiptImage,
  clue_vendor_backdoor_sighting: vendorBackdoorSightingImage,
  clue_porter_arm_scratch: porterArmScratchImage,
  clue_medicine_red_herring: medicineRedHerringImage,
  clue_half_tape_box: halfTapeBoxImage,
  clue_broadcast_tape_swap: broadcastTapeSwapImage,
  clue_lost_found_time_edit: lostFoundTimeEditImage,
  clue_cut_recorder_wire: cutRecorderWireImage,
  clue_siding_switch_log: sidingSwitchLogImage,
  clue_altered_timetable: alteredTimetableImage,
  clue_missing_wire_cutter: missingWireCutterImage,
  deduction_stationmaster_window: deductionStationmasterWindowImage,
  deduction_siding_motive: deductionSidingMotiveImage,
  deduction_tape_hidden_lost_found: deductionTapeHiddenLostFoundImage,
};

function getNpcAvatar(npcId: string) {
  return npcAvatars[npcId] ?? mayorZhouAvatar;
}

function getLocationScene(locationId: string) {
  if (missingLedgerCase.manifest.id === "station-last-train") {
    return stationLocationScenes[locationId] ?? locationScenes[locationId] ?? townHallScene;
  }
  return missingLedgerCase.manifest.id === "canal-masks"
    ? canalLocationScenes[locationId] ?? locationScenes[locationId] ?? townHallScene
    : locationScenes[locationId] ?? townHallScene;
}

function getClueImage(clueId: string) {
  if (missingLedgerCase.manifest.id === "station-last-train") return stationClueImages[clueId] ?? deductionNoteImage;
  if (missingLedgerCase.manifest.id === "canal-masks") return canalClueImages[clueId] ?? canalClueImage;
  return clueImages[clueId] ?? deductionNoteImage;
}

function hiddenObjectLabel() {
  if (missingLedgerCase.manifest.id === "station-last-train") return "半截录音";
  return missingLedgerCase.manifest.id === "canal-masks" ? "银羽面具" : "账本";
}

const markLabels: Record<ClueMark, string> = {
  none: "未标记",
  important: "重要",
  suspicious: "可疑",
  explained: "已解释",
};

const storyBackground = [
  "每个案件包都有独立地点、嫌疑人、线索、话题和标准真相。",
  "你扮演外来的调查员，需要在一天之内找出是谁拿走关键物品、为什么拿走、如何作案，以及物品现在藏在哪里。",
  "调查流程保持一致：先搜查地点，再用线索追问 NPC，最后整理证据链提交推理。",
];

const firstSteps = [
  "先调查当前案件的核心现场和可疑对象。",
  "再走访能建立时间线的地点和人物。",
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
            <button className="primary" onClick={() => startNewGame()}>
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
                <button disabled={entry.status !== "playable"} onClick={() => startNewGame(entry.id)}>
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
                  <strong>{getCasePackage(save.caseId).caseFile.title}</strong>
                  <span>{stageName(save.currentStageId, save.caseId)} · 线索 {save.discoveredClueCount}/{getCasePackage(save.caseId).clues.length} · 日志 {save.eventCount}</span>
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
      <NewPlayerGuide />
      <Sidebar />
      <section className="main-stack">
        <CaseBrief />
        <HowToPlayPanel />
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

function NewPlayerGuide() {
  const discoveredClueIds = useGameStore((state) => state.discoveredClueIds);
  const selectLocation = useGameStore((state) => state.selectLocation);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem("ai-town-new-player-guide") === "dismissed");
  const visible = discoveredClueIds.length === 0 && !dismissed;

  const closeGuide = () => {
    localStorage.setItem("ai-town-new-player-guide", "dismissed");
    setDismissed(true);
  };

  if (!visible) return null;

  return (
    <section className="guide-overlay" aria-label="新手引导">
      <div className="guide-card">
        <div className="guide-stamp">调查员手册</div>
        <h2>先别急着猜凶手，按证据走。</h2>
        <p>这不是开放聊天游戏。你的目标是搜查地点、拿到线索、用线索追问 NPC，最后把真凶、动机、过程和藏匿地点串成证据链。</p>
        <div className="guide-steps">
          <article>
            <span>1</span>
            <strong>搜查地点</strong>
            <p>先在核心现场点“调查”，拿到最初几条线索。</p>
          </article>
          <article>
            <span>2</span>
            <strong>拿线索问人</strong>
            <p>进入问询，把线索出示给相关 NPC，解锁更深话题。</p>
          </article>
          <article>
            <span>3</span>
            <strong>指出矛盾</strong>
            <p>证据足够时，对质矛盾或组合推理。</p>
          </article>
          <article>
            <span>4</span>
            <strong>提交真相</strong>
            <p>傍晚阶段整理证据链，再去“推理”提交结论。</p>
          </article>
        </div>
        <div className="guide-actions">
          <button
            className="primary"
            onClick={() => {
              closeGuide();
              selectLocation("town_hall");
            }}
          >
            <Search size={17} /> 去核心现场搜查
          </button>
          <button onClick={closeGuide}>我知道了</button>
        </div>
      </div>
    </section>
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
      <HintPanel />
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

function HintPanel() {
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
  const [level, setLevel] = useState<"nudge" | "clear" | "direct">("nudge");
  const tasks = getCurrentTasks({
    stageId,
    currentLocationId,
    currentNpcId,
    discoveredClueIds,
    dialogue,
    confrontedTopicIds,
    resolvedContradictionIds,
  });
  const task = tasks[0];
  const stage = missingLedgerCase.stages.find((item) => item.id === stageId);
  const remainingKeyClues = missingLedgerCase.truth.requiredEvidenceIds.filter((id) => !discoveredClueIds.includes(id));
  const hintText = !task
    ? "当前没有明确阻塞。可以整理证据链，或回看日志确认遗漏。"
    : level === "nudge"
      ? stage?.advanceHint ?? "先检查当前阶段目标。"
      : level === "clear"
        ? task.detail
        : `${task.actionLabel}：${task.title}${remainingKeyClues.length > 0 ? `。还有 ${remainingKeyClues.length} 条关键证据未发现或未入链。` : "。关键证据已接近完整。"}`;

  const runAction = () => {
    if (!task) return;
    if (task.id === "advance_stage") {
      advanceStage();
    } else if (task.targetNpcId) {
      selectNpc(task.targetNpcId);
    } else {
      setView(task.view);
    }
  };

  return (
    <Panel title="提示" icon={Lightbulb}>
      <div className="hint-controls">
        <button className={level === "nudge" ? "active" : ""} onClick={() => setLevel("nudge")}>轻提示</button>
        <button className={level === "clear" ? "active" : ""} onClick={() => setLevel("clear")}>明确</button>
        <button className={level === "direct" ? "active" : ""} onClick={() => setLevel("direct")}>下一步</button>
      </div>
      <p className="hint-text">{hintText}</p>
      {task && <button className="wide" onClick={runAction}>{task.actionLabel}</button>}
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
        <span><FileText size={15} /> 关键物品：{hiddenObjectLabel()}</span>
        <span><ClipboardList size={15} /> 当前阶段：{stage.name}</span>
        <span><KeyRound size={15} /> {stage.advanceHint}</span>
      </div>
      <div className="next-actions">
        {missingLedgerCase.caseFile.recommendedFlow.slice(0, 3).map((step) => <span key={step}>{step}</span>)}
      </div>
    </Panel>
  );
}

function HowToPlayPanel() {
  return (
    <Panel title="玩法速查" icon={Lightbulb}>
      <div className="quick-guide">
        <article>
          <strong>卡住时看左侧</strong>
          <p>“当前任务”和“提示”会告诉你下一步该搜查、问询还是推进阶段。</p>
        </article>
        <article>
          <strong>先调查再问人</strong>
          <p>没有线索时，NPC 很难透露重点。先从当前位置的可疑对象开始。</p>
        </article>
        <article>
          <strong>线索可以入链</strong>
          <p>在证据墙点击“入链”，把最终推理要用的证据整理到证据链。</p>
        </article>
        <article>
          <strong>傍晚才能结案</strong>
          <p>上午和下午先收集证据、对质矛盾；阶段满足条件后再推进。</p>
        </article>
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
        <img src={getLocationScene(location.id)} alt={`${location.name}调查场景`} />
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
              <img className="object-thumb" src={object.clueIds[0] ? getClueImage(object.clueIds[0]) : getLocationScene(location.id)} alt={`${object.name}线索图`} />
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
  const [typeFilter, setTypeFilter] = useState<"all" | "clue" | "dialogue" | "contradiction" | "stage" | "note" | "final">("all");
  const [query, setQuery] = useState("");
  const [importantOnly, setImportantOnly] = useState(false);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredEvents = events.filter((event) => {
    const matchesType = typeFilter === "all" || event.type === typeFilter;
    const matchesImportance = !importantOnly || event.importance >= 8;
    const relatedNpcNames = event.npcIds.map((id) => missingLedgerCase.npcs.find((npc) => npc.id === id)?.name ?? id).join(" ");
    const relatedClueTitles = event.clueIds.map((id) => missingLedgerCase.clues.find((clue) => clue.id === id)?.title ?? id).join(" ");
    const searchable = `${event.summary} ${relatedNpcNames} ${relatedClueTitles}`.toLowerCase();
    return matchesType && matchesImportance && (!normalizedQuery || searchable.includes(normalizedQuery));
  });
  return (
    <section className="log-panel">
      <header><ClipboardList size={17} /> 调查日志</header>
      <div className="log-tools">
        <input value={query} placeholder="搜索日志、NPC 或线索" onChange={(event) => setQuery(event.target.value)} />
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)}>
          <option value="all">全部类型</option>
          <option value="clue">线索</option>
          <option value="dialogue">问询</option>
          <option value="contradiction">矛盾</option>
          <option value="stage">阶段</option>
          <option value="note">推理</option>
          <option value="final">结局</option>
        </select>
        <label>
          <input type="checkbox" checked={importantOnly} onChange={(event) => setImportantOnly(event.target.checked)} />
          只看关键
        </label>
      </div>
      <div>
        {filteredEvents.slice(0, 12).map((event) => (
          <article key={event.id} className={event.importance >= 8 ? "important" : ""}>
            <time>{new Date(event.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</time>
            <div>
              <p>{event.summary}</p>
              {(event.npcIds.length > 0 || event.clueIds.length > 0) && (
                <small>
                  {[...event.npcIds.map((id) => missingLedgerCase.npcs.find((npc) => npc.id === id)?.name ?? id), ...event.clueIds.map((id) => missingLedgerCase.clues.find((clue) => clue.id === id)?.title ?? id)].join(" · ")}
                </small>
              )}
            </div>
          </article>
        ))}
        {filteredEvents.length === 0 && <p className="muted">没有匹配的调查记录。</p>}
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
  const resolvedContradictionIds = useGameStore((state) => state.resolvedContradictionIds);
  const confrontContradiction = useGameStore((state) => state.confrontContradiction);
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
  const availableContradictions = getAvailableContradictions(discoveredClueIds, resolvedContradictionIds)
    .filter((rule) => rule.npcIds.includes(currentNpcId));
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
        <Panel title="可对质矛盾" icon={ShieldQuestion}>
          <div className="confront-list">
            {availableContradictions.length === 0 && <p className="muted">收集到能互相印证的证据后，可以在这里向当前 NPC 对质。</p>}
            {availableContradictions.map((rule) => (
              <button key={rule.id} onClick={() => confrontContradiction(rule.id)}>
                <ShieldQuestion size={14} />
                <span>{rule.title}</span>
                <small>{rule.requiredClueIds.map((id) => missingLedgerCase.clues.find((clue) => clue.id === id)?.title ?? id).join("、")}</small>
              </button>
            ))}
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
    culpritNpcId: missingLedgerCase.npcs[0]?.id ?? "",
    motive: "",
    method: "",
    hiddenObjectLocationId: missingLedgerCase.truth.hiddenObjectLocationId,
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
        <Panel title={`1. 谁拿走了${hiddenObjectLabel()}`} icon={ShieldQuestion}>
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
          <textarea value={answer.motive} onChange={(event) => setAnswer({ ...answer, motive: event.target.value })} placeholder={`说明拿走${hiddenObjectLabel()}的目的、压力和受益关系。`} />
        </Panel>
        <Panel title="3. 作案过程" icon={KeyRound}>
          <textarea value={answer.method} onChange={(event) => setAnswer({ ...answer, method: event.target.value })} placeholder={`按时间说明接近现场、取走${hiddenObjectLabel()}和藏匿过程。`} />
        </Panel>
        <Panel title={`4. ${hiddenObjectLabel()}现在在哪里`} icon={Library}>
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
                <p>{hiddenObjectLabel()}位置：{missingLedgerCase.locations.find((location) => location.id === lastFinalDeduction.hiddenObjectLocationId)?.name ?? lastFinalDeduction.hiddenObjectLocationId}</p>
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
                <span>{stageName(save.currentStageId, save.caseId)} · 线索 {save.discoveredClueCount}/{getCasePackage(save.caseId).clues.length}</span>
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

function stageName(stageId: string, caseId?: string) {
  return getCasePackage(caseId ?? missingLedgerCase.manifest.id).stages.find((stage) => stage.id === stageId)?.name ?? stageId;
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
