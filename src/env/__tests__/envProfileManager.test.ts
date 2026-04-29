import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { compareProfiles, switchProfile, captureCurrentAsProfile } from '../envProfileManager';
import { saveProfile } from '../envProfiles';

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envoy-pm-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('compareProfiles', () => {
  it('returns identical=true for matching profiles', () => {
    const record = { API: 'http://x.com', PORT: '3000' };
    saveProfile('a', record, tmpDir);
    saveProfile('b', record, tmpDir);

    const result = compareProfiles('a', 'b', tmpDir);
    expect(result.identical).toBe(true);
    expect(result.onlyInA).toHaveLength(0);
    expect(result.onlyInB).toHaveLength(0);
    expect(result.diffValues).toHaveLength(0);
  });

  it('detects keys only in A', () => {
    saveProfile('a', { KEY_A: 'val', SHARED: 'x' }, tmpDir);
    saveProfile('b', { SHARED: 'x' }, tmpDir);

    const result = compareProfiles('a', 'b', tmpDir);
    expect(result.onlyInA).toContain('KEY_A');
    expect(result.identical).toBe(false);
  });

  it('detects differing values', () => {
    saveProfile('a', { URL: 'http://local' }, tmpDir);
    saveProfile('b', { URL: 'http://prod' }, tmpDir);

    const result = compareProfiles('a', 'b', tmpDir);
    expect(result.diffValues).toHaveLength(1);
    expect(result.diffValues[0].key).toBe('URL');
  });
});

describe('switchProfile', () => {
  it('writes profile to target env file', () => {
    const record = { DB_HOST: 'localhost', PORT: '5432' };
    saveProfile('local', record, tmpDir);

    const targetPath = path.join(tmpDir, '.env');
    const result = switchProfile('local', targetPath, tmpDir);

    expect(result.keysApplied).toBe(2);
    expect(result.written).toBe(targetPath);
    const written = fs.readFileSync(targetPath, 'utf-8');
    expect(written).toContain('DB_HOST=localhost');
    expect(written).toContain('PORT=5432');
  });

  it('throws if profile does not exist', () => {
    const targetPath = path.join(tmpDir, '.env');
    expect(() => switchProfile('nonexistent', targetPath, tmpDir)).toThrow();
  });
});

describe('captureCurrentAsProfile', () => {
  it('captures current .env as a named profile', () => {
    const envPath = path.join(tmpDir, '.env');
    fs.writeFileSync(envPath, 'APP_ENV=test\nSECRET=abc\n', 'utf-8');

    captureCurrentAsProfile('snapshot', envPath, tmpDir);

    const profile = require('../envProfiles').loadProfile('snapshot', tmpDir);
    expect(profile.record['APP_ENV']).toBe('test');
    expect(profile.record['SECRET']).toBe('abc');
  });

  it('throws if source env file does not exist', () => {
    expect(() =>
      captureCurrentAsProfile('fail', path.join(tmpDir, 'missing.env'), tmpDir)
    ).toThrow('Source env file not found');
  });
});
