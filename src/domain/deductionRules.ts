import { casePackages, getActiveCasePackage } from "../data/casePackage";

export type DeductionRule = {
  id: string;
  title: string;
  requiredClueIds: string[];
  resultClueId: string;
  note: string;
};

export const deductionRulesByCaseId: Record<string, DeductionRule[]> = {
  "missing-ledger": [
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
  {
    id: "rule_motive_financial_chain",
    title: "梳理旧桥款项动机链",
    requiredClueIds: ["clue_torn_ledger_page", "clue_bridge_invoice_copy", "clue_council_meeting_minutes"],
    resultClueId: "deduction_motive_financial_chain",
    note: "账页残片、旧桥发票和审计纪要共同说明：账本失踪不是临时起意，而是为了赶在审计前掩盖款项问题。",
  },
  {
    id: "rule_reporter_red_herring_resolved",
    title: "拆解记者误导线",
    requiredClueIds: ["clue_reporter_wrist", "clue_town_gossip_red_herring", "clue_delivery_route_map"],
    resultClueId: "deduction_reporter_red_herring_resolved",
    note: "记者手腕伤、广场流言和外送路线只能证明他接近过档案室，不能证明他拿走账本。",
  },
  ],
  "canal-masks": [
    {
      id: "rule_artist_route",
      title: "还原乔微行动窗口",
      requiredClueIds: ["clue_blackout_switch", "clue_float_route", "clue_artist_backdoor_log"],
      resultClueId: "deduction_artist_route",
      note: "手动熄灯、花车停靠和后门登记共同证明：乔微能在熄灯窗口进出赞助人宅邸。",
    },
    {
      id: "rule_hidden_mask_archive",
      title: "定位银羽面具藏匿点",
      requiredClueIds: ["clue_silver_feather_fragment", "clue_display_slot_dust", "clue_guestbook_time"],
      resultClueId: "deduction_hidden_mask_archive",
      note: "银羽碎片、花店固定胶和展柜检修槽痕迹共同指向水文档案展馆。",
    },
    {
      id: "rule_microfilm_motive",
      title: "梳理底片动机链",
      requiredClueIds: ["clue_missing_microfilm", "clue_canal_contract_pressure", "clue_mask_stand_paint"],
      resultClueId: "deduction_microfilm_motive",
      note: "底片缺口、运河合同批注和面具暗扣说明：乔微取走面具是为了保护底片证据。",
    },
  ],
  "station-last-train": [
    {
      id: "rule_stationmaster_window",
      title: "还原杜衡离开办公室窗口",
      requiredClueIds: ["clue_stationmaster_tea_receipt", "clue_staff_gate_record", "clue_altered_timetable"],
      resultClueId: "deduction_stationmaster_window",
      note: "热茶小票、员工卡记录和被改调度表共同证明：杜衡并非一直在站长室。",
    },
    {
      id: "rule_siding_motive",
      title: "梳理侧线违规动机",
      requiredClueIds: ["clue_half_tape_box", "clue_siding_switch_log", "clue_altered_timetable"],
      resultClueId: "deduction_siding_motive",
      note: "半截磁带、侧线道岔记录和调度表说明：季闻录到了杜衡违规放行旧货运车的证据。",
    },
    {
      id: "rule_tape_hidden_lost_found",
      title: "定位半截录音藏匿点",
      requiredClueIds: ["clue_vendor_backdoor_sighting", "clue_broadcast_tape_swap", "clue_lost_found_time_edit"],
      resultClueId: "deduction_tape_hidden_lost_found",
      note: "茶摊后门目击、广播带调包和失物登记改时共同指向候车室失物处。",
    },
  ],
};

export const deductionRules = deductionRulesByCaseId["missing-ledger"];

function getRules(caseId = getActiveCasePackage().manifest.id) {
  return deductionRulesByCaseId[caseId] ?? [];
}

export function getAvailableDeductionRules(discoveredClueIds: string[]) {
  return getRules().filter((rule) => {
    const hasRequirements = rule.requiredClueIds.every((id) => discoveredClueIds.includes(id));
    const notCreated = !discoveredClueIds.includes(rule.resultClueId);
    return hasRequirements && notCreated;
  });
}

export function getDeductionRule(ruleId: string) {
  return getRules().find((rule) => rule.id === ruleId);
}

export function validateDeductionRules() {
  casePackages.forEach((casePackage) => {
    const clueIds = new Set(casePackage.clues.map((clue) => clue.id));
    getRules(casePackage.manifest.id).forEach((rule) => {
      rule.requiredClueIds.forEach((id) => {
        if (!clueIds.has(id)) throw new Error(`Deduction rule ${rule.id} references unknown clue ${id}`);
      });
      if (!clueIds.has(rule.resultClueId)) {
        throw new Error(`Deduction rule ${rule.id} references unknown result clue ${rule.resultClueId}`);
      }
      const result = casePackage.clues.find((clue) => clue.id === rule.resultClueId);
      if (result?.type !== "deduction") {
        throw new Error(`Deduction rule ${rule.id} result must be a deduction clue`);
      }
    });
  });
}
