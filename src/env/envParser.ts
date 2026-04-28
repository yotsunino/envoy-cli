import * as fs from 'fs';
import * as path from 'path';

export interface EnvEntry {
  key: string;
  value: string;
  comment?: string;
}

export interface ParsedEnv {
  entries: EnvEntry[];
  raw: string;
}

export function parseEnvFile(filePath: string): ParsedEnv {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Env file not found: ${resolved}`);
  }

  const raw = fs.readFileSync(resolved, 'utf-8');
  return parseEnvString(raw);
}

export function parseEnvString(raw: string): ParsedEnv {
  const entries: EnvEntry[] = [];
  const lines = raw.split('\n');

  let pendingComment: string | undefined;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      pendingComment = trimmed.startsWith('#') ? trimmed.slice(1).trim() : undefined;
      continue;
    }

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    entries.push({ key, value, comment: pendingComment });
    pendingComment = undefined;
  }

  return { entries, raw };
}

export function envEntriesToRecord(entries: EnvEntry[]): Record<string, string> {
  return entries.reduce((acc, entry) => {
    acc[entry.key] = entry.value;
    return acc;
  }, {} as Record<string, string>);
}
