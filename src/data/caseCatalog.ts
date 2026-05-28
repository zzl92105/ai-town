import { canalMasksCase, missingLedgerCase, stationLastTrainCase } from "./casePackage";

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
    id: canalMasksCase.manifest.id,
    title: canalMasksCase.caseFile.title,
    version: canalMasksCase.manifest.version,
    status: "playable",
    briefing: canalMasksCase.caseFile.briefing,
    tags: ["节庆", "假面", "多嫌疑人"],
  },
  {
    id: stationLastTrainCase.manifest.id,
    title: stationLastTrainCase.caseFile.title,
    version: stationLastTrainCase.manifest.version,
    status: "playable",
    briefing: stationLastTrainCase.caseFile.briefing,
    tags: ["时间表", "铁路", "录音"],
  },
];
