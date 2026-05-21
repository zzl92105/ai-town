import { missingLedgerCase } from "../data/casePackage";

export type ContradictionRule = {
  id: string;
  title: string;
  requiredClueIds: string[];
  npcIds: string[];
  summary: string;
};

export const contradictionRules: ContradictionRule[] = [
  {
    id: "contradiction_mayor_alibi",
    title: "镇长整晚在会议室的说法不成立",
    requiredClueIds: ["clue_spare_key_log", "clue_archive_schedule", "clue_cafe_receipt_time"],
    npcIds: ["mayor_zhou", "cafe_shen"],
    summary: "备用钥匙记录、档案室登记表和咖啡馆收据共同推翻了镇长整晚在会议室的说法。",
  },
  {
    id: "contradiction_reporter_archive",
    title: "记者没有进入档案室的说法不成立",
    requiredClueIds: ["clue_reporter_wrist"],
    npcIds: ["reporter_xu", "doctor_bai"],
    summary: "医生的伤口记录证明记者接触过类似档案柜的金属边缘，和记者初期说法矛盾。",
  },
  {
    id: "contradiction_librarian_sighting",
    title: "图书管理员没看清来人的说法存疑",
    requiredClueIds: ["clue_library_dust_gap", "clue_librarian_partial_sighting"],
    npcIds: ["librarian_lin", "mayor_zhou"],
    summary: "旧报纸架灰尘断痕和林澈的含糊目击说明，他很可能认出了进入旧报纸区的人。",
  },
  {
    id: "contradiction_motive",
    title: "账本失踪和旧桥修缮款存在动机链",
    requiredClueIds: ["clue_torn_ledger_page", "clue_mayor_reporter_argument"],
    npcIds: ["mayor_zhou", "reporter_xu"],
    summary: "被撕账页和镇长记者争执显示，账本失踪与旧桥修缮款曝光压力直接相关。",
  },
];

export function getAvailableContradictions(discoveredClueIds: string[], resolvedContradictionIds: string[]) {
  return contradictionRules.filter((rule) => {
    const hasRequiredClues = rule.requiredClueIds.every((id) => discoveredClueIds.includes(id));
    return hasRequiredClues && !resolvedContradictionIds.includes(rule.id);
  });
}

export function getContradictionRule(ruleId: string) {
  return contradictionRules.find((rule) => rule.id === ruleId);
}

export function validateContradictionRules() {
  const clueIds = new Set(missingLedgerCase.clues.map((clue) => clue.id));
  const npcIds = new Set(missingLedgerCase.npcs.map((npc) => npc.id));
  contradictionRules.forEach((rule) => {
    rule.requiredClueIds.forEach((id) => {
      if (!clueIds.has(id)) throw new Error(`Contradiction rule ${rule.id} references unknown clue ${id}`);
    });
    rule.npcIds.forEach((id) => {
      if (!npcIds.has(id)) throw new Error(`Contradiction rule ${rule.id} references unknown NPC ${id}`);
    });
  });
}
