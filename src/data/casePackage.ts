import canalMasksCaseFile from "../../cases/canal-masks/case.json";
import canalMasksClues from "../../cases/canal-masks/clues.json";
import canalMasksLocations from "../../cases/canal-masks/locations.json";
import canalMasksManifest from "../../cases/canal-masks/manifest.json";
import canalMasksNpcs from "../../cases/canal-masks/npcs.json";
import canalMasksStages from "../../cases/canal-masks/stages.json";
import canalMasksTopics from "../../cases/canal-masks/topics.json";
import canalMasksTruth from "../../cases/canal-masks/truth.json";
import missingLedgerCaseFile from "../../cases/missing-ledger/case.json";
import missingLedgerClues from "../../cases/missing-ledger/clues.json";
import missingLedgerLocations from "../../cases/missing-ledger/locations.json";
import missingLedgerManifest from "../../cases/missing-ledger/manifest.json";
import missingLedgerNpcs from "../../cases/missing-ledger/npcs.json";
import missingLedgerStages from "../../cases/missing-ledger/stages.json";
import missingLedgerTopics from "../../cases/missing-ledger/topics.json";
import missingLedgerTruth from "../../cases/missing-ledger/truth.json";
import stationLastTrainCaseFile from "../../cases/station-last-train/case.json";
import stationLastTrainClues from "../../cases/station-last-train/clues.json";
import stationLastTrainLocations from "../../cases/station-last-train/locations.json";
import stationLastTrainManifest from "../../cases/station-last-train/manifest.json";
import stationLastTrainNpcs from "../../cases/station-last-train/npcs.json";
import stationLastTrainStages from "../../cases/station-last-train/stages.json";
import stationLastTrainTopics from "../../cases/station-last-train/topics.json";
import stationLastTrainTruth from "../../cases/station-last-train/truth.json";
import { validateCasePackage } from "../domain/schema";
import type { CasePackage } from "../domain/types";

export const missingLedgerCase = validateCasePackage({
  manifest: missingLedgerManifest,
  caseFile: missingLedgerCaseFile,
  locations: missingLedgerLocations,
  npcs: missingLedgerNpcs,
  clues: missingLedgerClues,
  topics: missingLedgerTopics,
  stages: missingLedgerStages,
  truth: missingLedgerTruth,
}) as CasePackage;

export const canalMasksCase = validateCasePackage({
  manifest: canalMasksManifest,
  caseFile: canalMasksCaseFile,
  locations: canalMasksLocations,
  npcs: canalMasksNpcs,
  clues: canalMasksClues,
  topics: canalMasksTopics,
  stages: canalMasksStages,
  truth: canalMasksTruth,
}) as CasePackage;

export const stationLastTrainCase = validateCasePackage({
  manifest: stationLastTrainManifest,
  caseFile: stationLastTrainCaseFile,
  locations: stationLastTrainLocations,
  npcs: stationLastTrainNpcs,
  clues: stationLastTrainClues,
  topics: stationLastTrainTopics,
  stages: stationLastTrainStages,
  truth: stationLastTrainTruth,
}) as CasePackage;

export const casePackages = [missingLedgerCase, canalMasksCase, stationLastTrainCase] as const;
export const defaultCaseId = missingLedgerCase.manifest.id;

let activeCaseId = defaultCaseId;

export function setActiveCaseId(caseId: string) {
  activeCaseId = getCasePackage(caseId).manifest.id;
}

export function getActiveCasePackage() {
  return getCasePackage(activeCaseId);
}

export function getCasePackage(caseId?: string) {
  return casePackages.find((casePackage) => casePackage.manifest.id === caseId) ?? missingLedgerCase;
}

export const activeCasePackage = new Proxy({} as CasePackage, {
  get(_target, property: keyof CasePackage) {
    return getActiveCasePackage()[property];
  },
});
