import { activeCasePackage } from "../data/casePackage";
import type { DeductionScore, FinalDeduction } from "./types";

const endingLabels: Record<DeductionScore["ending"], string> = {
  perfect: "完美破解",
  solved: "基本破解",
  wrong: "误判",
  insufficient: "证据不足",
};

export function buildEndingReview(answer: FinalDeduction, score: DeductionScore) {
  const hiddenObjectLabel =
    activeCasePackage.manifest.id === "station-last-train"
      ? "半截录音"
      : activeCasePackage.manifest.id === "canal-masks"
        ? "银羽面具"
        : "账本";
  const culprit = activeCasePackage.npcs.find((npc) => npc.id === answer.culpritNpcId)?.name ?? answer.culpritNpcId;
  const location =
    activeCasePackage.locations.find((item) => item.id === answer.hiddenObjectLocationId)?.name ??
    answer.hiddenObjectLocationId;
  const evidenceTitles = answer.evidenceClueIds
    .map((id) => activeCasePackage.clues.find((clue) => clue.id === id)?.title ?? id)
    .join("、");

  return [
    `结局：${endingLabels[score.ending]}。`,
    `你的结论指向 ${culprit}，${hiddenObjectLabel}位置判断为 ${location}。`,
    `证据链覆盖率为 ${Math.round(score.evidenceCoverage * 100)}%，你提交的关键证据包括：${evidenceTitles || "未选择证据"}。`,
    `标准真相：${activeCasePackage.truth.canonicalTruth}`,
    `评分说明：${score.reasons.join(" ")}`,
  ].join("\n");
}
