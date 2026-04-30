import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  profileExists,
  loadProfile,
  saveProfile,
  listProfiles,
  loadAllProfiles,
  getProfileDir,
} from '../envProfiles';

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envoy-profiles-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('envProfiles', () => {
  it('returns false when profile does not exist', () => {
    expect(profileExists('staging', tmpDir)).toBe(false);
  });

  it('saves and loads a profile', () => {
    const record = { API_URL: 'https://api.example.com', DEBUG: 'false' };
    saveProfile('staging', record, tmpDir);

    expect(profileExists('staging', tmpDir)).toBe(true);
    const profile = loadProfile('staging', tmpDir);
    expect(profile.name).toBe('staging');
    expect(profile.record).toEqual(record);
  });

  it('throws when loading non-existent profile', () => {
    expect(() => loadProfile('ghost', tmpDir)).toThrow("Profile 'ghost' not found");
  });

  it('lists all saved profiles', () => {
    saveProfile('local', { KEY: 'val1' }, tmpDir);
    saveProfile('production', { KEY: 'val2' }, tmpDir);

    const profiles = listProfiles(tmpDir);
    expect(profiles).toContain('local');
    expect(profiles).toContain('production');
    expect(profiles).toHaveLength(2);
  });

  it('returns empty array when profile dir missing', () => {
    expect(listProfiles(tmpDir)).toEqual([]);
  });

  it('loads all profiles into a map', () => {
    saveProfile('dev', { X: '1' }, tmpDir);
    saveProfile('prod', { X: '2' }, tmpDir);

    const map = loadAllProfiles(tmpDir);
    expect(map['dev'].record).toEqual({ X: '1' });
    expect(map['prod'].record).toEqual({ X: '2' });
  });

  it('getProfileDir returns correct path', () => {
    expect(getProfileDir('/some/dir')).toBe('/some/dir/.envoy');
  });

  it('overwrites an existing profile with new values', () => {
    saveProfile('staging', { API_URL: 'https://old.example.com' }, tmpDir);
    saveProfile('staging', { API_URL: 'https://new.example.com', DEBUG: 'true' }, tmpDir);

    const profile = loadProfile('staging', tmpDir);
    expect(profile.record).toEqual({ API_URL: 'https://new.example.com', DEBUG: 'true' });
  });
});
