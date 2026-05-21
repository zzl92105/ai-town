import type { CaseTruth, DeductionScore, FinalDeduction } from "./types";

const containsAny = (text: string, keywords: string[]) => {
  const normalized = text.trim().toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
};

const keywordCoverage = (text: string, keywords: string[]) => {
  const normalized = text.trim().toLowerCase();
  const matched = keywords.filter((keyword) => normalized.includes(keyword.toLowerCase()));
  return matched.length / keywords.length;
};

export function scoreDeduction(answer: FinalDeduction, truth: CaseTruth): DeductionScore {
  const culpritCorrect = answer.culpritNpcId === truth.culpritNpcId;
  const locationCorrect = answer.hiddenObjectLocationId === truth.hiddenObjectLocationId;
  const motiveCoverage = keywordCoverage(answer.motive, truth.motiveKeywords);
  const methodCoverage = keywordCoverage(answer.method, truth.methodKeywords);
  const motiveCorrect = motiveCoverage >= 0.45 && containsAny(answer.motive, ["挪用", "曝光", "旧桥", "修缮款"]);
  const methodCorrect = methodCoverage >= 0.5;
  const matchedEvidence = truth.requiredEvidenceIds.filter((id) => answer.evidenceClueIds.includes(id));
  const evidenceCoverage = matchedEvidence.length / truth.requiredEvidenceIds.length;

  let ending: DeductionScore["ending"] = "wrong";
  if (culpritCorrect && motiveCorrect && methodCorrect && locationCorrect && evidenceCoverage >= 0.8) {
    ending = "perfect";
  } else if (culpritCorrect && motiveCorrect && locationCorrect && evidenceCoverage >= 0.5) {
    ending = "solved";
  } else if (culpritCorrect && evidenceCoverage < 0.5) {
    ending = "insufficient";
  }

  const reasons = [
    culpritCorrect ? "真凶指向周启明。" : "真凶判断与标准答案不符。",
    motiveCorrect ? "动机覆盖旧桥修缮款与曝光压力。" : "动机缺少旧桥修缮款挪用或曝光压力。",
    methodCorrect ? "作案过程覆盖钥匙、档案室、账页和藏匿路径。" : "作案过程缺少关键步骤。",
    locationCorrect ? "账本位置指向图书馆。" : "账本位置不正确。",
    `关键证据覆盖 ${matchedEvidence.length}/${truth.requiredEvidenceIds.length}。`,
  ];

  return { culpritCorrect, motiveCorrect, methodCorrect, locationCorrect, evidenceCoverage, ending, reasons };
}
