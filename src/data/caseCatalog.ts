import { missingLedgerCase } from "./casePackage";

export type CaseCatalogEntry = {
  id: string;
  title: string;
  version: string;
  status: "playable" | "planned";
  briefing: string;
  tags: string[];
};

export const caseCatalog: CaseCatalogEntry[] = [
  {
    id: missingLedgerCase.manifest.id,
    title: missingLedgerCase.caseFile.title,
    version: missingLedgerCase.manifest.version,
    status: "playable",
    briefing: missingLedgerCase.caseFile.briefing,
    tags: ["失踪账本", "小镇政治", "证据链"],
  },
  {
    id: "canal-masks",
    title: "运河面具夜",
    version: "0.1.0-design",
    status: "planned",
    briefing: "节庆巡游结束后，赞助人的假面和保险箱钥匙同时失踪。该案件用于后续验证多案件包加载流程。",
    tags: ["节庆", "假面", "多嫌疑人"],
  },
  {
    id: "station-last-train",
    title: "末班车站台",
    version: "0.1.0-design",
    status: "planned",
    briefing: "末班列车进站前，信号员留下半截录音后失踪。该案件会侧重时间表和路线矛盾。",
    tags: ["时间表", "铁路", "录音"],
  },
];
