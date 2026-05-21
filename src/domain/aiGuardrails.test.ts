import { describe, expect, it } from "vitest";
import { missingLedgerCase } from "../data/casePackage";
import { buildNpcDisclosureContext, sanitizeNpcReply } from "./aiGuardrails";

const mayor = missingLedgerCase.npcs.find((npc) => npc.id === "mayor_zhou")!;

describe("AI NPC guardrails", () => {
  it("limits stage disclosure and reports evidence completeness", () => {
    const context = buildNpcDisclosureContext({
      casePackage: missingLedgerCase,
      npc: mayor,
      stageId: "morning",
      discoveredClueIds: ["clue_spare_key_log"],
    });

    expect(context.stageDisclosure).toContain("上午");
    expect(context.evidenceCompleteness.status).toBe("thin");
    expect(context.allowedTopicIds).toContain("topic_mayor_alibi");
    expect(context.allowedTopicIds).not.toContain("topic_mayor_old_bridge");
    expect(context.forbiddenFactHints.join(" ")).toContain("账本藏在图书馆");
  });

  it("removes fact and topic ids that are not currently allowed", () => {
    const reply = sanitizeNpcReply(
      {
        text: "我只会承认证据已经指向的部分。",
        revealedFactIds: ["known:0", "hidden:2"],
        unlockTopicIds: ["topic_mayor_alibi", "topic_mayor_old_bridge"],
        attitudeDelta: -99,
        logSummary: "镇长被追问。",
      },
      {
        allowedFactIds: ["known:0"],
        allowedTopicIds: ["topic_mayor_alibi"],
        minAttitudeDelta: -12,
        maxAttitudeDelta: 8,
      },
    );

    expect(reply.revealedFactIds).toEqual(["known:0"]);
    expect(reply.unlockTopicIds).toEqual(["topic_mayor_alibi"]);
    expect(reply.attitudeDelta).toBe(-12);
  });

  it("redacts blocked hidden fact phrases from reply text", () => {
    const reply = sanitizeNpcReply(
      {
        text: "账本藏在图书馆旧报纸架后的暗格。",
        revealedFactIds: [],
        unlockTopicIds: [],
        attitudeDelta: 0,
        logSummary: "模型越界透露藏匿地点。",
      },
      {
        allowedFactIds: [],
        allowedTopicIds: [],
        blockedPhrases: ["账本藏在图书馆旧报纸架后的暗格"],
      },
    );

    expect(reply.text).not.toContain("账本藏在图书馆旧报纸架后的暗格");
    expect(reply.text).toContain("这部分我现在不能确认");
  });
});
