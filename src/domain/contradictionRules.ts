import { casePackages, getActiveCasePackage } from "../data/casePackage";

export type ContradictionRule = {
  id: string;
  title: string;
  requiredClueIds: string[];
  npcIds: string[];
  summary: string;
};

export const contradictionRulesByCaseId: Record<string, ContradictionRule[]> = {
  "missing-ledger": [
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
  {
    id: "contradiction_motive_pressure",
    title: "审计压力解释账本必须在昨晚消失",
    requiredClueIds: ["clue_bridge_invoice_copy", "clue_council_meeting_minutes", "clue_mayor_stress_record"],
    npcIds: ["mayor_zhou", "doctor_bai"],
    summary: "旧桥发票、审计纪要和镇长失眠记录共同说明，周启明有赶在审计前处理账本的时间压力。",
  },
  ],
  "canal-masks": [
    {
      id: "contradiction_blackout",
      title: "熄灯不是普通故障",
      requiredClueIds: ["clue_blackout_switch"],
      npcIds: ["captain_luo", "artist_qiao"],
      summary: "主灯架控制盒显示有人手动断电，熄灯仪式被人为制造。",
    },
    {
      id: "contradiction_route",
      title: "花车路线提供后门窗口",
      requiredClueIds: ["clue_float_route", "clue_artist_backdoor_log"],
      npcIds: ["artist_qiao", "captain_luo"],
      summary: "花车停靠路线和后门登记共同说明，乔微有靠近宅邸书房的行动窗口。",
    },
    {
      id: "contradiction_artist_key",
      title: "乔微没有碰钥匙的说法不成立",
      requiredClueIds: ["clue_artist_palm_cut", "clue_key_tray_imprint"],
      npcIds: ["artist_qiao", "sponsor_han"],
      summary: "救护记录和钥匙盘压痕显示，乔微很可能短暂接触过保险箱钥匙。",
    },
    {
      id: "contradiction_motive",
      title: "面具失踪与运河底片存在动机链",
      requiredClueIds: ["clue_missing_microfilm", "clue_canal_contract_pressure"],
      npcIds: ["artist_qiao", "sponsor_han", "archivist_meng"],
      summary: "缺失底片和运河合同批注显示，银羽面具内的底片足以威胁韩砚舟的项目。",
    },
    {
      id: "contradiction_hidden_location",
      title: "藏匿点指向水文档案展馆",
      requiredClueIds: ["clue_silver_feather_fragment", "clue_display_slot_dust"],
      npcIds: ["artist_qiao", "florist_yan", "archivist_meng"],
      summary: "银羽碎片、花店固定胶和展柜检修槽痕迹共同指向展馆藏匿路径。",
    },
  ],
  "station-last-train": [
    {
      id: "contradiction_time_reference",
      title: "站台时间参照被人为扰乱",
      requiredClueIds: ["clue_platform_clock_stopped", "clue_altered_timetable"],
      npcIds: ["stationmaster_du", "engineer_lu"],
      summary: "电子钟校时线和调度表改动共同说明，末班车时间线被人为修饰。",
    },
    {
      id: "contradiction_stationmaster_alibi",
      title: "杜衡一直在站长室的说法不成立",
      requiredClueIds: ["clue_stationmaster_tea_receipt", "clue_staff_gate_record"],
      npcIds: ["stationmaster_du", "vendor_song"],
      summary: "热茶小票和员工卡记录证明杜衡在关键窗口离开过站长室。",
    },
    {
      id: "contradiction_siding",
      title: "货运侧线在末班车前异常接入",
      requiredClueIds: ["clue_siding_switch_log", "clue_porter_arm_scratch"],
      npcIds: ["engineer_lu", "porter_ma", "stationmaster_du"],
      summary: "道岔记录和搬运工蓝漆伤口说明，旧货运车确实在异常时间靠过侧线。",
    },
    {
      id: "contradiction_method",
      title: "录音中断来自剪线",
      requiredClueIds: ["clue_cut_recorder_wire", "clue_missing_wire_cutter"],
      npcIds: ["stationmaster_du"],
      summary: "录音线断口和站长工具箱铜屑对应，季闻的录音被人为切断。",
    },
    {
      id: "contradiction_motive",
      title: "半截录音指向侧线违规动机",
      requiredClueIds: ["clue_half_tape_box", "clue_siding_switch_log"],
      npcIds: ["stationmaster_du", "reporter_chen", "engineer_lu"],
      summary: "磁带标签和侧线道岔记录说明，杜衡有动机阻止季闻交出录音。",
    },
    {
      id: "contradiction_hidden_tape",
      title: "录音藏匿点指向候车室失物处",
      requiredClueIds: ["clue_vendor_backdoor_sighting", "clue_broadcast_tape_swap"],
      npcIds: ["stationmaster_du", "vendor_song", "reporter_chen"],
      summary: "报纸包裹目击和广播带调包共同指向候车室失物处。",
    },
  ],
};

export const contradictionRules = contradictionRulesByCaseId["missing-ledger"];

function getRules(caseId = getActiveCasePackage().manifest.id) {
  return contradictionRulesByCaseId[caseId] ?? [];
}

export function getAvailableContradictions(discoveredClueIds: string[], resolvedContradictionIds: string[]) {
  return getRules().filter((rule) => {
    const hasRequiredClues = rule.requiredClueIds.every((id) => discoveredClueIds.includes(id));
    return hasRequiredClues && !resolvedContradictionIds.includes(rule.id);
  });
}

export function getContradictionRule(ruleId: string) {
  return getRules().find((rule) => rule.id === ruleId);
}

export function validateContradictionRules() {
  casePackages.forEach((casePackage) => {
    const clueIds = new Set(casePackage.clues.map((clue) => clue.id));
    const npcIds = new Set(casePackage.npcs.map((npc) => npc.id));
    getRules(casePackage.manifest.id).forEach((rule) => {
      rule.requiredClueIds.forEach((id) => {
        if (!clueIds.has(id)) throw new Error(`Contradiction rule ${rule.id} references unknown clue ${id}`);
      });
      rule.npcIds.forEach((id) => {
        if (!npcIds.has(id)) throw new Error(`Contradiction rule ${rule.id} references unknown NPC ${id}`);
      });
    });
  });
}
