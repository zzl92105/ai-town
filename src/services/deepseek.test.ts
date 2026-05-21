import { describe, expect, it } from "vitest";
import { missingLedgerCase } from "../data/casePackage";
import { buildNpcPrompt, createNpcReply, parseConstrainedNpcReply, parseNpcReply } from "./deepseek";

const npc = missingLedgerCase.npcs.find((item) => item.id === "librarian_lin")!;

describe("deepseek npc service", () => {
  it("builds constrained prompts without injecting the canonical case truth", () => {
    const prompt = buildNpcPrompt({
      apiKey: "test",
      npc,
      playerMessage: "你昨晚看到谁去了旧报纸区？",
      stageId: "afternoon",
      discoveredClues: [missingLedgerCase.clues.find((item) => item.id === "clue_library_dust_gap")!],
      recentEvents: [],
      recentDialogue: [],
    });

    expect(prompt.systemPrompt).toContain("不得编造新的关键证据");
    expect(prompt.userPrompt).toContain("林澈");
    expect(prompt.userPrompt).toContain("stageDisclosure");
    expect(prompt.userPrompt).toContain("evidenceCompleteness");
    expect(prompt.userPrompt).not.toContain(missingLedgerCase.truth.canonicalTruth);
  });

  it("falls back to a safe reply when model JSON is invalid", () => {
    const reply = parseNpcReply("不是 JSON", npc, "谁拿了账本？");

    expect(reply.text).toContain("只能根据我确实知道的情况回答");
    expect(reply.revealedFactIds).toEqual([]);
  });

  it("sanitizes constrained reply ids before applying model output", () => {
    const reply = parseConstrainedNpcReply(
      JSON.stringify({
        text: "我只说证据已经证明的事。",
        revealedFactIds: ["known:0", "hidden:2"],
        unlockTopicIds: ["topic_librarian_sighting", "topic_mayor_old_bridge"],
        attitudeDelta: -30,
        logSummary: "林澈谨慎回应。",
      }),
      {
        npc,
        playerMessage: "你看见谁了？",
        stageId: "afternoon",
        discoveredClues: missingLedgerCase.clues.filter((clue) => clue.id === "clue_library_dust_gap"),
        recentEvents: [],
        recentDialogue: [],
      },
    );

    expect(reply.revealedFactIds).toContain("known:0");
    expect(reply.revealedFactIds).not.toContain("hidden:2");
    expect(reply.unlockTopicIds).toEqual(["topic_librarian_sighting"]);
    expect(reply.attitudeDelta).toBe(-15);
  });

  it("uses transport output as structured reply", async () => {
    const result = await createNpcReply(
      {
        apiKey: "test-key",
        npc,
        playerMessage: "旧报纸架怎么回事？",
        stageId: "afternoon",
        discoveredClues: missingLedgerCase.clues.filter((clue) => clue.id === "clue_library_dust_gap"),
        recentEvents: [],
        recentDialogue: [],
      },
      async () =>
        JSON.stringify({
          text: "我看到周镇长去过旧报纸区。",
          revealedFactIds: ["sighting_mayor_library"],
          unlockTopicIds: ["topic_librarian_sighting"],
          attitudeDelta: -2,
          logSummary: "林澈承认看见镇长进入旧报纸区。",
        }),
    );

    expect(result.ok).toBe(true);
    expect(result.reply?.text).toContain("周镇长");
    expect(result.reply?.unlockTopicIds).toContain("topic_librarian_sighting");
  });
});
