import { describe, expect, it } from "vitest";
import { canalMasksCase, missingLedgerCase, stationLastTrainCase } from "../data/casePackage";
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
    const deductionClues = new Set(missingLedgerCase.clues.filter((clue) => clue.type === "deduction").map((clue) => clue.id));
    missingLedgerCase.truth.requiredEvidenceIds.forEach((clueId) => {
      expect(objectClues.has(clueId) || topicClues.has(clueId) || deductionClues.has(clueId)).toBe(true);
    });
  });

  it("keeps deduction rules valid", () => {
    expect(() => validateDeductionRules()).not.toThrow();
  });

  it("keeps contradiction rules valid", () => {
    expect(() => validateContradictionRules()).not.toThrow();
  });
});

describe("canal masks case package", () => {
  it("matches playable content requirements", () => {
    expect(canalMasksCase.locations).toHaveLength(5);
    expect(canalMasksCase.npcs).toHaveLength(5);
    expect(canalMasksCase.clues.length).toBeGreaterThanOrEqual(8);
    expect(canalMasksCase.clues.some((clue) => clue.type === "deduction")).toBe(true);
    expect(canalMasksCase.clues.filter((clue) => clue.isRedHerring).length).toBeGreaterThanOrEqual(3);
    expect(new Set(canalMasksCase.clues.flatMap((clue) => clue.contradictionIds)).size).toBeGreaterThanOrEqual(3);
    expect(canalMasksCase.truth.culpritNpcId).toBe("artist_qiao");
    expect(canalMasksCase.truth.hiddenObjectLocationId).toBe("library");
  });

  it("keeps the required evidence discoverable from objects or deduction rules", () => {
    const objectClues = new Set(
      canalMasksCase.locations.flatMap((location) => location.searchableObjects.flatMap((object) => object.clueIds)),
    );
    const topicClues = new Set(canalMasksCase.topics.flatMap((topic) => topic.revealsClueIds));
    const deductionClues = new Set(canalMasksCase.clues.filter((clue) => clue.type === "deduction").map((clue) => clue.id));
    canalMasksCase.truth.requiredEvidenceIds.forEach((clueId) => {
      expect(objectClues.has(clueId) || topicClues.has(clueId) || deductionClues.has(clueId)).toBe(true);
    });
  });
});

describe("station last train case package", () => {
  it("matches playable content requirements", () => {
    expect(stationLastTrainCase.locations).toHaveLength(5);
    expect(stationLastTrainCase.npcs).toHaveLength(5);
    expect(stationLastTrainCase.clues.length).toBeGreaterThanOrEqual(8);
    expect(stationLastTrainCase.clues.some((clue) => clue.type === "deduction")).toBe(true);
    expect(stationLastTrainCase.clues.filter((clue) => clue.isRedHerring).length).toBeGreaterThanOrEqual(3);
    expect(new Set(stationLastTrainCase.clues.flatMap((clue) => clue.contradictionIds)).size).toBeGreaterThanOrEqual(3);
    expect(stationLastTrainCase.truth.culpritNpcId).toBe("stationmaster_du");
    expect(stationLastTrainCase.truth.hiddenObjectLocationId).toBe("library");
  });

  it("keeps the required evidence discoverable from objects or deduction rules", () => {
    const objectClues = new Set(
      stationLastTrainCase.locations.flatMap((location) => location.searchableObjects.flatMap((object) => object.clueIds)),
    );
    const topicClues = new Set(stationLastTrainCase.topics.flatMap((topic) => topic.revealsClueIds));
    const deductionClues = new Set(stationLastTrainCase.clues.filter((clue) => clue.type === "deduction").map((clue) => clue.id));
    stationLastTrainCase.truth.requiredEvidenceIds.forEach((clueId) => {
      expect(objectClues.has(clueId) || topicClues.has(clueId) || deductionClues.has(clueId)).toBe(true);
    });
  });
});
