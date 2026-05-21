import { describe, expect, it } from "vitest";
import { missingLedgerCase } from "../data/casePackage";
import { validateContradictionRules } from "./contradictionRules";
import { validateDeductionRules } from "./deductionRules";

describe("missing ledger case package", () => {
  it("matches MVP content requirements", () => {
    expect(missingLedgerCase.locations).toHaveLength(5);
    expect(missingLedgerCase.npcs).toHaveLength(5);
    expect(missingLedgerCase.clues.length).toBeGreaterThanOrEqual(8);
    expect(missingLedgerCase.clues.some((clue) => clue.type === "deduction")).toBe(true);
    expect(missingLedgerCase.clues.filter((clue) => clue.isRedHerring).length).toBeGreaterThanOrEqual(3);
    expect(new Set(missingLedgerCase.clues.flatMap((clue) => clue.contradictionIds)).size).toBeGreaterThanOrEqual(3);
    expect(missingLedgerCase.truth.culpritNpcId).toBe("mayor_zhou");
    expect(missingLedgerCase.truth.hiddenObjectLocationId).toBe("library");
  });

  it("keeps the required evidence discoverable from objects or topics", () => {
    const objectClues = new Set(
      missingLedgerCase.locations.flatMap((location) => location.searchableObjects.flatMap((object) => object.clueIds)),
    );
    const topicClues = new Set(missingLedgerCase.topics.flatMap((topic) => topic.revealsClueIds));
    missingLedgerCase.truth.requiredEvidenceIds.forEach((clueId) => {
      expect(objectClues.has(clueId) || topicClues.has(clueId)).toBe(true);
    });
  });

  it("keeps deduction rules valid", () => {
    expect(() => validateDeductionRules()).not.toThrow();
  });

  it("keeps contradiction rules valid", () => {
    expect(() => validateContradictionRules()).not.toThrow();
  });
});
