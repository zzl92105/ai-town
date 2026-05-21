use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveSummary {
    pub id: String,
    pub case_id: String,
    pub case_version: String,
    pub current_stage_id: String,
    pub discovered_clue_count: i64,
    pub event_count: i64,
    pub created_at: String,
    pub updated_at: String,
    pub completed_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveSnapshot {
    pub id: String,
    pub case_id: String,
    pub case_version: String,
    pub current_stage_id: String,
    pub current_location_id: String,
    pub current_npc_id: String,
    pub discovered_clue_ids: Vec<String>,
    pub clue_marks: serde_json::Value,
    pub npc_trust_scores: serde_json::Value,
    pub confronted_topic_ids: serde_json::Value,
    pub revealed_fact_ids: serde_json::Value,
    pub resolved_contradiction_ids: Vec<String>,
    pub dialogue: serde_json::Value,
    pub events: serde_json::Value,
    pub note: String,
    pub deduction_notes: Option<serde_json::Value>,
    pub last_final_deduction: Option<serde_json::Value>,
    pub final_score: Option<serde_json::Value>,
    pub ending_review: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub completed_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub deepseek_api_key: Option<String>,
    pub window_preference: Option<String>,
    pub recent_save_id: Option<String>,
}

fn database_path(app: &AppHandle) -> Result<PathBuf, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("无法定位 App 数据目录：{error}"))?;
    fs::create_dir_all(&app_dir).map_err(|error| format!("无法创建 App 数据目录：{error}"))?;
    Ok(app_dir.join("ai-town.sqlite3"))
}

fn open_database(app: &AppHandle) -> Result<Connection, String> {
    let connection = Connection::open(database_path(app)?)
        .map_err(|error| format!("无法打开 SQLite：{error}"))?;
    init_schema(&connection)?;
    Ok(connection)
}

fn init_schema(connection: &Connection) -> Result<(), String> {
    connection
        .execute_batch(
            r#"
            PRAGMA foreign_keys = ON;

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
            "#,
        )
        .map_err(|error| format!("SQLite schema 初始化失败：{error}"))
}

#[tauri::command]
pub fn list_saves(app: AppHandle) -> Result<Vec<SaveSummary>, String> {
    let connection = open_database(&app)?;
    let mut statement = connection
        .prepare(
            r#"
            SELECT s.id, s.case_id, s.case_version, s.current_stage_id,
                   COUNT(DISTINCT dc.clue_id) AS discovered_clue_count,
                   COUNT(DISTINCT ie.id) AS event_count,
                   s.created_at, s.updated_at, s.completed_at
            FROM saves s
            LEFT JOIN discovered_clues dc ON dc.save_id = s.id
            LEFT JOIN investigation_events ie ON ie.save_id = s.id
            GROUP BY s.id
            ORDER BY s.updated_at DESC
            "#,
        )
        .map_err(|error| format!("读取存档列表失败：{error}"))?;

    let rows = statement
        .query_map([], |row| {
            Ok(SaveSummary {
                id: row.get(0)?,
                case_id: row.get(1)?,
                case_version: row.get(2)?,
                current_stage_id: row.get(3)?,
                discovered_clue_count: row.get(4)?,
                event_count: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
                completed_at: row.get(8)?,
            })
        })
        .map_err(|error| format!("读取存档列表失败：{error}"))?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|error| format!("读取存档列表失败：{error}"))
}

#[tauri::command]
pub fn load_save(app: AppHandle, id: String) -> Result<Option<SaveSnapshot>, String> {
    let connection = open_database(&app)?;
    let mut statement = connection
        .prepare("SELECT snapshot_json FROM save_snapshots WHERE save_id = ?1")
        .map_err(|error| format!("读取存档失败：{error}"))?;
    let mut rows = statement
        .query(params![id])
        .map_err(|error| format!("读取存档失败：{error}"))?;

    if let Some(row) = rows
        .next()
        .map_err(|error| format!("读取存档失败：{error}"))?
    {
        let snapshot_json: String = row
            .get(0)
            .map_err(|error| format!("读取存档失败：{error}"))?;
        let snapshot = serde_json::from_str::<SaveSnapshot>(&snapshot_json)
            .map_err(|error| format!("解析存档失败：{error}"))?;
        Ok(Some(snapshot))
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub fn upsert_save(app: AppHandle, snapshot: SaveSnapshot) -> Result<(), String> {
    let mut connection = open_database(&app)?;
    let transaction = connection
        .transaction()
        .map_err(|error| format!("保存存档失败：{error}"))?;

    transaction
        .execute(
            r#"
            INSERT INTO saves (id, case_id, case_version, current_stage_id, created_at, updated_at, completed_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
            ON CONFLICT(id) DO UPDATE SET
              case_id = excluded.case_id,
              case_version = excluded.case_version,
              current_stage_id = excluded.current_stage_id,
              updated_at = excluded.updated_at,
              completed_at = excluded.completed_at
            "#,
            params![
                &snapshot.id,
                &snapshot.case_id,
                &snapshot.case_version,
                &snapshot.current_stage_id,
                &snapshot.created_at,
                &snapshot.updated_at,
                &snapshot.completed_at
            ],
        )
        .map_err(|error| format!("保存存档失败：{error}"))?;

    transaction
        .execute(
            "DELETE FROM discovered_clues WHERE save_id = ?1",
            params![&snapshot.id],
        )
        .map_err(|error| format!("保存线索失败：{error}"))?;
    for clue_id in &snapshot.discovered_clue_ids {
        let mark = snapshot
            .clue_marks
            .get(clue_id)
            .and_then(|value| value.as_str())
            .unwrap_or("none");
        transaction
            .execute(
                r#"
                INSERT INTO discovered_clues (save_id, clue_id, discovered_at, source_type, source_id, player_mark)
                VALUES (?1, ?2, ?3, 'snapshot', 'runtime', ?4)
                "#,
                params![&snapshot.id, clue_id, &snapshot.updated_at, mark],
            )
            .map_err(|error| format!("保存线索失败：{error}"))?;
    }

    transaction
        .execute(
            "DELETE FROM event_npcs WHERE event_id IN (SELECT id FROM investigation_events WHERE save_id = ?1)",
            params![&snapshot.id],
        )
        .map_err(|error| format!("保存日志 NPC 关联失败：{error}"))?;
    transaction
        .execute(
            "DELETE FROM event_clues WHERE event_id IN (SELECT id FROM investigation_events WHERE save_id = ?1)",
            params![&snapshot.id],
        )
        .map_err(|error| format!("保存日志线索关联失败：{error}"))?;
    transaction
        .execute(
            "DELETE FROM investigation_events WHERE save_id = ?1",
            params![&snapshot.id],
        )
        .map_err(|error| format!("保存日志失败：{error}"))?;
    if let Some(events) = snapshot.events.as_array() {
        for event in events {
            let event_id = event
                .get("id")
                .and_then(|value| value.as_str())
                .unwrap_or_default();
            let stage_id = event
                .get("stageId")
                .and_then(|value| value.as_str())
                .unwrap_or(&snapshot.current_stage_id);
            let event_type = event
                .get("type")
                .and_then(|value| value.as_str())
                .unwrap_or("note");
            let summary = event
                .get("summary")
                .and_then(|value| value.as_str())
                .unwrap_or_default();
            let importance = event
                .get("importance")
                .and_then(|value| value.as_i64())
                .unwrap_or(1);
            let created_at = event
                .get("createdAt")
                .and_then(|value| value.as_str())
                .unwrap_or(&snapshot.updated_at);
            transaction
                .execute(
                    r#"
                    INSERT INTO investigation_events (id, save_id, stage_id, type, summary, importance, created_at)
                    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
                    "#,
                    params![event_id, &snapshot.id, stage_id, event_type, summary, importance, created_at],
                )
                .map_err(|error| format!("保存日志失败：{error}"))?;
            if let Some(npc_ids) = event.get("npcIds").and_then(|value| value.as_array()) {
                for npc_id in npc_ids.iter().filter_map(|value| value.as_str()) {
                    transaction
                        .execute(
                            "INSERT OR IGNORE INTO event_npcs (event_id, npc_id) VALUES (?1, ?2)",
                            params![event_id, npc_id],
                        )
                        .map_err(|error| format!("保存日志 NPC 关联失败：{error}"))?;
                }
            }
            if let Some(clue_ids) = event.get("clueIds").and_then(|value| value.as_array()) {
                for clue_id in clue_ids.iter().filter_map(|value| value.as_str()) {
                    transaction
                        .execute(
                            "INSERT OR IGNORE INTO event_clues (event_id, clue_id) VALUES (?1, ?2)",
                            params![event_id, clue_id],
                        )
                        .map_err(|error| format!("保存日志线索关联失败：{error}"))?;
                }
            }
        }
    }

    transaction
        .execute(
            "DELETE FROM dialogue_messages WHERE save_id = ?1",
            params![&snapshot.id],
        )
        .map_err(|error| format!("保存对话失败：{error}"))?;
    if let Some(messages) = snapshot.dialogue.as_array() {
        for message in messages {
            transaction
                .execute(
                    r#"
                    INSERT INTO dialogue_messages (id, save_id, npc_id, topic_id, role, content, created_at)
                    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
                    "#,
                    params![
                        message.get("id").and_then(|value| value.as_str()).unwrap_or_default(),
                        &snapshot.id,
                        message.get("npcId").and_then(|value| value.as_str()).unwrap_or_default(),
                        message.get("topicId").and_then(|value| value.as_str()),
                        message.get("role").and_then(|value| value.as_str()).unwrap_or("system"),
                        message.get("content").and_then(|value| value.as_str()).unwrap_or_default(),
                        message.get("createdAt").and_then(|value| value.as_str()).unwrap_or(&snapshot.updated_at)
                    ],
                )
                .map_err(|error| format!("保存对话失败：{error}"))?;
        }
    }

    transaction
        .execute(
            "DELETE FROM deduction_notes WHERE save_id = ?1",
            params![&snapshot.id],
        )
        .map_err(|error| format!("保存推理笔记失败：{error}"))?;
    if let Some(notes) = snapshot
        .deduction_notes
        .as_ref()
        .and_then(|value| value.as_array())
    {
        for note in notes {
            transaction
                .execute(
                    r#"
                    INSERT INTO deduction_notes (id, save_id, title, content, linked_clue_ids, updated_at)
                    VALUES (?1, ?2, ?3, ?4, ?5, ?6)
                    "#,
                    params![
                        note.get("id").and_then(|value| value.as_str()).unwrap_or_default(),
                        &snapshot.id,
                        note.get("title").and_then(|value| value.as_str()).unwrap_or("推理记录"),
                        note.get("content").and_then(|value| value.as_str()).unwrap_or_default(),
                        note.get("linkedClueIds").cloned().unwrap_or_else(|| serde_json::json!([])).to_string(),
                        note.get("updatedAt").and_then(|value| value.as_str()).unwrap_or(&snapshot.updated_at)
                    ],
                )
                .map_err(|error| format!("保存推理笔记失败：{error}"))?;
        }
    } else if !snapshot.note.trim().is_empty() {
        transaction
            .execute(
                r#"
                INSERT INTO deduction_notes (id, save_id, title, content, linked_clue_ids, updated_at)
                VALUES (?1, ?2, '推理记录', ?3, '[]', ?4)
                "#,
                params![format!("note_{}", snapshot.id), &snapshot.id, &snapshot.note, &snapshot.updated_at],
            )
            .map_err(|error| format!("保存推理笔记失败：{error}"))?;
    }

    transaction
        .execute(
            "DELETE FROM npc_runtime_state WHERE save_id = ?1",
            params![&snapshot.id],
        )
        .map_err(|error| format!("保存 NPC 状态失败：{error}"))?;
    if let Some(trust_scores) = snapshot.npc_trust_scores.as_object() {
        for (npc_id, trust_score) in trust_scores {
            let revealed = snapshot
                .revealed_fact_ids
                .get(npc_id)
                .cloned()
                .unwrap_or_else(|| serde_json::json!([]));
            let confronted = snapshot
                .confronted_topic_ids
                .get(npc_id)
                .cloned()
                .unwrap_or_else(|| serde_json::json!([]));
            transaction
                .execute(
                    r#"
                    INSERT INTO npc_runtime_state (save_id, npc_id, trust_score, revealed_fact_ids, confronted_topic_ids, updated_at)
                    VALUES (?1, ?2, ?3, ?4, ?5, ?6)
                    "#,
                    params![
                        &snapshot.id,
                        npc_id,
                        trust_score.as_i64().unwrap_or(50),
                        revealed.to_string(),
                        confronted.to_string(),
                        &snapshot.updated_at
                    ],
                )
                .map_err(|error| format!("保存 NPC 状态失败：{error}"))?;
        }
    }

    transaction
        .execute(
            "DELETE FROM final_deductions WHERE save_id = ?1",
            params![&snapshot.id],
        )
        .map_err(|error| format!("保存最终推理失败：{error}"))?;
    if let (Some(answer), Some(score)) = (&snapshot.last_final_deduction, &snapshot.final_score) {
        transaction
            .execute(
                r#"
                INSERT INTO final_deductions
                  (id, save_id, culprit_npc_id, motive_text, method_text, location_id, evidence_clue_ids, score_json, created_at)
                VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
                "#,
                params![
                    format!("final_{}", snapshot.id),
                    &snapshot.id,
                    answer.get("culpritNpcId").and_then(|value| value.as_str()).unwrap_or_default(),
                    answer.get("motive").and_then(|value| value.as_str()).unwrap_or_default(),
                    answer.get("method").and_then(|value| value.as_str()).unwrap_or_default(),
                    answer.get("hiddenObjectLocationId").and_then(|value| value.as_str()).unwrap_or_default(),
                    answer.get("evidenceClueIds").cloned().unwrap_or_else(|| serde_json::json!([])).to_string(),
                    score.to_string(),
                    &snapshot.updated_at
                ],
            )
            .map_err(|error| format!("保存最终推理失败：{error}"))?;
    }

    let snapshot_json =
        serde_json::to_string(&snapshot).map_err(|error| format!("序列化存档失败：{error}"))?;
    transaction
        .execute(
            r#"
            INSERT INTO save_snapshots (save_id, snapshot_json, updated_at)
            VALUES (?1, ?2, ?3)
            ON CONFLICT(save_id) DO UPDATE SET
              snapshot_json = excluded.snapshot_json,
              updated_at = excluded.updated_at
            "#,
            params![&snapshot.id, snapshot_json, &snapshot.updated_at],
        )
        .map_err(|error| format!("保存存档快照失败：{error}"))?;

    transaction
        .commit()
        .map_err(|error| format!("提交存档失败：{error}"))
}

#[tauri::command]
pub fn delete_save(app: AppHandle, id: String) -> Result<(), String> {
    let mut connection = open_database(&app)?;
    let transaction = connection
        .transaction()
        .map_err(|error| format!("删除存档失败：{error}"))?;

    transaction
        .execute(
            "DELETE FROM save_snapshots WHERE save_id = ?1",
            params![&id],
        )
        .map_err(|error| format!("删除存档快照失败：{error}"))?;
    transaction
        .execute(
            "DELETE FROM final_deductions WHERE save_id = ?1",
            params![&id],
        )
        .map_err(|error| format!("删除最终推理失败：{error}"))?;
    transaction
        .execute(
            "DELETE FROM npc_runtime_state WHERE save_id = ?1",
            params![&id],
        )
        .map_err(|error| format!("删除 NPC 状态失败：{error}"))?;
    transaction
        .execute(
            "DELETE FROM deduction_notes WHERE save_id = ?1",
            params![&id],
        )
        .map_err(|error| format!("删除推理笔记失败：{error}"))?;
    transaction
        .execute(
            "DELETE FROM dialogue_messages WHERE save_id = ?1",
            params![&id],
        )
        .map_err(|error| format!("删除对话失败：{error}"))?;
    transaction
        .execute(
            "DELETE FROM event_npcs WHERE event_id IN (SELECT id FROM investigation_events WHERE save_id = ?1)",
            params![&id],
        )
        .map_err(|error| format!("删除日志 NPC 关联失败：{error}"))?;
    transaction
        .execute(
            "DELETE FROM event_clues WHERE event_id IN (SELECT id FROM investigation_events WHERE save_id = ?1)",
            params![&id],
        )
        .map_err(|error| format!("删除日志线索关联失败：{error}"))?;
    transaction
        .execute(
            "DELETE FROM investigation_events WHERE save_id = ?1",
            params![&id],
        )
        .map_err(|error| format!("删除日志失败：{error}"))?;
    transaction
        .execute(
            "DELETE FROM discovered_clues WHERE save_id = ?1",
            params![&id],
        )
        .map_err(|error| format!("删除线索失败：{error}"))?;
    transaction
        .execute("DELETE FROM saves WHERE id = ?1", params![&id])
        .map_err(|error| format!("删除存档失败：{error}"))?;
    transaction
        .execute(
            "DELETE FROM app_settings WHERE key = 'recent_save_id' AND value = ?1",
            params![id],
        )
        .map_err(|error| format!("清除最近存档设置失败：{error}"))?;

    transaction
        .commit()
        .map_err(|error| format!("提交删除存档失败：{error}"))
}

#[tauri::command]
pub fn load_settings(app: AppHandle) -> Result<AppSettings, String> {
    let connection = open_database(&app)?;
    let mut settings = AppSettings::default();
    let mut statement = connection
        .prepare("SELECT key, value FROM app_settings")
        .map_err(|error| format!("读取设置失败：{error}"))?;
    let rows = statement
        .query_map([], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        })
        .map_err(|error| format!("读取设置失败：{error}"))?;

    for row in rows {
        let (key, value) = row.map_err(|error| format!("读取设置失败：{error}"))?;
        match key.as_str() {
            "deepseek_api_key" => settings.deepseek_api_key = Some(value),
            "window_preference" => settings.window_preference = Some(value),
            "recent_save_id" => settings.recent_save_id = Some(value),
            _ => {}
        }
    }
    Ok(settings)
}

#[tauri::command]
pub fn save_settings(app: AppHandle, settings: AppSettings) -> Result<(), String> {
    let connection = open_database(&app)?;
    let updated_at = chrono_like_now();
    let values = [
        ("deepseek_api_key", settings.deepseek_api_key),
        ("window_preference", settings.window_preference),
        ("recent_save_id", settings.recent_save_id),
    ];
    for (key, value) in values {
        if let Some(value) = value {
            connection
                .execute(
                    r#"
                    INSERT INTO app_settings (key, value, updated_at)
                    VALUES (?1, ?2, ?3)
                    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
                    "#,
                    params![key, value, updated_at],
                )
                .map_err(|error| format!("保存设置失败：{error}"))?;
        } else {
            connection
                .execute("DELETE FROM app_settings WHERE key = ?1", params![key])
                .map_err(|error| format!("保存设置失败：{error}"))?;
        }
    }
    Ok(())
}

fn chrono_like_now() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let seconds = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_secs())
        .unwrap_or_default();
    seconds.to_string()
}
