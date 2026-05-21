import type { CasePackage, Npc, StageId, StructuredNpcReply } from "./types";

const stageLabels: Record<StageId, string> = {
  morning: "上午初查：只能谈公开身份、初始不在场证明和玩家已经发现的硬证据。",
  afternoon: "下午追问：可以承认证据直接指向的矛盾，但不能主动交代完整作案链。",
  evening: "傍晚收束：可以在证据链完整时回应动机、路线和藏匿地点，但仍不能替玩家总结标准答案。",
};

const stageRank: Record<StageId, number> = { morning: 0, afternoon: 1, evening: 2 };

export type EvidenceCompleteness = {
  status: "thin" | "partial" | "strong";
  discoveredKeyCount: number;
  requiredEvidenceCount: number;
  discoveredRequiredCount: number;
};

export type NpcDisclosureContext = {
  stageDisclosure: string;
  evidenceCompleteness: EvidenceCompleteness;
  allowedTopicIds: string[];
  allowedFactIds: string[];
  forbiddenFactHints: string[];
};

export function buildNpcDisclosureContext(params: {
  casePackage: CasePackage;
  npc: Npc;
  stageId: StageId;
  discoveredClueIds: string[];
}): NpcDisclosureContext {
  const discovered = new Set(params.discoveredClueIds);
  const requiredEvidence = params.casePackage.truth.requiredEvidenceIds;
  const discoveredRequiredCount = requiredEvidence.filter((id) => discovered.has(id)).length;
  const discoveredKeyCount = params.casePackage.clues.filter((clue) => clue.isKey && discovered.has(clue.id)).length;
  const status: EvidenceCompleteness["status"] =
    discoveredRequiredCount >= Math.max(4, requiredEvidence.length - 1) ? "strong" : discoveredRequiredCount >= 2 ? "partial" : "thin";

  const allowedTopicIds = params.casePackage.topics
    .filter((topic) => topic.npcId === params.npc.id)
    .filter((topic) => stageRank[params.stageId] >= stageRank[topic.stageId])
    .filter((topic) => topic.requiredClueIds.every((id) => discovered.has(id)))
    .map((topic) => topic.id);

  const stageAllowedFacts = params.npc.disclosureRules?.[params.stageId] ?? [];
  const allowedFactIds = [
    ...params.npc.knownFacts.map((_, index) => `known:${index}`),
    ...stageAllowedFacts,
  ];

  return {
    stageDisclosure: stageLabels[params.stageId],
    evidenceCompleteness: {
      status,
      discoveredKeyCount,
      requiredEvidenceCount: requiredEvidence.length,
      discoveredRequiredCount,
    },
    allowedTopicIds,
    allowedFactIds,
    forbiddenFactHints: params.npc.hiddenFacts.filter((_, index) => !stageAllowedFacts.includes(`hidden:${index}`)),
  };
}

export function sanitizeNpcReply(
  reply: StructuredNpcReply,
  rules: {
    allowedFactIds: string[];
    allowedTopicIds: string[];
    blockedPhrases?: string[];
    minAttitudeDelta?: number;
    maxAttitudeDelta?: number;
  },
): StructuredNpcReply {
  const allowedFacts = new Set(rules.allowedFactIds);
  const allowedTopics = new Set(rules.allowedTopicIds);
  const min = rules.minAttitudeDelta ?? -15;
  const max = rules.maxAttitudeDelta ?? 10;
  const text = (rules.blockedPhrases ?? []).reduce(
    (current, phrase) => current.split(phrase).join("这部分我现在不能确认"),
    reply.text,
  );
  return {
    ...reply,
    text,
    revealedFactIds: reply.revealedFactIds.filter((id) => allowedFacts.has(id)),
    unlockTopicIds: reply.unlockTopicIds.filter((id) => allowedTopics.has(id)),
    attitudeDelta: Math.max(min, Math.min(max, reply.attitudeDelta)),
  };
}
