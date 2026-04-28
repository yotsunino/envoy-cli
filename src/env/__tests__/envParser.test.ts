import { parseEnvString, envEntriesToRecord } from '../envParser';
import { diffEnvRecords } from '../envParser.types';

describe('parseEnvString', () => {
  it('parses simple key=value pairs', () => {
    const raw = 'FOO=bar\nBAZ=qux';
    const { entries } = parseEnvString(raw);
    expect(entries).toHaveLength(2);
    expect(entries[0]).toEqual({ key: 'FOO', value: 'bar', comment: undefined });
    expect(entries[1]).toEqual({ key: 'BAZ', value: 'qux', comment: undefined });
  });

  it('strips surrounding quotes from values', () => {
    const raw = 'SECRET="my secret value"\nTOKEN=\'abc123\'';
    const { entries } = parseEnvString(raw);
    expect(entries[0].value).toBe('my secret value');
    expect(entries[1].value).toBe('abc123');
  });

  it('attaches preceding comment to entry', () => {
    const raw = '# database url\nDB_URL=postgres://localhost/db';
    const { entries } = parseEnvString(raw);
    expect(entries[0].comment).toBe('database url');
  });

  it('ignores blank lines and standalone comments', () => {
    const raw = '\n# just a comment\n\nKEY=value';
    const { entries } = parseEnvString(raw);
    expect(entries).toHaveLength(1);
    expect(entries[0].key).toBe('KEY');
  });

  it('ignores lines without an equals sign', () => {
    const raw = 'INVALID_LINE\nVALID=yes';
    const { entries } = parseEnvString(raw);
    expect(entries).toHaveLength(1);
  });
});

describe('envEntriesToRecord', () => {
  it('converts entries array to key-value record', () => {
    const entries = [
      { key: 'A', value: '1' },
      { key: 'B', value: '2' },
    ];
    const record = envEntriesToRecord(entries);
    expect(record).toEqual({ A: '1', B: '2' });
  });
});

describe('diffEnvRecords', () => {
  it('detects added, removed, changed, and unchanged keys', () => {
    const base = { A: '1', B: '2', C: '3' };
    const target = { A: '1', B: 'changed', D: 'new' };
    const diff = diffEnvRecords(base, target);
    expect(diff.unchanged).toContain('A');
    expect(diff.changed).toContain('B');
    expect(diff.removed).toContain('C');
    expect(diff.added).toContain('D');
  });
});
