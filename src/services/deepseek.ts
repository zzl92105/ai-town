import { activeCasePackage } from "../data/casePackage";
import { buildNpcDisclosureContext, sanitizeNpcReply } from "../domain/aiGuardrails";
import type { Clue, DialogueMessage, InvestigationEvent, Npc, StageId, StructuredNpcReply } from "../domain/types";

export type NpcReplyRequest = {
  apiKey?: string;
  npc: Npc;
  playerMessage: string;
  stageId: StageId;
  discoveredClues: Clue[];
  recentEvents: InvestigationEvent[];
  recentDialogue: DialogueMessage[];
};

export type NpcReplyResult = {
  ok: boolean;
  reply?: StructuredNpcReply;
  error?: string;
};

export type DeepSeekTransport = (payload: {
  apiKey: string;
  systemPrompt: string;
  userPrompt: string;
}) => Promise<string>;

const fallbackReply = (npc: Npc, playerMessage: string): StructuredNpcReply => ({
  text: `${npc.name}谨慎地避开了没有证据支撑的细节：“${playerMessage}这个问题，我只能根据我确实知道的情况回答。你可以拿具体线索来问我。”`,
  revealedFactIds: [],
  unlockTopicIds: [],
  attitudeDelta: 0,
  logSummary: `${npc.name}没有透露新的案件事实。`,
});

export function buildNpcPrompt(request: NpcReplyRequest) {
  const disclosure = buildNpcDisclosureContext({
    casePackage: activeCasePackage,
    npc: request.npc,
    stageId: request.stageId,
    discoveredClueIds: request.discoveredClues.map((clue) => clue.id),
  });
  const truthBoundary = {
    npcKnownFacts: request.npc.knownFacts,
    npcHiddenFacts: request.npc.hiddenFacts,
    lieRules: request.npc.lieRules,
    dialogueStyle: request.npc.dialogueStyle,
    stageDisclosure: disclosure.stageDisclosure,
    evidenceCompleteness: disclosure.evidenceCompleteness,
    allowedFactIds: disclosure.allowedFactIds,
    allowedTopicIds: disclosure.allowedTopicIds,
    forbiddenFactHints: disclosure.forbiddenFactHints,
    discoveredClues: request.discoveredClues.map((clue) => ({
      id: clue.id,
      title: clue.title,
      description: clue.description,
      isKey: clue.isKey,
      isRedHerring: clue.isRedHerring,
    })),
    recentEvents: request.recentEvents.map((event) => ({
      type: event.type,
      summary: event.summary,
      clueIds: event.clueIds,
    })),
    recentDialogue: request.recentDialogue.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  };

  const systemPrompt = [
    "你是 AI 小镇的 NPC 对话约束层，只能在给定案件事实内生成自然语言。",
    "不得编造新的关键证据、不得否定玩家已发现的硬证据、不得泄露当前 NPC 不知道的完整真相。",
    "可以回避、撒谎或转移话题，但谎言必须符合 lieRules。",
    "必须只返回 JSON，不要输出 Markdown。",
    "JSON 结构：{\"text\":\"NPC回复\",\"revealedFactIds\":[],\"newTestimony\":\"可选证词\",\"unlockTopicIds\":[],\"attitudeDelta\":0,\"logSummary\":\"日志摘要\"}",
  ].join("\n");

  const userPrompt = JSON.stringify(
    {
      caseId: activeCasePackage.manifest.id,
      caseTitle: activeCasePackage.caseFile.title,
      stageId: request.stageId,
      npc: {
        id: request.npc.id,
        name: request.npc.name,
        role: request.npc.role,
        personality: request.npc.personality,
        publicBio: request.npc.publicBio,
        alibi: request.npc.alibi,
        timelineClaims: request.npc.timelineClaims,
        trustScore: request.npc.trustScore,
        dialogueStyle: request.npc.dialogueStyle,
      },
      truthBoundary,
      playerMessage: request.playerMessage,
    },
    null,
    2,
  );

  return { systemPrompt, userPrompt };
}

export function parseNpcReply(raw: string, npc: Npc, playerMessage: string): StructuredNpcReply {
  try {
    const parsed = JSON.parse(raw) as Partial<StructuredNpcReply>;
    if (!parsed.text || typeof parsed.text !== "string") {
      return fallbackReply(npc, playerMessage);
    }
    return {
      text: parsed.text,
      revealedFactIds: Array.isArray(parsed.revealedFactIds) ? parsed.revealedFactIds.filter((item) => typeof item === "string") : [],
      newTestimony: typeof parsed.newTestimony === "string" ? parsed.newTestimony : undefined,
      unlockTopicIds: Array.isArray(parsed.unlockTopicIds) ? parsed.unlockTopicIds.filter((item) => typeof item === "string") : [],
      attitudeDelta: typeof parsed.attitudeDelta === "number" ? parsed.attitudeDelta : 0,
      logSummary: typeof parsed.logSummary === "string" ? parsed.logSummary : `${npc.name}回应了自由问询。`,
    };
  } catch {
    return fallbackReply(npc, playerMessage);
  }
}

export function parseConstrainedNpcReply(
  raw: string,
  request: NpcReplyRequest,
): StructuredNpcReply {
  const disclosure = buildNpcDisclosureContext({
    casePackage: activeCasePackage,
    npc: request.npc,
    stageId: request.stageId,
    discoveredClueIds: request.discoveredClues.map((clue) => clue.id),
  });
  return sanitizeNpcReply(parseNpcReply(raw, request.npc, request.playerMessage), {
    allowedFactIds: disclosure.allowedFactIds,
    allowedTopicIds: disclosure.allowedTopicIds,
    blockedPhrases: disclosure.forbiddenFactHints,
  });
}

export const deepSeekHttpTransport: DeepSeekTransport = async ({ apiKey, systemPrompt, userPrompt }) => {
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek 请求失败：${response.status}`);
  }
  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("DeepSeek 返回为空。");
  return content;
};

export async function createNpcReply(
  request: NpcReplyRequest,
  transport: DeepSeekTransport = deepSeekHttpTransport,
): Promise<NpcReplyResult> {
  const apiKey = request.apiKey ?? import.meta.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: "缺少 DeepSeek API Key。你仍可查看案件、调查线索和使用预设问询，但不能发起自由 AI 对话。",
    };
  }

  try {
    const prompt = buildNpcPrompt(request);
    const raw = await transport({ apiKey, ...prompt });
    return { ok: true, reply: parseConstrainedNpcReply(raw, request) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "DeepSeek 请求失败。",
      reply: fallbackReply(request.npc, request.playerMessage),
    };
  }
}

export async function testDeepSeekConnection(apiKey: string, transport: DeepSeekTransport = deepSeekHttpTransport) {
  if (!apiKey.trim()) return { ok: false, error: "API Key 为空。" };
  try {
    await transport({
      apiKey,
      systemPrompt: "只返回 JSON。",
      userPrompt: "{\"ping\":\"请返回 {\\\"ok\\\":true}\"}",
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "连接测试失败。" };
  }
}
