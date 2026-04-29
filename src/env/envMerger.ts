import { EnvRecord } from './envParser.types';

export type MergeStrategy = 'local-wins' | 'remote-wins' | 'prompt';

export interface MergeResult {
  merged: EnvRecord;
  conflicts: string[];
  added: string[];
  removed: string[];
}

/**
 * Merges a local and remote EnvRecord according to the given strategy.
 * 'local-wins'  — keep local value on conflict
 * 'remote-wins' — keep remote value on conflict
 * 'prompt'      — marks conflicts for the caller to resolve; falls back to local
 */
export function mergeEnvRecords(
  local: EnvRecord,
  remote: EnvRecord,
  strategy: MergeStrategy = 'local-wins'
): MergeResult {
  const merged: EnvRecord = {};
  const conflicts: string[] = [];
  const added: string[] = [];
  const removed: string[] = [];

  const allKeys = new Set([...Object.keys(local), ...Object.keys(remote)]);

  for (const key of allKeys) {
    const inLocal = key in local;
    const inRemote = key in remote;

    if (inLocal && !inRemote) {
      // key exists only locally — keep it, mark as removed from remote
      merged[key] = local[key];
      removed.push(key);
    } else if (!inLocal && inRemote) {
      // key exists only remotely — add it
      merged[key] = remote[key];
      added.push(key);
    } else if (local[key] !== remote[key]) {
      // conflict
      conflicts.push(key);
      merged[key] = strategy === 'remote-wins' ? remote[key] : local[key];
    } else {
      // identical
      merged[key] = local[key];
    }
  }

  return { merged, conflicts, added, removed };
}

/**
 * Serialises an EnvRecord back to a .env file string.
 */
export function envRecordToString(record: EnvRecord): string {
  return Object.entries(record)
    .map(([key, value]) => {
      const needsQuotes = /\s|#|=/.test(value);
      return needsQuotes ? `${key}="${value.replace(/"/g, '\\"')}"` : `${key}=${value}`;
    })
    .join('\n');
}
