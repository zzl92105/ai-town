import { describe, expect, test } from "vitest";
import { missingLedgerCase } from "../data/casePackage";
import { getLocationMapStatuses, getNpcMapMarkers } from "./mapPresentation";

describe("map presentation helpers", () => {
  test("summarizes discovered and remaining clues by location", () => {
    const statuses = getLocationMapStatuses({
      locations: missingLedgerCase.locations,
      clues: missingLedgerCase.clues,
      discoveredClueIds: ["clue_spare_key_log", "clue_coffee_stain", "clue_library_dust_gap"],
    });

    expect(statuses.find((status) => status.locationId === "town_hall")).toMatchObject({
      discoveredClueCount: 2,
      discoveredKeyClueCount: 1,
    });
    expect(statuses.find((status) => status.locationId === "library")).toMatchObject({
      discoveredClueCount: 1,
      discoveredKeyClueCount: 1,
    });
    expect(statuses.find((status) => status.locationId === "cafe")?.undiscoveredObjectCount).toBeGreaterThan(0);
  });

  test("places NPC markers at the current stage locations with offsets for shared locations", () => {
    const evening = missingLedgerCase.stages.find((stage) => stage.id === "evening")!;
    const markers = getNpcMapMarkers({
      npcs: missingLedgerCase.npcs,
      stage: evening,
    });

    const mayor = markers.find((marker) => marker.npcId === "mayor_zhou");
    const librarian = markers.find((marker) => marker.npcId === "librarian_lin");

    expect(mayor).toMatchObject({ locationId: "library" });
    expect(librarian).toMatchObject({ locationId: "library" });
    expect(mayor?.left).not.toBe(librarian?.left);
    expect(markers).toHaveLength(missingLedgerCase.npcs.length);
  });
});
