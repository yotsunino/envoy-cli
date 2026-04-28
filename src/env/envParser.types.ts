export type EnvEnvironment = 'local' | 'staging' | 'production';

export interface EnvFileConfig {
  environment: EnvEnvironment;
  filePath: string;
}

export interface EnvDiff {
  added: string[];
  removed: string[];
  changed: string[];
  unchanged: string[];
}

export function diffEnvRecords(
  base: Record<string, string>,
  target: Record<string, string>
): EnvDiff {
  const allKeys = new Set([...Object.keys(base), ...Object.keys(target)]);
  const added: string[] = [];
  const removed: string[] = [];
  const changed: string[] = [];
  const unchanged: string[] = [];

  for (const key of allKeys) {
    const inBase = key in base;
    const inTarget = key in target;

    if (!inBase && inTarget) {
      added.push(key);
    } else if (inBase && !inTarget) {
      removed.push(key);
    } else if (base[key] !== target[key]) {
      changed.push(key);
    } else {
      unchanged.push(key);
    }
  }

  return { added, removed, changed, unchanged };
}
