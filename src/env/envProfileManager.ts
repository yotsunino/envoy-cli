import * as fs from 'fs';
import * as path from 'path';
import { EnvRecord } from './envParser.types';
import { ProfileDiffResult, ProfileSwitchResult } from './envProfiles.types';
import { loadProfile, saveProfile, profileExists } from './envProfiles';
import { diffEnvRecords } from './envDiff';

export function compareProfiles(
  profileA: string,
  profileB: string,
  baseDir?: string
): ProfileDiffResult {
  const a = loadProfile(profileA, baseDir);
  const b = loadProfile(profileB, baseDir);

  const diff = diffEnvRecords(a.record, b.record);

  const onlyInA = diff.filter(d => d.type === 'removed').map(d => d.key);
  const onlyInB = diff.filter(d => d.type === 'added').map(d => d.key);
  const diffValues = diff
    .filter(d => d.type === 'changed')
    .map(d => ({ key: d.key, valueA: d.oldValue ?? '', valueB: d.newValue ?? '' }));

  return {
    profileA,
    profileB,
    onlyInA,
    onlyInB,
    diffValues,
    identical: diff.length === 0,
  };
}

export function switchProfile(
  profileName: string,
  targetEnvPath: string = path.join(process.cwd(), '.env'),
  baseDir?: string
): ProfileSwitchResult {
  if (!profileExists(profileName, baseDir)) {
    throw new Error(`Profile '${profileName}' does not exist.`);
  }

  const profile = loadProfile(profileName, baseDir);
  const lines = Object.entries(profile.record).map(([k, v]) => `${k}=${v}`);
  fs.writeFileSync(targetEnvPath, lines.join('\n') + '\n', 'utf-8');

  return {
    profile: profileName,
    written: targetEnvPath,
    keysApplied: Object.keys(profile.record).length,
  };
}

export function captureCurrentAsProfile(
  profileName: string,
  sourcePath: string = path.join(process.cwd(), '.env'),
  baseDir?: string
): void {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source env file not found: ${sourcePath}`);
  }

  const content = fs.readFileSync(sourcePath, 'utf-8');
  const record: EnvRecord = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    record[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }

  saveProfile(profileName, record, baseDir);
}
