import manifest from "../../cases/missing-ledger/manifest.json";
import caseFile from "../../cases/missing-ledger/case.json";
import locations from "../../cases/missing-ledger/locations.json";
import npcs from "../../cases/missing-ledger/npcs.json";
import clues from "../../cases/missing-ledger/clues.json";
import topics from "../../cases/missing-ledger/topics.json";
import stages from "../../cases/missing-ledger/stages.json";
import truth from "../../cases/missing-ledger/truth.json";
import { validateCasePackage } from "../domain/schema";
import type { CasePackage } from "../domain/types";

export const missingLedgerCase = validateCasePackage({
  manifest,
  caseFile,
  locations,
  npcs,
  clues,
  topics,
  stages,
  truth,
}) as CasePackage;
