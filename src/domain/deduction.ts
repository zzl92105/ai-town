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
  const motiveCorrect = motiveCoverage >= 0.45 && containsAny(answer.motive, truth.motiveKeywords);
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
    culpritCorrect ? "真凶判断正确。" : "真凶判断与标准答案不符。",
    motiveCorrect ? "动机覆盖标准答案关键词。" : "动机缺少标准答案中的关键压力或目的。",
    methodCorrect ? "作案过程覆盖关键步骤。" : "作案过程缺少关键步骤。",
    locationCorrect ? "藏匿地点判断正确。" : "藏匿地点不正确。",
    `关键证据覆盖 ${matchedEvidence.length}/${truth.requiredEvidenceIds.length}。`,
  ];

  return { culpritCorrect, motiveCorrect, methodCorrect, locationCorrect, evidenceCoverage, ending, reasons };
}
