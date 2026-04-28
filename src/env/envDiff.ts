import { EnvRecord, EnvDiffResult, EnvDiffEntry } from './envParser.types';

/**
 * Compares two EnvRecords and returns a structured diff result.
 * @param base - The baseline env (e.g. manifest / production)
 * @param target - The target env (e.g. local .env file)
 */
export function diffEnvRecords(base: EnvRecord, target: EnvRecord): EnvDiffResult {
  const added: EnvDiffEntry[] = [];
  const removed: EnvDiffEntry[] = [];
  const changed: EnvDiffEntry[] = [];
  const unchanged: EnvDiffEntry[] = [];

  const allKeys = new Set([...Object.keys(base), ...Object.keys(target)]);

  for (const key of allKeys) {
    const baseVal = base[key];
    const targetVal = target[key];

    if (baseVal === undefined) {
      added.push({ key, value: targetVal });
    } else if (targetVal === undefined) {
      removed.push({ key, value: baseVal });
    } else if (baseVal !== targetVal) {
      changed.push({ key, value: targetVal, previousValue: baseVal });
    } else {
      unchanged.push({ key, value: targetVal });
    }
  }

  return { added, removed, changed, unchanged };
}

/**
 * Returns true if there are any meaningful differences between two EnvRecords.
 */
export function hasDiff(result: EnvDiffResult): boolean {
  return (
    result.added.length > 0 ||
    result.removed.length > 0 ||
    result.changed.length > 0
  );
}

/**
 * Formats a diff result into a human-readable string for CLI output.
 */
export function formatDiff(result: EnvDiffResult): string {
  const lines: string[] = [];

  for (const entry of result.added) {
    lines.push(`  + ${entry.key}=${entry.value}`);
  }
  for (const entry of result.removed) {
    lines.push(`  - ${entry.key}=${entry.value}`);
  }
  for (const entry of result.changed) {
    lines.push(`  ~ ${entry.key}: "${entry.previousValue}" → "${entry.value}"`);
  }

  return lines.length > 0 ? lines.join('\n') : '(no differences)';
}
