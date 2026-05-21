import { describe, expect, it } from "vitest";
import { missingLedgerCase } from "../data/casePackage";
import { scoreDeduction } from "./deduction";

describe("scoreDeduction", () => {
  it("returns perfect when all structural facts and evidence are correct", () => {
    const score = scoreDeduction(
      {
        culpritNpcId: "mayor_zhou",
        motive: "镇长为了掩盖旧桥修缮款挪用，担心记者曝光账本内容。",
        method: "他用备用钥匙进入档案室，取走账本，撕下账页，再把账本藏到图书馆旧报纸暗格。",
        hiddenObjectLocationId: "library",
        evidenceClueIds: missingLedgerCase.truth.requiredEvidenceIds,
      },
      missingLedgerCase.truth,
    );

    expect(score.ending).toBe("perfect");
    expect(score.culpritCorrect).toBe(true);
    expect(score.evidenceCoverage).toBe(1);
  });

  it("returns wrong when the culprit is incorrect", () => {
    const score = scoreDeduction(
      {
        culpritNpcId: "reporter_xu",
        motive: "为了报道旧桥修缮款。",
        method: "进入档案室后拿走账本。",
        hiddenObjectLocationId: "library",
        evidenceClueIds: ["clue_reporter_wrist"],
      },
      missingLedgerCase.truth,
    );

    expect(score.ending).toBe("wrong");
    expect(score.culpritCorrect).toBe(false);
  });
});
