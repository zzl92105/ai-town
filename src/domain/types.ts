export type StageId = "morning" | "afternoon" | "evening";

export type Relationship = {
  label: string;
  description: string;
};

export type SearchableObject = {
  id: string;
  name: string;
  description: string;
  clueIds: string[];
  requiredStageId?: StageId;
};

export type Location = {
  id: string;
  name: string;
  description: string;
  environmentDetails: string[];
  searchableObjects: SearchableObject[];
};

export type Npc = {
  id: string;
  name: string;
  role: string;
  personality: string[];
  locationId: string;
  initialStageId: StageId;
  publicBio: string;
  alibi: string;
  timelineClaims: string[];
  knownFacts: string[];
  hiddenFacts: string[];
  lieRules: string[];
  trustScore: number;
  relationships: Record<string, Relationship>;
};

export type ClueType = "physical" | "testimony" | "environment" | "deduction";
export type ClueMark = "none" | "important" | "suspicious" | "explained";

export type Clue = {
  id: string;
  title: string;
  description: string;
  type: ClueType;
  source: string;
  relatedNpcIds: string[];
  relatedLocationIds: string[];
  isKey: boolean;
  isRedHerring: boolean;
  unlocksTopicIds: string[];
  discoveryText: string;
  requiredObjectId?: string;
  requiredTopicId?: string;
  contradictionIds: string[];
  scoringWeight: number;
};

export type DialogueTopic = {
  id: string;
  title: string;
  npcId: string;
  requiredClueIds: string[];
  stageId: StageId;
  revealsClueIds: string[];
  promptHint: string;
  revealCondition: "always" | "trust" | "clue" | "stage";
  attitudeDelta?: number;
  response: string;
};

export type InvestigationStage = {
  id: StageId;
  name: string;
  description: string;
  advanceHint: string;
  npcLocations: Record<string, string>;
};

export type CaseTruth = {
  culpritNpcId: string;
  motiveKeywords: string[];
  methodKeywords: string[];
  hiddenObjectLocationId: string;
  requiredEvidenceIds: string[];
  canonicalTruth: string;
  scoringRubric: Array<{ id: string; label: string; weight: number }>;
};

export type CasePackage = {
  manifest: {
    id: string;
    title: string;
    version: string;
    author?: string;
    minAppVersion: string;
    entry: Record<"caseFile" | "locations" | "npcs" | "clues" | "topics" | "stages" | "truth", string>;
  };
  caseFile: {
    id: string;
    title: string;
    briefing: string;
    objectives: string[];
    suspectNpcIds: string[];
    recommendedFlow: string[];
  };
  locations: Location[];
  npcs: Npc[];
  clues: Clue[];
  topics: DialogueTopic[];
  stages: InvestigationStage[];
  truth: CaseTruth;
};

export type InvestigationEvent = {
  id: string;
  stageId: StageId;
  type: "clue" | "dialogue" | "contradiction" | "stage" | "note" | "final";
  summary: string;
  npcIds: string[];
  clueIds: string[];
  locationId?: string;
  importance: number;
  createdAt: string;
};

export type DialogueMessage = {
  id: string;
  npcId: string;
  topicId?: string;
  role: "player" | "npc" | "system";
  content: string;
  createdAt: string;
};

export type FinalDeduction = {
  culpritNpcId: string;
  motive: string;
  method: string;
  hiddenObjectLocationId: string;
  evidenceClueIds: string[];
};

export type DeductionScore = {
  culpritCorrect: boolean;
  motiveCorrect: boolean;
  methodCorrect: boolean;
  locationCorrect: boolean;
  evidenceCoverage: number;
  ending: "perfect" | "solved" | "wrong" | "insufficient";
  reasons: string[];
};

export type DeductionNote = {
  id: string;
  title: string;
  content: string;
  linkedClueIds: string[];
  updatedAt: string;
};

export type SaveSnapshot = {
  id: string;
  caseId: string;
  caseVersion: string;
  currentStageId: StageId;
  currentLocationId: string;
  currentNpcId: string;
  discoveredClueIds: string[];
  clueMarks: Record<string, ClueMark>;
  npcTrustScores: Record<string, number>;
  confrontedTopicIds: Record<string, string[]>;
  revealedFactIds: Record<string, string[]>;
  resolvedContradictionIds: string[];
  dialogue: DialogueMessage[];
  events: InvestigationEvent[];
  note: string;
  deductionNotes: DeductionNote[];
  lastFinalDeduction?: FinalDeduction;
  finalScore?: DeductionScore;
  endingReview?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};

export type SaveSummary = {
  id: string;
  caseId: string;
  caseVersion: string;
  currentStageId: StageId;
  discoveredClueCount: number;
  eventCount: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};

export type AppSettings = {
  deepseekApiKey?: string;
  windowPreference?: string;
  recentSaveId?: string;
};

export type StructuredNpcReply = {
  text: string;
  revealedFactIds: string[];
  newTestimony?: string;
  unlockTopicIds: string[];
  attitudeDelta: number;
  logSummary: string;
};
