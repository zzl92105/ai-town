import type { AppSettings, SaveSnapshot, SaveSummary } from "../domain/types";
import { invoke } from "@tauri-apps/api/core";

const saveIndexKey = "ai-town:saves";
const saveKey = (id: string) => `ai-town:save:${id}`;
const settingsKey = "ai-town:settings";

const parseJson = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export type SaveRepository = {
  listSaves: () => SaveSummary[];
  loadSave: (id: string) => SaveSnapshot | undefined;
  upsertSave: (snapshot: SaveSnapshot) => void;
  deleteSave: (id: string) => void;
  loadSettings: () => AppSettings;
  saveSettings: (settings: AppSettings) => void;
};

export type AsyncSaveRepository = {
  listSaves: () => Promise<SaveSummary[]>;
  loadSave: (id: string) => Promise<SaveSnapshot | undefined>;
  upsertSave: (snapshot: SaveSnapshot) => Promise<void>;
  deleteSave: (id: string) => Promise<void>;
  loadSettings: () => Promise<AppSettings>;
  saveSettings: (settings: AppSettings) => Promise<void>;
};

export const localSaveRepository: SaveRepository = {
  listSaves: () => parseJson<SaveSummary[]>(localStorage.getItem(saveIndexKey), []),
  loadSave: (id) => parseJson<SaveSnapshot | undefined>(localStorage.getItem(saveKey(id)), undefined),
  upsertSave: (snapshot) => {
    localStorage.setItem(saveKey(snapshot.id), JSON.stringify(snapshot));
    const summaries = localSaveRepository.listSaves();
    const summary: SaveSummary = {
      id: snapshot.id,
      caseId: snapshot.caseId,
      caseVersion: snapshot.caseVersion,
      currentStageId: snapshot.currentStageId,
      discoveredClueCount: snapshot.discoveredClueIds.length,
      eventCount: snapshot.events.length,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      completedAt: snapshot.completedAt,
    };
    localStorage.setItem(
      saveIndexKey,
      JSON.stringify([summary, ...summaries.filter((item) => item.id !== snapshot.id)].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))),
    );
  },
  deleteSave: (id) => {
    localStorage.removeItem(saveKey(id));
    localStorage.setItem(saveIndexKey, JSON.stringify(localSaveRepository.listSaves().filter((item) => item.id !== id)));
    const settings = localSaveRepository.loadSettings();
    if (settings.recentSaveId === id) {
      localSaveRepository.saveSettings({ ...settings, recentSaveId: undefined });
    }
  },
  loadSettings: () => parseJson<AppSettings>(localStorage.getItem(settingsKey), {}),
  saveSettings: (settings) => localStorage.setItem(settingsKey, JSON.stringify(settings)),
};

export const tauriSaveRepository: AsyncSaveRepository = {
  listSaves: () => invoke<SaveSummary[]>("list_saves"),
  loadSave: (id) => invoke<SaveSnapshot | null>("load_save", { id }).then((snapshot) => snapshot ?? undefined),
  upsertSave: (snapshot) => invoke<void>("upsert_save", { snapshot }),
  deleteSave: (id) => invoke<void>("delete_save", { id }),
  loadSettings: () => invoke<AppSettings>("load_settings"),
  saveSettings: (settings) => invoke<void>("save_settings", { settings }),
};

export function isTauriRuntime() {
  return Boolean("__TAURI_INTERNALS__" in window);
}

export const storageImplementationNote =
  "Web 调试环境使用 localStorage 仓储兜底；Tauri 桌面环境提供 SQLite 命令仓储，表结构见 sqliteSchema，运行期可通过 tauriSaveRepository 走真实本机数据库。";
