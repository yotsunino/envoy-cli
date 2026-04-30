import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  generateTemplate,
  templateToString,
  saveTemplate,
  loadTemplate,
  getMissingKeys,
  EnvTemplate,
} from '../envTemplate';

describe('generateTemplate', () => {
  it('creates a template from an EnvRecord', () => {
    const record = { API_KEY: 'abc123', PORT: '3000' };
    const template = generateTemplate(record);
    expect(template.version).toBe('1.0');
    expect(template.entries).toHaveLength(2);
    expect(template.entries[0].key).toBe('API_KEY');
    expect(template.entries[0].required).toBe(true);
    expect(template.entries[0].example).toBe('abc123');
  });

  it('includes descriptions when provided', () => {
    const record = { DB_URL: 'postgres://localhost/db' };
    const template = generateTemplate(record, { DB_URL: 'Database connection URL' });
    expect(template.entries[0].description).toBe('Database connection URL');
  });
});

describe('templateToString', () => {
  it('serializes template to env-style string', () => {
    const template: EnvTemplate = {
      version: '1.0',
      entries: [
        { key: 'API_KEY', required: true, description: 'API key', example: 'abc' },
        { key: 'PORT', required: false, defaultValue: '3000' },
      ],
    };
    const output = templateToString(template);
    expect(output).toContain('# envoy template v1.0');
    expect(output).toContain('# API key');
    expect(output).toContain('API_KEY=');
    expect(output).toContain('PORT=3000');
  });
});

describe('saveTemplate and loadTemplate', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envoy-template-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('saves and loads a template as JSON', () => {
    const template: EnvTemplate = {
      version: '1.0',
      entries: [{ key: 'SECRET', required: true }],
    };
    const filePath = path.join(tmpDir, 'template.json');
    const jsonContent = JSON.stringify(template);
    fs.writeFileSync(filePath, jsonContent, 'utf-8');

    const loaded = loadTemplate(filePath);
    expect(loaded.version).toBe('1.0');
    expect(loaded.entries[0].key).toBe('SECRET');
  });

  it('throws if template file does not exist', () => {
    expect(() => loadTemplate(path.join(tmpDir, 'missing.json'))).toThrow('Template file not found');
  });
});

describe('getMissingKeys', () => {
  it('returns keys that are required but missing from record', () => {
    const template: EnvTemplate = {
      version: '1.0',
      entries: [
        { key: 'API_KEY', required: true },
        { key: 'PORT', required: false },
        { key: 'DB_URL', required: true },
      ],
    };
    const record = { API_KEY: 'abc' };
    const missing = getMissingKeys(template, record);
    expect(missing).toEqual(['DB_URL']);
  });

  it('returns empty array when all required keys are present', () => {
    const template: EnvTemplate = {
      version: '1.0',
      entries: [{ key: 'API_KEY', required: true }],
    };
    const missing = getMissingKeys(template, { API_KEY: 'value' });
    expect(missing).toHaveLength(0);
  });
});
