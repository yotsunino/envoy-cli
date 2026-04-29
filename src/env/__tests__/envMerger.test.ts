import { mergeEnvRecords, envRecordToString } from '../envMerger';
import { EnvRecord } from '../envParser.types';

describe('mergeEnvRecords', () => {
  const local: EnvRecord = {
    APP_NAME: 'my-app',
    DB_HOST: 'localhost',
    LOCAL_ONLY: 'yes',
  };

  const remote: EnvRecord = {
    APP_NAME: 'my-app',
    DB_HOST: 'prod.db.host',
    REMOTE_ONLY: 'true',
  };

  it('detects conflicts, added and removed keys', () => {
    const result = mergeEnvRecords(local, remote, 'local-wins');
    expect(result.conflicts).toContain('DB_HOST');
    expect(result.added).toContain('REMOTE_ONLY');
    expect(result.removed).toContain('LOCAL_ONLY');
  });

  it('local-wins keeps local value on conflict', () => {
    const result = mergeEnvRecords(local, remote, 'local-wins');
    expect(result.merged.DB_HOST).toBe('localhost');
  });

  it('remote-wins keeps remote value on conflict', () => {
    const result = mergeEnvRecords(local, remote, 'remote-wins');
    expect(result.merged.DB_HOST).toBe('prod.db.host');
  });

  it('prompt strategy falls back to local value', () => {
    const result = mergeEnvRecords(local, remote, 'prompt');
    expect(result.merged.DB_HOST).toBe('localhost');
  });

  it('includes non-conflicting identical keys without marking them', () => {
    const result = mergeEnvRecords(local, remote, 'local-wins');
    expect(result.merged.APP_NAME).toBe('my-app');
    expect(result.conflicts).not.toContain('APP_NAME');
  });

  it('handles empty local record', () => {
    const result = mergeEnvRecords({}, remote, 'remote-wins');
    expect(result.merged).toEqual(remote);
    expect(result.added).toEqual(expect.arrayContaining(Object.keys(remote)));
    expect(result.conflicts).toHaveLength(0);
  });

  it('handles empty remote record', () => {
    const result = mergeEnvRecords(local, {}, 'local-wins');
    expect(result.merged).toEqual(local);
    expect(result.removed).toEqual(expect.arrayContaining(Object.keys(local)));
  });
});

describe('envRecordToString', () => {
  it('serialises a simple record', () => {
    const record: EnvRecord = { FOO: 'bar', BAZ: 'qux' };
    const output = envRecordToString(record);
    expect(output).toContain('FOO=bar');
    expect(output).toContain('BAZ=qux');
  });

  it('quotes values that contain spaces', () => {
    const record: EnvRecord = { GREETING: 'hello world' };
    const output = envRecordToString(record);
    expect(output).toBe('GREETING="hello world"');
  });

  it('quotes values that contain hash characters', () => {
    const record: EnvRecord = { COLOR: '#ff0000' };
    const output = envRecordToString(record);
    expect(output).toBe('COLOR="#ff0000"');
  });
});
