export type DeductionAssist = {
  coverage: number;
  missingDiscoveredEvidenceIds: string[];
  undiscoveredEvidenceIds: string[];
  ready: boolean;
};

export function toggleEvidenceChainItem(items: string[], clueId: string) {
  return items.includes(clueId) ? items.filter((id) => id !== clueId) : [...items, clueId];
}

export function moveEvidenceChainItem(items: string[], draggedId: string, targetId: string) {
  if (draggedId === targetId || !items.includes(draggedId) || !items.includes(targetId)) return items;
  const withoutDragged = items.filter((id) => id !== draggedId);
  const targetIndex = withoutDragged.indexOf(targetId);
  return [...withoutDragged.slice(0, targetIndex), draggedId, ...withoutDragged.slice(targetIndex)];
}

export function buildDeductionAssist(params: {
  requiredEvidenceIds: string[];
  selectedEvidenceIds: string[];
  discoveredClueIds: string[];
}): DeductionAssist {
  const selected = new Set(params.selectedEvidenceIds);
  const discovered = new Set(params.discoveredClueIds);
  const selectedRequired = params.requiredEvidenceIds.filter((id) => selected.has(id));
  return {
    coverage: params.requiredEvidenceIds.length === 0 ? 1 : selectedRequired.length / params.requiredEvidenceIds.length,
    missingDiscoveredEvidenceIds: params.requiredEvidenceIds.filter((id) => discovered.has(id) && !selected.has(id)),
    undiscoveredEvidenceIds: params.requiredEvidenceIds.filter((id) => !discovered.has(id)),
    ready: selectedRequired.length === params.requiredEvidenceIds.length,
  };
}
