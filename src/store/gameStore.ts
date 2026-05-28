import { create } from "zustand";
import { activeCasePackage as missingLedgerCase, defaultCaseId, setActiveCaseId } from "../data/casePackage";
import { getAvailableContradictions, getContradictionRule } from "../domain/contradictionRules";
import { scoreDeduction } from "../domain/deduction";
import { getAvailableDeductionRules, getDeductionRule } from "../domain/deductionRules";
import { buildEndingReview } from "../domain/endingReview";
import { moveEvidenceChainItem, toggleEvidenceChainItem } from "../domain/evidenceChain";
import type {
  ClueMark,
  DeductionScore,
  DeductionNote,
  DialogueMessage,
  FinalDeduction,
  InvestigationEvent,
  SaveSnapshot,
  SaveSummary,
  StageId,
} from "../domain/types";
import { createNpcReply } from "../services/deepseek";
import { isTauriRuntime, localSaveRepository, tauriSaveRepository } from "../storage/saveRepository";

type View = "select" | "desk" | "interrogation" | "map" | "deduction" | "settings";

export type CurrentTask = {
  id: string;
  title: string;
  detail: string;
  view: View;
  priority: "high" | "medium" | "low";
  actionLabel: string;
  targetNpcId?: string;
};

const stageRank: Record<StageId, number> = { morning: 0, afternoon: 1, evening: 2 };

export function isStageAvailable(currentStageId: StageId, requiredStageId?: StageId) {
  return !requiredStageId || stageRank[currentStageId] >= stageRank[requiredStageId];
}

export function getStageGate(stageId: StageId, discoveredClueIds: string[], dialogue: DialogueMessage[]) {
  if (stageId === "morning") {
    const ok = discoveredClueIds.length >= 3;
    return {
      ok,
      message: ok ? "已完成上午初查，可以推进到下午。" : "上午阶段至少需要发现 3 条线索后再推进。",
    };
  }
  if (stageId === "afternoon") {
    const questionedNpcs = new Set(dialogue.filter((message) => message.role === "npc").map((message) => message.npcId));
    const ok = discoveredClueIds.length >= 10 && questionedNpcs.size >= 4;
    return {
      ok,
      message: ok
        ? "证词矛盾已经足够清晰，可以推进到傍晚。"
        : "下午阶段需要至少 10 条线索，并问询至少 4 名 NPC 后再推进。",
    };
  }
  return { ok: false, message: "傍晚阶段请整理证据并提交最终推理。" };
}

export function canUseTopic(stageId: StageId, discoveredClueIds: string[], topicId: string) {
  const topic = missingLedgerCase.topics.find((item) => item.id === topicId);
  if (!topic) return { ok: false, message: "话题不存在。" };
  if (stageRank[stageId] < stageRank[topic.stageId]) {
    return {
      ok: false,
      message: `${missingLedgerCase.stages.find((stage) => stage.id === topic.stageId)?.name}阶段后开放。`,
    };
  }
  const missing = topic.requiredClueIds.filter((id) => !discoveredClueIds.includes(id));
  if (missing.length > 0) {
    return { ok: false, message: "缺少触发线索。" };
  }
  return { ok: true, message: "可追问。" };
}

export function getFinalGate(stageId: StageId) {
  return {
    ok: stageId === "evening",
    message: stageId === "evening" ? "可以提交最终推理。" : "最终推理只能在傍晚阶段提交。",
  };
}

export function getCurrentTasks(params: {
  stageId: StageId;
  currentLocationId: string;
  currentNpcId: string;
  discoveredClueIds: string[];
  dialogue: DialogueMessage[];
  confrontedTopicIds: Record<string, string[]>;
  resolvedContradictionIds: string[];
}) {
  const {
    stageId,
    currentLocationId,
    currentNpcId,
    discoveredClueIds,
    dialogue,
    confrontedTopicIds,
    resolvedContradictionIds,
  } = params;
  const currentLocation = missingLedgerCase.locations.find((location) => location.id === currentLocationId);
  const currentNpc = missingLedgerCase.npcs.find((npc) => npc.id === currentNpcId);
  const stage = missingLedgerCase.stages.find((item) => item.id === stageId);
  const tasks: CurrentTask[] = [];
  const discovered = new Set(discoveredClueIds);

  const openObjects = (currentLocation?.searchableObjects ?? []).filter((object) => {
    const available = isStageAvailable(stageId, object.requiredStageId);
    const hasHiddenClue = object.clueIds.some((clueId) => !discovered.has(clueId));
    return available && hasHiddenClue;
  });
  if (openObjects.length > 0) {
    tasks.push({
      id: `search_${currentLocationId}`,
      title: `搜查${currentLocation?.name ?? "当前位置"}`,
      detail: `优先检查：${openObjects.slice(0, 2).map((object) => object.name).join("、")}。`,
      view: "desk",
      priority: "high",
      actionLabel: "去调查",
    });
  }

  const availableCurrentNpcTopics = missingLedgerCase.topics.filter((topic) => {
    const alreadyAsked = confrontedTopicIds[topic.npcId]?.includes(topic.id);
    return topic.npcId === currentNpcId && !alreadyAsked && canUseTopic(stageId, discoveredClueIds, topic.id).ok;
  });
  if (availableCurrentNpcTopics.length > 0) {
    tasks.push({
      id: `topic_${currentNpcId}`,
      title: `追问${currentNpc?.name ?? "当前嫌疑人"}`,
      detail: `可追问：${availableCurrentNpcTopics.slice(0, 2).map((topic) => topic.title).join("、")}。`,
      view: "interrogation",
      priority: "high",
      actionLabel: "去问询",
    });
  }

  const availableAnyNpcTopic = missingLedgerCase.topics.find((topic) => {
    const alreadyAsked = confrontedTopicIds[topic.npcId]?.includes(topic.id);
    return !alreadyAsked && canUseTopic(stageId, discoveredClueIds, topic.id).ok;
  });
  if (availableAnyNpcTopic && availableAnyNpcTopic.npcId !== currentNpcId) {
    const npc = missingLedgerCase.npcs.find((item) => item.id === availableAnyNpcTopic.npcId);
    tasks.push({
      id: `topic_any_${availableAnyNpcTopic.id}`,
      title: `找${npc?.name ?? "相关人物"}核对证词`,
      detail: `“${availableAnyNpcTopic.title}”已经可以追问。`,
      view: "interrogation",
      priority: "medium",
      actionLabel: "切换问询",
      targetNpcId: availableAnyNpcTopic.npcId,
    });
  }

  const contradictions = getAvailableContradictions(discoveredClueIds, resolvedContradictionIds);
  if (contradictions.length > 0) {
    tasks.push({
      id: "contradiction",
      title: "指出证词矛盾",
      detail: contradictions[0].title,
      view: "desk",
      priority: "high",
      actionLabel: "去线索板",
    });
  }

  const deductions = getAvailableDeductionRules(discoveredClueIds);
  if (deductions.length > 0) {
    tasks.push({
      id: "deduction",
      title: "组合关键线索",
      detail: deductions[0].title,
      view: "desk",
      priority: "high",
      actionLabel: "形成推理",
    });
  }

  const stageGate = getStageGate(stageId, discoveredClueIds, dialogue);
  if (stageGate.ok) {
    tasks.push({
      id: "advance_stage",
      title: `推进到下一阶段`,
      detail: stageId === "morning" ? "上午初查已足够，可以进入下午追问。" : "证词矛盾已足够，可以进入傍晚整理真相。",
      view: "desk",
      priority: "medium",
      actionLabel: "推进阶段",
    });
  } else if (stageId !== "evening") {
    tasks.push({
      id: "stage_gate",
      title: `${stage?.name ?? "当前阶段"}目标`,
      detail: stageGate.message,
      view: "desk",
      priority: "low",
      actionLabel: "继续调查",
    });
  }

  if (stageId === "evening") {
    tasks.push({
      id: "final",
      title: "提交最终推理",
      detail: "确认真凶、动机、作案过程、藏匿地点和关键证据。",
      view: "deduction",
      priority: "high",
      actionLabel: "去推理",
    });
  }

  return tasks.sort((left, right) => {
    const rank = { high: 0, medium: 1, low: 2 };
    return rank[left.priority] - rank[right.priority];
  }).slice(0, 4);
}

type GameState = {
  view: View;
  activeCaseId: string;
  activeSaveId?: string;
  saveSummaries: SaveSummary[];
  stageId: StageId;
  currentLocationId: string;
  currentNpcId: string;
  discoveredClueIds: string[];
  clueMarks: Record<string, ClueMark>;
  npcTrustScores: Record<string, number>;
  confrontedTopicIds: Record<string, string[]>;
  revealedFactIds: Record<string, string[]>;
  resolvedContradictionIds: string[];
  dialogue: DialogueMessage[];
  events: InvestigationEvent[];
  note: string;
  deductionNotes: DeductionNote[];
  evidenceChainIds: string[];
  apiKeyConfigured: boolean;
  aiBusy: boolean;
  aiError?: string;
  lastFinalDeduction?: FinalDeduction;
  finalScore?: DeductionScore;
  endingReview?: string;
  hydrateDesktopStorage: () => Promise<void>;
  refreshSaves: () => void;
  setView: (view: View) => void;
  startNewGame: (caseId?: string) => void;
  loadSave: (saveId: string) => void;
  deleteSave: (saveId: string) => void;
  selectLocation: (locationId: string) => void;
  selectNpc: (npcId: string) => void;
  investigateObject: (objectId: string) => void;
  askTopic: (topicId: string) => void;
  presentEvidenceToNpc: (clueId: string) => void;
  askFreeQuestion: (message: string) => Promise<void>;
  combineDeduction: (ruleId: string) => void;
  identifyContradiction: (ruleId: string) => void;
  confrontContradiction: (ruleId: string) => void;
  markClue: (clueId: string, mark: ClueMark) => void;
  setNote: (note: string) => void;
  toggleEvidenceChainClue: (clueId: string) => void;
  moveEvidenceChainClue: (draggedId: string, targetId: string) => void;
  advanceStage: () => void;
  setApiKeyConfigured: (configured: boolean) => void;
  saveApiKey: (apiKey: string) => void;
  submitFinal: (answer: FinalDeduction) => DeductionScore;
};

const now = () => new Date().toISOString();
const createId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
const createSaveId = () => `save_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const firstLocationId = () => missingLedgerCase.locations.find((location) => location.id === "town_hall")?.id ?? missingLedgerCase.locations[0]?.id ?? "square";
const firstNpcId = () =>
  missingLedgerCase.npcs.find((npc) => npc.locationId === firstLocationId())?.id ?? missingLedgerCase.npcs[0]?.id ?? "";

const initialEvent = (): InvestigationEvent => ({
  id: createId("event"),
  stageId: "morning",
  type: "stage",
  summary: `你抵达小镇，接下${missingLedgerCase.caseFile.title}。`,
  npcIds: [],
  clueIds: [],
  importance: 8,
  createdAt: now(),
});

const settings = localSaveRepository.loadSettings();
const initialTrustScores = () =>
  Object.fromEntries(missingLedgerCase.npcs.map((npc) => [npc.id, npc.trustScore]));
const clampTrust = (value: number) => Math.max(0, Math.min(100, value));
const addUnique = (items: string[] | undefined, additions: string[]) => Array.from(new Set([...(items ?? []), ...additions]));

function snapshotFromState(state: GameState): SaveSnapshot | undefined {
  if (!state.activeSaveId) return undefined;
  const existing = localSaveRepository.loadSave(state.activeSaveId);
  const updatedAt = now();
  return {
    id: state.activeSaveId,
    caseId: missingLedgerCase.manifest.id,
    caseVersion: missingLedgerCase.manifest.version,
    currentStageId: state.stageId,
    currentLocationId: state.currentLocationId,
    currentNpcId: state.currentNpcId,
    discoveredClueIds: state.discoveredClueIds,
    clueMarks: state.clueMarks,
    npcTrustScores: state.npcTrustScores,
    confrontedTopicIds: state.confrontedTopicIds,
    revealedFactIds: state.revealedFactIds,
    resolvedContradictionIds: state.resolvedContradictionIds,
    dialogue: state.dialogue,
    events: state.events,
    note: state.note,
    deductionNotes: state.deductionNotes,
    evidenceChainIds: state.evidenceChainIds,
    lastFinalDeduction: state.lastFinalDeduction,
    finalScore: state.finalScore,
    endingReview: state.endingReview,
    createdAt: existing?.createdAt ?? updatedAt,
    updatedAt,
    completedAt: state.finalScore ? (existing?.completedAt ?? updatedAt) : existing?.completedAt,
  };
}

function persistState(state: GameState) {
  const snapshot = snapshotFromState(state);
  if (!snapshot) return;
  localSaveRepository.upsertSave(snapshot);
  localSaveRepository.saveSettings({ ...localSaveRepository.loadSettings(), recentSaveId: snapshot.id });
  if (isTauriRuntime()) {
    void tauriSaveRepository.upsertSave(snapshot).catch((error) => {
      console.error("SQLite save failed", error);
    });
    void tauriSaveRepository
      .saveSettings({ ...localSaveRepository.loadSettings(), recentSaveId: snapshot.id })
      .catch((error) => {
        console.error("SQLite settings save failed", error);
      });
  }
}

export const useGameStore = create<GameState>((set, get) => ({
  view: "select",
  activeCaseId: defaultCaseId,
  activeSaveId: settings.recentSaveId,
  saveSummaries: localSaveRepository.listSaves(),
  stageId: "morning",
  currentLocationId: firstLocationId(),
  currentNpcId: firstNpcId(),
  discoveredClueIds: [],
  clueMarks: {},
  npcTrustScores: initialTrustScores(),
  confrontedTopicIds: {},
  revealedFactIds: {},
  resolvedContradictionIds: [],
  dialogue: [],
  events: [initialEvent()],
  note: "",
  deductionNotes: [],
  evidenceChainIds: [],
  apiKeyConfigured: Boolean(settings.deepseekApiKey || import.meta.env.DEEPSEEK_API_KEY),
  aiBusy: false,
  aiError: undefined,
  lastFinalDeduction: undefined,
  endingReview: undefined,

  hydrateDesktopStorage: async () => {
    if (!isTauriRuntime()) return;
    try {
      const [desktopSettings, desktopSaves] = await Promise.all([
        tauriSaveRepository.loadSettings(),
        tauriSaveRepository.listSaves(),
      ]);
      localSaveRepository.saveSettings({ ...localSaveRepository.loadSettings(), ...desktopSettings });
      const recentSaveId = desktopSettings.recentSaveId ?? desktopSaves[0]?.id;
      if (recentSaveId) {
        const snapshot = await tauriSaveRepository.loadSave(recentSaveId);
        if (snapshot) {
          setActiveCaseId(snapshot.caseId);
          localSaveRepository.upsertSave(snapshot);
          set({
            activeCaseId: snapshot.caseId,
            activeSaveId: snapshot.id,
            saveSummaries: localSaveRepository.listSaves(),
            stageId: snapshot.currentStageId,
            currentLocationId: snapshot.currentLocationId,
            currentNpcId: snapshot.currentNpcId,
            discoveredClueIds: snapshot.discoveredClueIds,
            clueMarks: snapshot.clueMarks,
            npcTrustScores: snapshot.npcTrustScores ?? initialTrustScores(),
            confrontedTopicIds: snapshot.confrontedTopicIds ?? {},
            revealedFactIds: snapshot.revealedFactIds ?? {},
            resolvedContradictionIds: snapshot.resolvedContradictionIds ?? [],
            dialogue: snapshot.dialogue,
            events: snapshot.events,
            note: snapshot.note,
            deductionNotes: snapshot.deductionNotes ?? [],
            evidenceChainIds: snapshot.evidenceChainIds ?? [],
            lastFinalDeduction: snapshot.lastFinalDeduction,
            finalScore: snapshot.finalScore,
            endingReview: snapshot.endingReview,
            apiKeyConfigured: Boolean(desktopSettings.deepseekApiKey || import.meta.env.DEEPSEEK_API_KEY),
          });
          return;
        }
      }
      set({
        saveSummaries: desktopSaves,
        apiKeyConfigured: Boolean(desktopSettings.deepseekApiKey || import.meta.env.DEEPSEEK_API_KEY),
      });
    } catch (error) {
      console.error("SQLite hydrate failed", error);
    }
  },
  refreshSaves: () => set({ saveSummaries: localSaveRepository.listSaves() }),
  setView: (view) => set({ view }),
  startNewGame: (caseId = defaultCaseId) => {
    setActiveCaseId(caseId);
    const createdAt = now();
    const saveId = createSaveId();
    const initial: SaveSnapshot = {
      id: saveId,
      caseId: missingLedgerCase.manifest.id,
      caseVersion: missingLedgerCase.manifest.version,
      currentStageId: "morning",
      currentLocationId: firstLocationId(),
      currentNpcId: firstNpcId(),
      discoveredClueIds: [],
      clueMarks: {},
      npcTrustScores: initialTrustScores(),
      confrontedTopicIds: {},
      revealedFactIds: {},
      resolvedContradictionIds: [],
      dialogue: [],
      events: [initialEvent()],
      note: "",
      deductionNotes: [],
      evidenceChainIds: [],
      createdAt,
      updatedAt: createdAt,
    };
    localSaveRepository.upsertSave(initial);
    localSaveRepository.saveSettings({ ...localSaveRepository.loadSettings(), recentSaveId: saveId });
    if (isTauriRuntime()) {
      void tauriSaveRepository.upsertSave(initial).catch((error) => console.error("SQLite save failed", error));
      void tauriSaveRepository
        .saveSettings({ ...localSaveRepository.loadSettings(), recentSaveId: saveId })
        .catch((error) => console.error("SQLite settings save failed", error));
    }
    set({
      activeCaseId: missingLedgerCase.manifest.id,
      activeSaveId: saveId,
      view: "desk",
      saveSummaries: localSaveRepository.listSaves(),
      stageId: initial.currentStageId,
      currentLocationId: initial.currentLocationId,
      currentNpcId: initial.currentNpcId,
      discoveredClueIds: initial.discoveredClueIds,
      clueMarks: initial.clueMarks,
      npcTrustScores: initial.npcTrustScores,
      confrontedTopicIds: initial.confrontedTopicIds,
      revealedFactIds: initial.revealedFactIds,
      resolvedContradictionIds: initial.resolvedContradictionIds,
      dialogue: initial.dialogue,
      events: initial.events,
      note: initial.note,
      deductionNotes: initial.deductionNotes,
      evidenceChainIds: initial.evidenceChainIds,
      finalScore: undefined,
      lastFinalDeduction: undefined,
      endingReview: undefined,
    });
  },
  loadSave: (saveId) => {
    const snapshot = localSaveRepository.loadSave(saveId);
    if (!snapshot) return;
    setActiveCaseId(snapshot.caseId);
    localSaveRepository.saveSettings({ ...localSaveRepository.loadSettings(), recentSaveId: saveId });
    set({
      activeCaseId: snapshot.caseId,
      activeSaveId: saveId,
      view: "desk",
      saveSummaries: localSaveRepository.listSaves(),
      stageId: snapshot.currentStageId,
      currentLocationId: snapshot.currentLocationId,
      currentNpcId: snapshot.currentNpcId,
      discoveredClueIds: snapshot.discoveredClueIds,
      clueMarks: snapshot.clueMarks,
      npcTrustScores: snapshot.npcTrustScores ?? initialTrustScores(),
      confrontedTopicIds: snapshot.confrontedTopicIds ?? {},
      revealedFactIds: snapshot.revealedFactIds ?? {},
      resolvedContradictionIds: snapshot.resolvedContradictionIds ?? [],
      dialogue: snapshot.dialogue,
      events: snapshot.events,
      note: snapshot.note,
      deductionNotes: snapshot.deductionNotes ?? [],
      evidenceChainIds: snapshot.evidenceChainIds ?? [],
      lastFinalDeduction: snapshot.lastFinalDeduction,
      finalScore: snapshot.finalScore,
      endingReview: snapshot.endingReview,
    });
  },
  deleteSave: (saveId) => {
    localSaveRepository.deleteSave(saveId);
    if (isTauriRuntime()) {
      const settings = localSaveRepository.loadSettings();
      void tauriSaveRepository
        .deleteSave(saveId)
        .then(() => tauriSaveRepository.saveSettings(settings))
        .catch((error) => console.error("SQLite delete failed", error));
    }
    set((state) => ({
      activeSaveId: state.activeSaveId === saveId ? undefined : state.activeSaveId,
      saveSummaries: localSaveRepository.listSaves(),
      view: state.activeSaveId === saveId ? "select" : state.view,
    }));
  },
  selectLocation: (locationId) => {
    set({ currentLocationId: locationId, view: "desk" });
    persistState(get());
  },
  selectNpc: (npcId) => {
    set({ currentNpcId: npcId, view: "interrogation" });
    persistState(get());
  },
  investigateObject: (objectId) => {
    const state = get();
    const location = missingLedgerCase.locations.find((item) => item.id === state.currentLocationId);
    const object = location?.searchableObjects.find((item) => item.id === objectId);
    if (!object) return;

    const available = isStageAvailable(state.stageId, object.requiredStageId);
    if (!available) {
      set({
        events: [
          {
            id: createId("event"),
            stageId: state.stageId,
            type: "clue",
            summary: `${object.name} 最早在${missingLedgerCase.stages.find((stage) => stage.id === object.requiredStageId)?.name}阶段开放调查。`,
            npcIds: [],
            clueIds: [],
            locationId: location?.id,
            importance: 3,
            createdAt: now(),
          },
          ...state.events,
        ],
      });
      persistState(get());
      return;
    }

    const newClueIds = object.clueIds.filter((id) => !state.discoveredClueIds.includes(id));
    const discoveredClues = missingLedgerCase.clues.filter((clue) => newClueIds.includes(clue.id));
    set({
      discoveredClueIds: [...state.discoveredClueIds, ...newClueIds],
      events:
        discoveredClues.length > 0
          ? [
              ...discoveredClues.map((clue) => ({
                id: createId("event"),
                stageId: state.stageId,
                type: "clue" as const,
                summary: clue.discoveryText,
                npcIds: clue.relatedNpcIds,
                clueIds: [clue.id],
                locationId: location?.id,
                importance: clue.isKey ? 9 : 5,
                createdAt: now(),
              })),
              ...state.events,
            ]
          : [
              {
                id: createId("event"),
                stageId: state.stageId,
                type: "clue",
                summary: `你检查了${object.name}，暂时没有发现新的关键线索。`,
                npcIds: [],
                clueIds: [],
                locationId: location?.id,
                importance: 2,
                createdAt: now(),
              },
              ...state.events,
            ],
    });
    persistState(get());
  },
  askTopic: (topicId) => {
    const state = get();
    const topic = missingLedgerCase.topics.find((item) => item.id === topicId);
    if (!topic) return;
    const npc = missingLedgerCase.npcs.find((item) => item.id === topic.npcId);
    const topicGate = canUseTopic(state.stageId, state.discoveredClueIds, topicId);
    if (!topicGate.ok) {
      set({
        events: [
          {
            id: createId("event"),
            stageId: state.stageId,
            type: "dialogue",
            summary: `暂时无法追问“${topic.title}”：${topicGate.message}`,
            npcIds: [topic.npcId],
            clueIds: topic.requiredClueIds,
            importance: 2,
            createdAt: now(),
          },
          ...state.events,
        ],
      });
      persistState(get());
      return;
    }

    const revealed = topic.revealsClueIds.filter((id) => !state.discoveredClueIds.includes(id));
    const playerMessage: DialogueMessage = {
      id: createId("msg"),
      npcId: topic.npcId,
      topicId,
      role: "player",
      content: topic.promptHint,
      createdAt: now(),
    };
    const npcMessage: DialogueMessage = {
      id: createId("msg"),
      npcId: topic.npcId,
      topicId,
      role: "npc",
      content: topic.response,
      createdAt: now(),
    };

    set({
      discoveredClueIds: [...state.discoveredClueIds, ...revealed],
      npcTrustScores: {
        ...state.npcTrustScores,
        [topic.npcId]: clampTrust((state.npcTrustScores[topic.npcId] ?? npc?.trustScore ?? 50) + (topic.attitudeDelta ?? 0)),
      },
      confrontedTopicIds: {
        ...state.confrontedTopicIds,
        [topic.npcId]: addUnique(state.confrontedTopicIds[topic.npcId], [topic.id]),
      },
      dialogue: [...state.dialogue, playerMessage, npcMessage],
      events: [
        {
          id: createId("event"),
          stageId: state.stageId,
          type: "dialogue",
          summary: `${npc?.name ?? "NPC"}回应了“${topic.title}”：${topic.response}`,
          npcIds: [topic.npcId],
          clueIds: [...topic.requiredClueIds, ...revealed],
          importance: topic.revealsClueIds.length > 0 || topic.requiredClueIds.length > 0 ? 8 : 4,
          createdAt: now(),
        },
        ...state.events,
      ],
    });
    persistState(get());
  },
  presentEvidenceToNpc: (clueId) => {
    const state = get();
    const clue = missingLedgerCase.clues.find((item) => item.id === clueId);
    const npc = missingLedgerCase.npcs.find((item) => item.id === state.currentNpcId);
    if (!clue || !npc || !state.discoveredClueIds.includes(clueId)) return;

    const matchingTopic = missingLedgerCase.topics.find((topic) => {
      const alreadyAsked = state.confrontedTopicIds[topic.npcId]?.includes(topic.id);
      return (
        topic.npcId === npc.id &&
        !alreadyAsked &&
        topic.requiredClueIds.includes(clueId) &&
        canUseTopic(state.stageId, state.discoveredClueIds, topic.id).ok
      );
    });
    if (matchingTopic) {
      get().askTopic(matchingTopic.id);
      return;
    }

    const related = clue.relatedNpcIds.includes(npc.id);
    const playerMessage: DialogueMessage = {
      id: createId("msg"),
      npcId: npc.id,
      role: "player",
      content: `出示证据：${clue.title}`,
      createdAt: now(),
    };
    const npcMessage: DialogueMessage = {
      id: createId("msg"),
      npcId: npc.id,
      role: "npc",
      content: related
        ? `这件事确实和我知道的情况有关，但仅凭“${clue.title}”还不能让我补充更多。你需要把它和其他线索一起对照。`
        : `“${clue.title}”看起来重要，但它和我的行踪关系不大。你最好拿去问更相关的人。`,
      createdAt: now(),
    };
    set({
      npcTrustScores: {
        ...state.npcTrustScores,
        [npc.id]: clampTrust((state.npcTrustScores[npc.id] ?? npc.trustScore) + (related ? 0 : -1)),
      },
      dialogue: [...state.dialogue, playerMessage, npcMessage],
      events: [
        {
          id: createId("event"),
          stageId: state.stageId,
          type: "dialogue",
          summary: related
            ? `${npc.name}看过“${clue.title}”，但还需要更多线索才能突破。`
            : `${npc.name}认为“${clue.title}”应出示给更相关的人。`,
          npcIds: [npc.id],
          clueIds: [clue.id],
          importance: related ? 4 : 2,
          createdAt: now(),
        },
        ...state.events,
      ],
    });
    persistState(get());
  },
  askFreeQuestion: async (message) => {
    const trimmed = message.trim();
    if (!trimmed) return;
    const state = get();
    const npc = missingLedgerCase.npcs.find((item) => item.id === state.currentNpcId);
    if (!npc) return;

    const playerMessage: DialogueMessage = {
      id: createId("msg"),
      npcId: npc.id,
      role: "player",
      content: trimmed,
      createdAt: now(),
    };

    set({ aiBusy: true, aiError: undefined, dialogue: [...state.dialogue, playerMessage] });
    persistState(get());

    const settings = localSaveRepository.loadSettings();
    const result = await createNpcReply({
      apiKey: settings.deepseekApiKey,
      npc,
      playerMessage: trimmed,
      stageId: state.stageId,
      discoveredClues: missingLedgerCase.clues.filter((clue) => state.discoveredClueIds.includes(clue.id)).slice(0, 6),
      recentEvents: state.events.slice(0, 10),
      recentDialogue: state.dialogue.filter((item) => item.npcId === npc.id).slice(-8),
    });

    const current = get();
    const replyText = result.reply?.text ?? result.error ?? "NPC 暂时没有回应。";
    const npcMessage: DialogueMessage = {
      id: createId("msg"),
      npcId: npc.id,
      role: "npc",
      content: replyText,
      createdAt: now(),
    };
    const event: InvestigationEvent = {
      id: createId("event"),
      stageId: current.stageId,
      type: "dialogue",
      summary: result.reply?.logSummary ?? `${npc.name}回应了自由问询。`,
      npcIds: [npc.id],
      clueIds: current.discoveredClueIds.filter((id) => replyText.includes(missingLedgerCase.clues.find((clue) => clue.id === id)?.title ?? "")),
      importance: result.ok ? 5 : 3,
      createdAt: now(),
    };

    set({
      aiBusy: false,
      aiError: result.ok ? undefined : result.error,
      npcTrustScores: {
        ...current.npcTrustScores,
        [npc.id]: clampTrust((current.npcTrustScores[npc.id] ?? npc.trustScore) + (result.reply?.attitudeDelta ?? 0)),
      },
      revealedFactIds: {
        ...current.revealedFactIds,
        [npc.id]: addUnique(current.revealedFactIds[npc.id], result.reply?.revealedFactIds ?? []),
      },
      dialogue: [...current.dialogue, npcMessage],
      events: [event, ...current.events],
    });
    persistState(get());
  },
  combineDeduction: (ruleId) => {
    const state = get();
    const rule = getDeductionRule(ruleId);
    if (!rule) return;
    const hasRequirements = rule.requiredClueIds.every((id) => state.discoveredClueIds.includes(id));
    const alreadyCreated = state.discoveredClueIds.includes(rule.resultClueId);
    if (!hasRequirements || alreadyCreated) return;
    const resultClue = missingLedgerCase.clues.find((clue) => clue.id === rule.resultClueId);
    if (!resultClue) return;
    const noteLine = `\n[${rule.title}] ${rule.note}`;
    const deductionNote: DeductionNote = {
      id: `deduction_note_${rule.id}`,
      title: rule.title,
      content: rule.note,
      linkedClueIds: [...rule.requiredClueIds, rule.resultClueId],
      updatedAt: now(),
    };
    set({
      discoveredClueIds: [...state.discoveredClueIds, rule.resultClueId],
      note: state.note.includes(rule.note) ? state.note : `${state.note}${noteLine}`.trim(),
      deductionNotes: state.deductionNotes.some((item) => item.id === deductionNote.id)
        ? state.deductionNotes
        : [...state.deductionNotes, deductionNote],
      events: [
        {
          id: createId("event"),
          stageId: state.stageId,
          type: "note",
          summary: resultClue.discoveryText,
          npcIds: resultClue.relatedNpcIds,
          clueIds: [...rule.requiredClueIds, rule.resultClueId],
          importance: 8,
          createdAt: now(),
        },
        ...state.events,
      ],
    });
    persistState(get());
  },
  identifyContradiction: (ruleId) => {
    const state = get();
    const rule = getContradictionRule(ruleId);
    if (!rule) return;
    const hasRequiredClues = rule.requiredClueIds.every((id) => state.discoveredClueIds.includes(id));
    if (!hasRequiredClues || state.resolvedContradictionIds.includes(rule.id)) return;
    const nextTrustScores = { ...state.npcTrustScores };
    rule.npcIds.forEach((npcId) => {
      const npc = missingLedgerCase.npcs.find((item) => item.id === npcId);
      nextTrustScores[npcId] = clampTrust((nextTrustScores[npcId] ?? npc?.trustScore ?? 50) - 2);
    });
    set({
      resolvedContradictionIds: [...state.resolvedContradictionIds, rule.id],
      npcTrustScores: nextTrustScores,
      events: [
        {
          id: createId("event"),
          stageId: state.stageId,
          type: "contradiction",
          summary: rule.summary,
          npcIds: rule.npcIds,
          clueIds: rule.requiredClueIds,
          importance: 9,
          createdAt: now(),
        },
        ...state.events,
      ],
    });
    persistState(get());
  },
  confrontContradiction: (ruleId) => {
    const state = get();
    const rule = getContradictionRule(ruleId);
    const npc = missingLedgerCase.npcs.find((item) => item.id === state.currentNpcId);
    if (!rule || !npc) return;
    const hasRequiredClues = rule.requiredClueIds.every((id) => state.discoveredClueIds.includes(id));
    if (!hasRequiredClues || state.resolvedContradictionIds.includes(rule.id) || !rule.npcIds.includes(npc.id)) return;

    const nextTrustScores = { ...state.npcTrustScores };
    rule.npcIds.forEach((npcId) => {
      const targetNpc = missingLedgerCase.npcs.find((item) => item.id === npcId);
      nextTrustScores[npcId] = clampTrust((nextTrustScores[npcId] ?? targetNpc?.trustScore ?? 50) - (npcId === npc.id ? 4 : 2));
    });

    const playerMessage: DialogueMessage = {
      id: createId("msg"),
      npcId: npc.id,
      role: "player",
      content: `对质：${rule.title}`,
      createdAt: now(),
    };
    const npcMessage: DialogueMessage = {
      id: createId("msg"),
      npcId: npc.id,
      role: "npc",
      content: `你把证据摆到我面前，我不能再把这件事说成巧合。${rule.summary}`,
      createdAt: now(),
    };

    set({
      resolvedContradictionIds: [...state.resolvedContradictionIds, rule.id],
      npcTrustScores: nextTrustScores,
      dialogue: [...state.dialogue, playerMessage, npcMessage],
      events: [
        {
          id: createId("event"),
          stageId: state.stageId,
          type: "contradiction",
          summary: `你向${npc.name}对质“${rule.title}”：${rule.summary}`,
          npcIds: rule.npcIds,
          clueIds: rule.requiredClueIds,
          importance: 9,
          createdAt: now(),
        },
        ...state.events,
      ],
    });
    persistState(get());
  },
  markClue: (clueId, mark) => {
    set((state) => ({ clueMarks: { ...state.clueMarks, [clueId]: mark } }));
    persistState(get());
  },
  setNote: (note) => {
    const state = get();
    const manualNote: DeductionNote = {
      id: "manual_note",
      title: "手写推理记录",
      content: note,
      linkedClueIds: [],
      updatedAt: now(),
    };
    set({
      note,
      deductionNotes: note.trim()
        ? [manualNote, ...state.deductionNotes.filter((item) => item.id !== manualNote.id)]
        : state.deductionNotes.filter((item) => item.id !== manualNote.id),
    });
    persistState(get());
  },
  toggleEvidenceChainClue: (clueId) => {
    const state = get();
    set({ evidenceChainIds: toggleEvidenceChainItem(state.evidenceChainIds, clueId) });
    persistState(get());
  },
  moveEvidenceChainClue: (draggedId, targetId) => {
    const state = get();
    set({ evidenceChainIds: moveEvidenceChainItem(state.evidenceChainIds, draggedId, targetId) });
    persistState(get());
  },
  advanceStage: () => {
    const state = get();
    const gate = getStageGate(state.stageId, state.discoveredClueIds, state.dialogue);
    if (!gate.ok) {
      set({
        events: [
          {
            id: createId("event"),
            stageId: state.stageId,
            type: "stage",
            summary: gate.message,
            npcIds: [],
            clueIds: [],
            importance: 3,
            createdAt: now(),
          },
          ...state.events,
        ],
      });
      persistState(get());
      return;
    }
    const nextStage: Record<StageId, StageId> = { morning: "afternoon", afternoon: "evening", evening: "evening" };
    const next = nextStage[state.stageId];
    if (next === state.stageId) return;
    set({
      stageId: next,
      events: [
        {
          id: createId("event"),
          stageId: next,
          type: "stage",
          summary: `调查推进到${missingLedgerCase.stages.find((stage) => stage.id === next)?.name}。NPC 位置和可追问话题发生变化。`,
          npcIds: [],
          clueIds: [],
          importance: 7,
          createdAt: now(),
        },
        ...state.events,
      ],
    });
    persistState(get());
  },
  setApiKeyConfigured: (configured) => {
    const current = localSaveRepository.loadSettings();
    localSaveRepository.saveSettings({ ...current, deepseekApiKey: configured ? current.deepseekApiKey : undefined });
    if (isTauriRuntime()) {
      void tauriSaveRepository
        .saveSettings({ ...current, deepseekApiKey: configured ? current.deepseekApiKey : undefined })
        .catch((error) => console.error("SQLite settings save failed", error));
    }
    set({ apiKeyConfigured: configured });
  },
  saveApiKey: (apiKey) => {
    const trimmed = apiKey.trim();
    const current = localSaveRepository.loadSettings();
    const nextSettings = { ...current, deepseekApiKey: trimmed || undefined };
    localSaveRepository.saveSettings(nextSettings);
    if (isTauriRuntime()) {
      void tauriSaveRepository.saveSettings(nextSettings).catch((error) => console.error("SQLite settings save failed", error));
    }
    set({ apiKeyConfigured: Boolean(trimmed || import.meta.env.DEEPSEEK_API_KEY), aiError: undefined });
  },
  submitFinal: (answer) => {
    const state = get();
    const gate = getFinalGate(state.stageId);
    if (!gate.ok) {
      const score: DeductionScore = {
        culpritCorrect: false,
        motiveCorrect: false,
        methodCorrect: false,
        locationCorrect: false,
        evidenceCoverage: 0,
        ending: "insufficient",
        reasons: [gate.message],
      };
      const review = buildEndingReview(answer, score);
      set({
        finalScore: score,
        lastFinalDeduction: answer,
        endingReview: review,
        events: [
          {
            id: createId("event"),
            stageId: state.stageId,
            type: "final",
            summary: gate.message,
            npcIds: [],
            clueIds: [],
            importance: 3,
            createdAt: now(),
          },
          ...state.events,
        ],
      });
      persistState(get());
      return score;
    }
    const score = scoreDeduction(answer, missingLedgerCase.truth);
    const review = buildEndingReview(answer, score);
    const currentState = get();
    set({
      finalScore: score,
      lastFinalDeduction: answer,
      endingReview: review,
      events: [
        {
          id: createId("event"),
          stageId: currentState.stageId,
          type: "final",
          summary: `你提交了最终推理：${score.ending === "perfect" ? "完美破解" : score.ending === "solved" ? "基本破解" : score.ending === "insufficient" ? "证据不足" : "误判"}。`,
          npcIds: [answer.culpritNpcId],
          clueIds: answer.evidenceClueIds,
          importance: 10,
          createdAt: now(),
        },
        ...currentState.events,
      ],
    });
    persistState(get());
    return score;
  },
}));
