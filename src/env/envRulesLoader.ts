import * as fs from 'fs';
import * as path from 'path';
import { ValidationRule } from './envValidator.types';

const DEFAULT_RULES_FILE = '.envoy-rules.json';

interface RawRule {
  key: string;
  required?: boolean;
  pattern?: string;
  minLength?: number;
  warnIfEmpty?: boolean;
  allowedValues?: string[];
}

export function loadRulesFromFile(filePath?: string): ValidationRule[] {
  const target = filePath ?? path.resolve(process.cwd(), DEFAULT_RULES_FILE);

  if (!fs.existsSync(target)) {
    return [];
  }

  const raw = fs.readFileSync(target, 'utf-8');
  let parsed: RawRule[];

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Failed to parse rules file at ${target}: invalid JSON`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`Rules file at ${target} must export a JSON array`);
  }

  return parsed.map((r): ValidationRule => ({
    key: r.key,
    required: r.required,
    minLength: r.minLength,
    warnIfEmpty: r.warnIfEmpty,
    allowedValues: r.allowedValues,
    pattern: r.pattern ? new RegExp(r.pattern) : undefined,
  }));
}

export function rulesFileExists(filePath?: string): boolean {
  const target = filePath ?? path.resolve(process.cwd(), DEFAULT_RULES_FILE);
  return fs.existsSync(target);
}
