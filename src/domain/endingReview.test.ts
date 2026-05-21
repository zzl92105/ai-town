import { describe, expect, it } from "vitest";
import { scoreDeduction } from "./deduction";
import { buildEndingReview } from "./endingReview";
import { missingLedgerCase } from "../data/casePackage";

describe("buildEndingReview", () => {
  it("summarizes player answer without replacing canonical truth", () => {
    const answer = {
      culpritNpcId: "mayor_zhou",
      motive: "为掩盖旧桥修缮款挪用，担心记者曝光账本。",
      method: "用备用钥匙进入档案室，取走账本，撕下账页，把账本藏到图书馆旧报纸暗格。",
      hiddenObjectLocationId: "library",
      evidenceClueIds: missingLedgerCase.truth.requiredEvidenceIds,
    };
    const score = scoreDeduction(answer, missingLedgerCase.truth);
    const review = buildEndingReview(answer, score);

    expect(review).toContain("完美破解");
    expect(review).toContain("周启明");
    expect(review).toContain(missingLedgerCase.truth.canonicalTruth);
  });
});
