import * as fs from 'fs';
import * as path from 'path';
import { loadRulesFromFile, rulesFileExists } from '../envRulesLoader';

jest.mock('fs');

const mockedFs = fs as jest.Mocked<typeof fs>;

describe('loadRulesFromFile', () => {
  afterEach(() => jest.resetAllMocks());

  it('returns empty array when rules file does not exist', () => {
    mockedFs.existsSync.mockReturnValue(false);
    const rules = loadRulesFromFile('/nonexistent/.envoy-rules.json');
    expect(rules).toEqual([]);
  });

  it('parses a valid rules file', () => {
    const raw = JSON.stringify([
      { key: 'DATABASE_URL', required: true },
      { key: 'NODE_ENV', allowedValues: ['development', 'production'] },
      { key: 'SECRET', pattern: '^[a-z]+$', minLength: 8 },
    ]);
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(raw as unknown as Buffer);

    const rules = loadRulesFromFile('/project/.envoy-rules.json');
    expect(rules).toHaveLength(3);
    expect(rules[0].key).toBe('DATABASE_URL');
    expect(rules[0].required).toBe(true);
    expect(rules[2].pattern).toBeInstanceOf(RegExp);
    expect(rules[2].minLength).toBe(8);
  });

  it('throws when file contains invalid JSON', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue('not-json' as unknown as Buffer);
    expect(() => loadRulesFromFile('/project/.envoy-rules.json')).toThrow(
      'invalid JSON'
    );
  });

  it('throws when file does not contain an array', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue('{"key":"val"}' as unknown as Buffer);
    expect(() => loadRulesFromFile('/project/.envoy-rules.json')).toThrow(
      'JSON array'
    );
  });
});

describe('rulesFileExists', () => {
  it('returns true when the file is present', () => {
    mockedFs.existsSync.mockReturnValue(true);
    expect(rulesFileExists('/project/.envoy-rules.json')).toBe(true);
  });

  it('returns false when the file is absent', () => {
    mockedFs.existsSync.mockReturnValue(false);
    expect(rulesFileExists('/project/.envoy-rules.json')).toBe(false);
  });
});
