import { missingLedgerCase } from "../data/casePackage";

export type DeductionRule = {
  id: string;
  title: string;
  requiredClueIds: string[];
  resultClueId: string;
  note: string;
};

export const deductionRules: DeductionRule[] = [
  {
    id: "rule_mayor_alibi_broken",
    title: "比对镇长行踪",
    requiredClueIds: ["clue_spare_key_log", "clue_archive_schedule", "clue_cafe_receipt_time"],
    resultClueId: "deduction_mayor_alibi_broken",
    note: "备用钥匙、档案室登记表和咖啡馆小票共同证明：镇长并非整晚在会议室。",
  },
  {
    id: "rule_hidden_route_library",
    title: "定位账本藏匿路径",
    requiredClueIds: ["clue_library_dust_gap", "clue_librarian_partial_sighting"],
    resultClueId: "deduction_hidden_route_library",
    note: "旧报纸架灰尘断痕和林澈的目击说明：账本藏匿路径指向图书馆旧报纸区。",
  },
];

export function getAvailableDeductionRules(discoveredClueIds: string[]) {
  return deductionRules.filter((rule) => {
    const hasRequirements = rule.requiredClueIds.every((id) => discoveredClueIds.includes(id));
    const notCreated = !discoveredClueIds.includes(rule.resultClueId);
    return hasRequirements && notCreated;
  });
}

export function getDeductionRule(ruleId: string) {
  return deductionRules.find((rule) => rule.id === ruleId);
}

export function validateDeductionRules() {
  const clueIds = new Set(missingLedgerCase.clues.map((clue) => clue.id));
  deductionRules.forEach((rule) => {
    rule.requiredClueIds.forEach((id) => {
      if (!clueIds.has(id)) throw new Error(`Deduction rule ${rule.id} references unknown clue ${id}`);
    });
    if (!clueIds.has(rule.resultClueId)) {
      throw new Error(`Deduction rule ${rule.id} references unknown result clue ${rule.resultClueId}`);
    }
    const result = missingLedgerCase.clues.find((clue) => clue.id === rule.resultClueId);
    if (result?.type !== "deduction") {
      throw new Error(`Deduction rule ${rule.id} result must be a deduction clue`);
    }
  });
}
