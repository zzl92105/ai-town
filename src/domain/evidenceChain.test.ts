import { describe, expect, it } from "vitest";
import { buildDeductionAssist, moveEvidenceChainItem, toggleEvidenceChainItem } from "./evidenceChain";

describe("evidence chain helpers", () => {
  it("adds, removes, and reorders clue ids without duplicates", () => {
    expect(toggleEvidenceChainItem(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleEvidenceChainItem(["a", "b"], "a")).toEqual(["b"]);
    expect(moveEvidenceChainItem(["a", "b", "c"], "c", "a")).toEqual(["c", "a", "b"]);
  });

  it("builds deduction assist gaps from selected evidence", () => {
    const assist = buildDeductionAssist({
      requiredEvidenceIds: ["motive", "method", "location"],
      selectedEvidenceIds: ["motive"],
      discoveredClueIds: ["motive", "method"],
    });

    expect(assist.coverage).toBe(1 / 3);
    expect(assist.missingDiscoveredEvidenceIds).toEqual(["method"]);
    expect(assist.undiscoveredEvidenceIds).toEqual(["location"]);
    expect(assist.ready).toBe(false);
  });
});
