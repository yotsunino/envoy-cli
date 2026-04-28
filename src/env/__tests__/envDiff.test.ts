import { diffEnvRecords, hasDiff, formatDiff } from '../envDiff';
import { EnvRecord } from '../envParser.types';

describe('diffEnvRecords', () => {
  const base: EnvRecord = {
    API_URL: 'https://prod.example.com',
    SECRET_KEY: 'abc123',
    REMOVED_KEY: 'old-value',
  };

  const target: EnvRecord = {
    API_URL: 'https://staging.example.com',
    SECRET_KEY: 'abc123',
    NEW_KEY: 'new-value',
  };

  it('detects added keys', () => {
    const result = diffEnvRecords(base, target);
    expect(result.added).toHaveLength(1);
    expect(result.added[0].key).toBe('NEW_KEY');
    expect(result.added[0].value).toBe('new-value');
  });

  it('detects removed keys', () => {
    const result = diffEnvRecords(base, target);
    expect(result.removed).toHaveLength(1);
    expect(result.removed[0].key).toBe('REMOVED_KEY');
  });

  it('detects changed keys', () => {
    const result = diffEnvRecords(base, target);
    expect(result.changed).toHaveLength(1);
    expect(result.changed[0].key).toBe('API_URL');
    expect(result.changed[0].previousValue).toBe('https://prod.example.com');
    expect(result.changed[0].value).toBe('https://staging.example.com');
  });

  it('detects unchanged keys', () => {
    const result = diffEnvRecords(base, target);
    expect(result.unchanged).toHaveLength(1);
    expect(result.unchanged[0].key).toBe('SECRET_KEY');
  });

  it('returns empty diff for identical records', () => {
    const result = diffEnvRecords(base, base);
    expect(result.added).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
    expect(result.changed).toHaveLength(0);
    expect(result.unchanged).toHaveLength(3);
  });
});

describe('hasDiff', () => {
  it('returns true when there are differences', () => {
    const result = diffEnvRecords({ A: '1' }, { A: '2' });
    expect(hasDiff(result)).toBe(true);
  });

  it('returns false when records are identical', () => {
    const result = diffEnvRecords({ A: '1' }, { A: '1' });
    expect(hasDiff(result)).toBe(false);
  });
});

describe('formatDiff', () => {
  it('formats a diff with all change types', () => {
    const result = diffEnvRecords(
      { OLD: 'x', CHANGED: 'old' },
      { NEW: 'y', CHANGED: 'new' }
    );
    const output = formatDiff(result);
    expect(output).toContain('+ NEW=y');
    expect(output).toContain('- OLD=x');
    expect(output).toContain('~ CHANGED');
  });

  it('returns no differences message for identical records', () => {
    const result = diffEnvRecords({ A: '1' }, { A: '1' });
    expect(formatDiff(result)).toBe('(no differences)');
  });
});
