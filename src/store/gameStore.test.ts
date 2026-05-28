import { beforeEach, describe, expect, it } from "vitest";
import { localSaveRepository } from "../storage/saveRepository";
import { getCurrentTasks, useGameStore } from "./gameStore";

describe("gameStore investigation loop", () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.getState().startNewGame();
  });

  it("discovers clues from town hall objects and logs them", () => {
    useGameStore.getState().investigateObject("spare_key_box");

    const state = useGameStore.getState();
    expect(state.discoveredClueIds).toContain("clue_spare_key_log");
    expect(state.events[0].summary).toContain("备用钥匙");
  });

  it("starts the canal masks case from the catalog id", () => {
    useGameStore.getState().startNewGame("canal-masks");

    useGameStore.getState().investigateObject("study_mask_stand");

    const state = useGameStore.getState();
    expect(state.activeCaseId).toBe("canal-masks");
    expect(state.currentLocationId).toBe("town_hall");
    expect(state.currentNpcId).toBe("sponsor_han");
    expect(state.discoveredClueIds).toContain("clue_mask_stand_paint");
    expect(state.events[0].summary).toContain("面具支架");
  });

  it("starts the station last train case from the catalog id", () => {
    useGameStore.getState().startNewGame("station-last-train");

    useGameStore.getState().investigateObject("signal_console");

    const state = useGameStore.getState();
    expect(state.activeCaseId).toBe("station-last-train");
    expect(state.currentLocationId).toBe("town_hall");
    expect(state.currentNpcId).toBe("stationmaster_du");
    expect(state.discoveredClueIds).toContain("clue_cut_recorder_wire");
    expect(state.events[0].summary).toContain("录音线");
  });

  it("unlocks topic responses when required clues are discovered", () => {
    useGameStore.getState().investigateObject("spare_key_box");
    useGameStore.getState().investigateObject("archive_cabinet");
    useGameStore.getState().investigateObject("archive_schedule");
    useGameStore.getState().advanceStage();
    const beforeTrust = useGameStore.getState().npcTrustScores.mayor_zhou;
    useGameStore.getState().askTopic("topic_mayor_key_log");

    const state = useGameStore.getState();
    expect(state.dialogue.some((message) => message.content.includes("短暂去过档案室"))).toBe(true);
    expect(state.confrontedTopicIds.mayor_zhou).toContain("topic_mayor_key_log");
    expect(state.npcTrustScores.mayor_zhou).toBeLessThan(beforeTrust);
  });

  it("surfaces current tasks from investigation progress", () => {
    let tasks = getCurrentTasks({
      stageId: useGameStore.getState().stageId,
      currentLocationId: useGameStore.getState().currentLocationId,
      currentNpcId: useGameStore.getState().currentNpcId,
      discoveredClueIds: useGameStore.getState().discoveredClueIds,
      dialogue: useGameStore.getState().dialogue,
      confrontedTopicIds: useGameStore.getState().confrontedTopicIds,
      resolvedContradictionIds: useGameStore.getState().resolvedContradictionIds,
    });
    expect(tasks[0].title).toContain("搜查镇公所");

    useGameStore.getState().investigateObject("spare_key_box");
    useGameStore.getState().investigateObject("archive_cabinet");
    useGameStore.getState().investigateObject("archive_schedule");
    useGameStore.getState().advanceStage();
    tasks = getCurrentTasks({
      stageId: useGameStore.getState().stageId,
      currentLocationId: useGameStore.getState().currentLocationId,
      currentNpcId: useGameStore.getState().currentNpcId,
      discoveredClueIds: useGameStore.getState().discoveredClueIds,
      dialogue: useGameStore.getState().dialogue,
      confrontedTopicIds: useGameStore.getState().confrontedTopicIds,
      resolvedContradictionIds: useGameStore.getState().resolvedContradictionIds,
    });
    expect(tasks.some((task) => task.title.includes("追问周启明"))).toBe(true);
  });

  it("presents evidence to unlock matching NPC topic responses", () => {
    useGameStore.getState().investigateObject("spare_key_box");
    useGameStore.getState().investigateObject("archive_cabinet");
    useGameStore.getState().investigateObject("archive_schedule");
    useGameStore.getState().advanceStage();

    useGameStore.getState().presentEvidenceToNpc("clue_spare_key_log");

    const state = useGameStore.getState();
    expect(state.confrontedTopicIds.mayor_zhou).toContain("topic_mayor_key_log");
    expect(state.dialogue.some((message) => message.content.includes("短暂去过档案室"))).toBe(true);
  });

  it("blocks stage advancement until investigation gates are satisfied", () => {
    useGameStore.getState().advanceStage();
    expect(useGameStore.getState().stageId).toBe("morning");
    expect(useGameStore.getState().events[0].summary).toContain("至少需要发现 3 条线索");

    useGameStore.getState().investigateObject("spare_key_box");
    useGameStore.getState().investigateObject("archive_cabinet");
    useGameStore.getState().investigateObject("archive_schedule");
    useGameStore.getState().advanceStage();
    expect(useGameStore.getState().stageId).toBe("afternoon");
  });

  it("keeps stage-gated clues discoverable after their first available stage", () => {
    useGameStore.setState({ stageId: "evening", currentLocationId: "town_hall" });

    useGameStore.getState().investigateObject("wastebasket");

    expect(useGameStore.getState().discoveredClueIds).toContain("clue_torn_ledger_page");
    expect(useGameStore.getState().events[0].summary).toContain("半张账页");
  });

  it("blocks final deduction before evening", () => {
    const score = useGameStore.getState().submitFinal({
      culpritNpcId: "mayor_zhou",
      motive: "旧桥修缮款挪用",
      method: "备用钥匙进入档案室",
      hiddenObjectLocationId: "library",
      evidenceClueIds: [],
    });

    expect(score.ending).toBe("insufficient");
    expect(score.reasons[0]).toContain("傍晚");
    expect(useGameStore.getState().lastFinalDeduction?.culpritNpcId).toBe("mayor_zhou");
  });

  it("persists submitted final deduction answer and score", () => {
    useGameStore.setState({
      stageId: "evening",
      discoveredClueIds: [
        "clue_spare_key_log",
        "clue_torn_ledger_page",
        "clue_library_dust_gap",
        "clue_mayor_reporter_argument",
        "clue_cafe_receipt_time",
        "clue_bridge_invoice_copy",
        "clue_council_meeting_minutes",
        "clue_library_call_slip",
        "deduction_motive_financial_chain",
        "deduction_hidden_route_library",
      ],
    });
    const saveId = useGameStore.getState().activeSaveId!;
    const answer = {
      culpritNpcId: "mayor_zhou",
      motive: "为掩盖旧桥修缮款挪用，担心记者曝光账本。",
      method: "用备用钥匙进入档案室，取走账本，撕下账页，把账本藏到图书馆旧报纸暗格。",
      hiddenObjectLocationId: "library",
      evidenceClueIds: [
        "clue_spare_key_log",
        "clue_torn_ledger_page",
        "clue_library_dust_gap",
        "clue_mayor_reporter_argument",
        "clue_cafe_receipt_time",
        "clue_bridge_invoice_copy",
        "clue_council_meeting_minutes",
        "clue_library_call_slip",
        "deduction_motive_financial_chain",
        "deduction_hidden_route_library",
      ],
    };

    const score = useGameStore.getState().submitFinal(answer);
    expect(score.ending).toBe("perfect");

    useGameStore.getState().startNewGame();
    useGameStore.getState().loadSave(saveId);
    expect(useGameStore.getState().lastFinalDeduction).toMatchObject({ culpritNpcId: "mayor_zhou" });
    expect(useGameStore.getState().finalScore?.ending).toBe("perfect");
    expect(useGameStore.getState().endingReview).toContain("标准真相");
  });

  it("persists and reloads investigation progress", () => {
    const saveId = useGameStore.getState().activeSaveId;
    expect(saveId).toBeTruthy();

    useGameStore.getState().investigateObject("spare_key_box");
    useGameStore.getState().markClue("clue_spare_key_log", "important");
    useGameStore.getState().setNote("钥匙记录打破镇长不在场证明。");

    useGameStore.getState().startNewGame();
    expect(useGameStore.getState().discoveredClueIds).not.toContain("clue_spare_key_log");

    useGameStore.getState().loadSave(saveId!);
    const restored = useGameStore.getState();
    expect(restored.discoveredClueIds).toContain("clue_spare_key_log");
    expect(restored.clueMarks.clue_spare_key_log).toBe("important");
    expect(restored.note).toContain("钥匙记录");
    expect(restored.deductionNotes.find((item) => item.id === "manual_note")?.linkedClueIds).toEqual([]);
    expect(restored.npcTrustScores.mayor_zhou).toBe(28);
  });

  it("deletes the current save and clears the recent save pointer", () => {
    const saveId = useGameStore.getState().activeSaveId;
    expect(saveId).toBeTruthy();

    useGameStore.getState().deleteSave(saveId!);

    expect(localSaveRepository.loadSave(saveId!)).toBeUndefined();
    expect(localSaveRepository.listSaves().some((save) => save.id === saveId)).toBe(false);
    expect(localSaveRepository.loadSettings().recentSaveId).toBeUndefined();
    expect(useGameStore.getState().activeSaveId).toBeUndefined();
    expect(useGameStore.getState().view).toBe("select");
  });

  it("maintains a draggable evidence chain and persists it", () => {
    const saveId = useGameStore.getState().activeSaveId!;

    useGameStore.getState().toggleEvidenceChainClue("clue_spare_key_log");
    useGameStore.getState().toggleEvidenceChainClue("clue_cafe_receipt_time");
    useGameStore.getState().moveEvidenceChainClue("clue_cafe_receipt_time", "clue_spare_key_log");

    expect(useGameStore.getState().evidenceChainIds).toEqual(["clue_cafe_receipt_time", "clue_spare_key_log"]);

    useGameStore.getState().startNewGame();
    useGameStore.getState().loadSave(saveId);
    expect(useGameStore.getState().evidenceChainIds).toEqual(["clue_cafe_receipt_time", "clue_spare_key_log"]);
  });

  it("combines discovered clues into deduction clues and notes", () => {
    useGameStore.getState().investigateObject("spare_key_box");
    useGameStore.getState().investigateObject("archive_schedule");
    useGameStore.getState().investigateObject("archive_cabinet");
    useGameStore.getState().advanceStage();
    useGameStore.getState().selectLocation("cafe");
    useGameStore.getState().investigateObject("cafe_counter");

    useGameStore.getState().combineDeduction("rule_mayor_alibi_broken");

    const state = useGameStore.getState();
    expect(state.discoveredClueIds).toContain("deduction_mayor_alibi_broken");
    expect(state.note).toContain("镇长并非整晚在会议室");
    expect(state.deductionNotes.find((item) => item.id === "deduction_note_rule_mayor_alibi_broken")?.linkedClueIds).toEqual([
      "clue_spare_key_log",
      "clue_archive_schedule",
      "clue_cafe_receipt_time",
      "deduction_mayor_alibi_broken",
    ]);
    expect(state.events[0].summary).toContain("镇长的不在场证明");
  });

  it("records identified contradictions with linked clues and NPCs", () => {
    useGameStore.getState().investigateObject("spare_key_box");
    useGameStore.getState().investigateObject("archive_schedule");
    useGameStore.getState().investigateObject("archive_cabinet");
    useGameStore.getState().advanceStage();
    useGameStore.getState().selectLocation("cafe");
    useGameStore.getState().investigateObject("cafe_counter");

    useGameStore.getState().identifyContradiction("contradiction_mayor_alibi");

    const state = useGameStore.getState();
    expect(state.resolvedContradictionIds).toContain("contradiction_mayor_alibi");
    expect(state.events[0]).toMatchObject({
      type: "contradiction",
      npcIds: ["mayor_zhou", "cafe_shen"],
      clueIds: ["clue_spare_key_log", "clue_archive_schedule", "clue_cafe_receipt_time"],
    });
  });

  it("confronts the current NPC with an available contradiction", () => {
    useGameStore.getState().investigateObject("spare_key_box");
    useGameStore.getState().investigateObject("archive_schedule");
    useGameStore.getState().investigateObject("archive_cabinet");
    useGameStore.getState().advanceStage();
    useGameStore.getState().selectLocation("cafe");
    useGameStore.getState().investigateObject("cafe_counter");
    useGameStore.getState().selectNpc("mayor_zhou");

    useGameStore.getState().confrontContradiction("contradiction_mayor_alibi");

    const state = useGameStore.getState();
    expect(state.resolvedContradictionIds).toContain("contradiction_mayor_alibi");
    expect(state.dialogue.some((message) => message.content.includes("对质：镇长整晚在会议室"))).toBe(true);
    expect(state.dialogue.some((message) => message.content.includes("不能再把这件事说成巧合"))).toBe(true);
    expect(state.events[0].summary).toContain("你向周启明对质");
  });
});
