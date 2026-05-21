import type { Clue, InvestigationStage, Location, Npc } from "../domain/types";

export type MapPoint = {
  left: number;
  top: number;
};

export type LocationMapNode = {
  id: string;
  hotspot: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  label: MapPoint;
  marker: MapPoint;
  npcAnchor: MapPoint;
};

export type LocationMapStatus = {
  locationId: string;
  discoveredClueCount: number;
  discoveredKeyClueCount: number;
  undiscoveredObjectCount: number;
};

export type NpcMapMarker = {
  npcId: string;
  locationId: string;
  left: number;
  top: number;
};

export const locationMapNodes: Record<string, LocationMapNode> = {
  square: {
    id: "square",
    hotspot: { left: 34, top: 39, width: 34, height: 10 },
    label: { left: 50, top: 44 },
    marker: { left: 50, top: 45 },
    npcAnchor: { left: 47, top: 48 },
  },
  cafe: {
    id: "cafe",
    hotspot: { left: 21, top: 9, width: 34, height: 10 },
    label: { left: 33, top: 15 },
    marker: { left: 33, top: 18 },
    npcAnchor: { left: 20, top: 25 },
  },
  clinic: {
    id: "clinic",
    hotspot: { left: 64, top: 10, width: 28, height: 10 },
    label: { left: 78, top: 16 },
    marker: { left: 79, top: 18 },
    npcAnchor: { left: 78, top: 25 },
  },
  library: {
    id: "library",
    hotspot: { left: 12, top: 52, width: 34, height: 10 },
    label: { left: 26, top: 57 },
    marker: { left: 25, top: 60 },
    npcAnchor: { left: 22, top: 66 },
  },
  town_hall: {
    id: "town_hall",
    hotspot: { left: 57, top: 61, width: 37, height: 11 },
    label: { left: 75, top: 66 },
    marker: { left: 76, top: 69 },
    npcAnchor: { left: 76, top: 76 },
  },
};

export function getLocationMapStatuses(params: {
  locations: Location[];
  clues: Clue[];
  discoveredClueIds: string[];
}): LocationMapStatus[] {
  const discovered = new Set(params.discoveredClueIds);
  return params.locations.map((location) => {
    const discoveredClues = params.clues.filter(
      (clue) => discovered.has(clue.id) && clue.relatedLocationIds.includes(location.id),
    );
    const undiscoveredObjectCount = location.searchableObjects.filter((object) =>
      object.clueIds.some((clueId) => !discovered.has(clueId)),
    ).length;

    return {
      locationId: location.id,
      discoveredClueCount: discoveredClues.length,
      discoveredKeyClueCount: discoveredClues.filter((clue) => clue.isKey).length,
      undiscoveredObjectCount,
    };
  });
}

export function getNpcMapMarkers(params: {
  npcs: Npc[];
  stage: InvestigationStage;
}): NpcMapMarker[] {
  const locationCounts: Record<string, number> = {};

  return params.npcs.flatMap((npc) => {
    const locationId = params.stage.npcLocations[npc.id];
    const node = locationMapNodes[locationId];
    if (!node) return [];

    const count = locationCounts[locationId] ?? 0;
    locationCounts[locationId] = count + 1;
    const offset = markerOffset(count);

    return {
      npcId: npc.id,
      locationId,
      left: node.npcAnchor.left + offset.left,
      top: node.npcAnchor.top + offset.top,
    };
  });
}

function markerOffset(index: number): MapPoint {
  const offsets: MapPoint[] = [
    { left: 0, top: 0 },
    { left: 5, top: -1 },
    { left: -5, top: -1 },
    { left: 3, top: 4 },
    { left: -3, top: 4 },
  ];

  return offsets[index] ?? { left: 0, top: 0 };
}
