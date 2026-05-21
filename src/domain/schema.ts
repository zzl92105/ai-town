import { z } from "zod";

const stageId = z.enum(["morning", "afternoon", "evening"]);

const manifestSchema = z.object({
  id: z.string(),
  title: z.string(),
  version: z.string(),
  author: z.string().optional(),
  minAppVersion: z.string(),
  entry: z.object({
    caseFile: z.string(),
    locations: z.string(),
    npcs: z.string(),
    clues: z.string(),
    topics: z.string(),
    stages: z.string(),
    truth: z.string(),
  }),
});

const caseFileSchema = z.object({
  id: z.string(),
  title: z.string(),
  briefing: z.string(),
  objectives: z.array(z.string()).min(1),
  suspectNpcIds: z.array(z.string()).min(3).max(5),
  recommendedFlow: z.array(z.string()).min(1),
});

const locationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  environmentDetails: z.array(z.string()),
  searchableObjects: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      clueIds: z.array(z.string()),
      requiredStageId: stageId.optional(),
    }),
  ),
});

const npcSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  personality: z.array(z.string()).min(1),
  locationId: z.string(),
  initialStageId: stageId,
  publicBio: z.string(),
  alibi: z.string(),
  timelineClaims: z.array(z.string()),
  knownFacts: z.array(z.string()),
  hiddenFacts: z.array(z.string()),
  lieRules: z.array(z.string()),
  dialogueStyle: z
    .object({
      voice: z.string(),
      tells: z.array(z.string()),
      pressureResponse: z.string(),
    })
    .optional(),
  disclosureRules: z.record(stageId, z.array(z.string())).optional(),
  trustScore: z.number().min(0).max(100),
  relationships: z.record(z.object({ label: z.string(), description: z.string() })),
});

const clueSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.enum(["physical", "testimony", "environment", "deduction"]),
  source: z.string(),
  relatedNpcIds: z.array(z.string()),
  relatedLocationIds: z.array(z.string()),
  isKey: z.boolean(),
  isRedHerring: z.boolean(),
  unlocksTopicIds: z.array(z.string()),
  discoveryText: z.string(),
  requiredObjectId: z.string().optional(),
  requiredTopicId: z.string().optional(),
  contradictionIds: z.array(z.string()),
  scoringWeight: z.number().min(0),
});

const topicSchema = z.object({
  id: z.string(),
  title: z.string(),
  npcId: z.string(),
  requiredClueIds: z.array(z.string()),
  stageId: stageId,
  revealsClueIds: z.array(z.string()),
  promptHint: z.string(),
  revealCondition: z.enum(["always", "trust", "clue", "stage"]),
  attitudeDelta: z.number().optional(),
  response: z.string(),
});

const stageSchema = z.object({
  id: stageId,
  name: z.string(),
  description: z.string(),
  advanceHint: z.string(),
  npcLocations: z.record(z.string()),
});

const truthSchema = z.object({
  culpritNpcId: z.string(),
  motiveKeywords: z.array(z.string()).min(1),
  methodKeywords: z.array(z.string()).min(1),
  hiddenObjectLocationId: z.string(),
  requiredEvidenceIds: z.array(z.string()).min(1),
  canonicalTruth: z.string(),
  scoringRubric: z.array(z.object({ id: z.string(), label: z.string(), weight: z.number() })),
});

export const casePackageSchema = z.object({
  manifest: manifestSchema,
  caseFile: caseFileSchema,
  locations: z.array(locationSchema).min(5),
  npcs: z.array(npcSchema).min(5).max(5),
  clues: z.array(clueSchema).min(8),
  topics: z.array(topicSchema).min(1),
  stages: z.array(stageSchema).min(3),
  truth: truthSchema,
});

export function validateCasePackage(input: unknown) {
  const parsed = casePackageSchema.parse(input);
  const ids = {
    locations: new Set(parsed.locations.map((item) => item.id)),
    npcs: new Set(parsed.npcs.map((item) => item.id)),
    clues: new Set(parsed.clues.map((item) => item.id)),
    topics: new Set(parsed.topics.map((item) => item.id)),
    stages: new Set(parsed.stages.map((item) => item.id)),
  };

  const assertRef = (condition: boolean, message: string) => {
    if (!condition) throw new Error(message);
  };

  parsed.caseFile.suspectNpcIds.forEach((id) => assertRef(ids.npcs.has(id), `Unknown suspect ${id}`));
  parsed.npcs.forEach((npc) => {
    assertRef(ids.locations.has(npc.locationId), `NPC ${npc.id} references unknown location ${npc.locationId}`);
    assertRef(ids.stages.has(npc.initialStageId), `NPC ${npc.id} references unknown stage ${npc.initialStageId}`);
  });
  parsed.locations.forEach((location) => {
    location.searchableObjects.forEach((object) => {
      object.clueIds.forEach((id) => assertRef(ids.clues.has(id), `Object ${object.id} references unknown clue ${id}`));
    });
  });
  parsed.clues.forEach((clue) => {
    clue.relatedNpcIds.forEach((id) => assertRef(ids.npcs.has(id), `Clue ${clue.id} references unknown NPC ${id}`));
    clue.relatedLocationIds.forEach((id) =>
      assertRef(ids.locations.has(id), `Clue ${clue.id} references unknown location ${id}`),
    );
    clue.unlocksTopicIds.forEach((id) => assertRef(ids.topics.has(id), `Clue ${clue.id} references unknown topic ${id}`));
  });
  parsed.topics.forEach((topic) => {
    assertRef(ids.npcs.has(topic.npcId), `Topic ${topic.id} references unknown NPC ${topic.npcId}`);
    topic.requiredClueIds.forEach((id) => assertRef(ids.clues.has(id), `Topic ${topic.id} requires unknown clue ${id}`));
    topic.revealsClueIds.forEach((id) => assertRef(ids.clues.has(id), `Topic ${topic.id} reveals unknown clue ${id}`));
  });
  assertRef(ids.npcs.has(parsed.truth.culpritNpcId), "Truth references unknown culprit");
  assertRef(ids.locations.has(parsed.truth.hiddenObjectLocationId), "Truth references unknown hidden object location");
  parsed.truth.requiredEvidenceIds.forEach((id) => assertRef(ids.clues.has(id), `Truth requires unknown evidence ${id}`));

  return parsed;
}
