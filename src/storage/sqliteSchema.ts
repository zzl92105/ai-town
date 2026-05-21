export const sqliteSchema = `
CREATE TABLE IF NOT EXISTS saves (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  case_version TEXT NOT NULL,
  current_stage_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS discovered_clues (
  save_id TEXT NOT NULL,
  clue_id TEXT NOT NULL,
  discovered_at TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  player_mark TEXT NOT NULL DEFAULT 'none',
  PRIMARY KEY (save_id, clue_id),
  FOREIGN KEY (save_id) REFERENCES saves(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS investigation_events (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL,
  stage_id TEXT NOT NULL,
  type TEXT NOT NULL,
  summary TEXT NOT NULL,
  importance INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (save_id) REFERENCES saves(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS event_npcs (
  event_id TEXT NOT NULL,
  npc_id TEXT NOT NULL,
  PRIMARY KEY (event_id, npc_id),
  FOREIGN KEY (event_id) REFERENCES investigation_events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS event_clues (
  event_id TEXT NOT NULL,
  clue_id TEXT NOT NULL,
  PRIMARY KEY (event_id, clue_id),
  FOREIGN KEY (event_id) REFERENCES investigation_events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS dialogue_messages (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL,
  npc_id TEXT NOT NULL,
  topic_id TEXT,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (save_id) REFERENCES saves(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS npc_runtime_state (
  save_id TEXT NOT NULL,
  npc_id TEXT NOT NULL,
  trust_score INTEGER NOT NULL,
  revealed_fact_ids TEXT NOT NULL,
  confronted_topic_ids TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (save_id, npc_id),
  FOREIGN KEY (save_id) REFERENCES saves(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS deduction_notes (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  linked_clue_ids TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (save_id) REFERENCES saves(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS final_deductions (
  id TEXT PRIMARY KEY,
  save_id TEXT NOT NULL,
  culprit_npc_id TEXT NOT NULL,
  motive_text TEXT NOT NULL,
  method_text TEXT NOT NULL,
  location_id TEXT NOT NULL,
  evidence_clue_ids TEXT NOT NULL,
  score_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (save_id) REFERENCES saves(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS save_snapshots (
  save_id TEXT PRIMARY KEY,
  snapshot_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (save_id) REFERENCES saves(id) ON DELETE CASCADE
);
`;
