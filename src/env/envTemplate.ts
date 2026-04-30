import * as fs from 'fs';
import * as path from 'path';
import { EnvRecord } from './envParser.types';

export interface TemplateEntry {
  key: string;
  description?: string;
  required: boolean;
  defaultValue?: string;
  example?: string;
}

export interface EnvTemplate {
  version: string;
  entries: TemplateEntry[];
}

/**
 * Generate a template from an existing EnvRecord, treating all keys as required.
 */
export function generateTemplate(record: EnvRecord, descriptions?: Record<string, string>): EnvTemplate {
  const entries: TemplateEntry[] = Object.keys(record).map((key) => ({
    key,
    description: descriptions?.[key],
    required: true,
    example: record[key] || undefined,
  }));

  return { version: '1.0', entries };
}

/**
 * Serialize a template to a .env-style file with comments.
 */
export function templateToString(template: EnvTemplate): string {
  const lines: string[] = [`# envoy template v${template.version}`, ''];

  for (const entry of template.entries) {
    if (entry.description) {
      lines.push(`# ${entry.description}`);
    }
    if (entry.required) {
      lines.push('# required: true');
    }
    if (entry.example) {
      lines.push(`# example: ${entry.example}`);
    }
    const value = entry.defaultValue !== undefined ? entry.defaultValue : '';
    lines.push(`${entry.key}=${value}`);
    lines.push('');
  }

  return lines.join('\n').trimEnd() + '\n';
}

/**
 * Write a template file to disk.
 */
export function saveTemplate(templatePath: string, template: EnvTemplate): void {
  const dir = path.dirname(templatePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(templatePath, templateToString(template), 'utf-8');
}

/**
 * Load and parse a template file from disk (JSON format).
 */
export function loadTemplate(templatePath: string): EnvTemplate {
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template file not found: ${templatePath}`);
  }
  const raw = fs.readFileSync(templatePath, 'utf-8');
  return JSON.parse(raw) as EnvTemplate;
}

/**
 * Check which required template keys are missing from a given EnvRecord.
 */
export function getMissingKeys(template: EnvTemplate, record: EnvRecord): string[] {
  return template.entries
    .filter((e) => e.required && !(e.key in record))
    .map((e) => e.key);
}
