import * as fs from 'fs';
import * as path from 'path';
import { parseEnvFile } from './envParser';
import { EnvRecord } from './envParser.types';
import { EnvProfile, ProfileMap } from './envProfiles.types';

const PROFILE_DIR_NAME = '.envoy';

export function getProfileDir(baseDir: string = process.cwd()): string {
  return path.join(baseDir, PROFILE_DIR_NAME);
}

export function profileExists(profileName: string, baseDir?: string): boolean {
  const filePath = path.join(getProfileDir(baseDir), `${profileName}.env`);
  return fs.existsSync(filePath);
}

export function loadProfile(profileName: string, baseDir?: string): EnvProfile {
  const profileDir = getProfileDir(baseDir);
  const filePath = path.join(profileDir, `${profileName}.env`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Profile '${profileName}' not found at ${filePath}`);
  }

  const entries = parseEnvFile(filePath);
  const record: EnvRecord = {};
  for (const entry of entries) {
    record[entry.key] = entry.value;
  }

  return { name: profileName, record, filePath };
}

export function saveProfile(profileName: string, record: EnvRecord, baseDir?: string): void {
  const profileDir = getProfileDir(baseDir);
  if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
  }

  const filePath = path.join(profileDir, `${profileName}.env`);
  const lines = Object.entries(record).map(([k, v]) => `${k}=${v}`);
  fs.writeFileSync(filePath, lines.join('\n') + '\n', 'utf-8');
}

export function listProfiles(baseDir?: string): string[] {
  const profileDir = getProfileDir(baseDir);
  if (!fs.existsSync(profileDir)) return [];

  return fs.readdirSync(profileDir)
    .filter(f => f.endsWith('.env'))
    .map(f => f.replace(/\.env$/, ''));
}

export function loadAllProfiles(baseDir?: string): ProfileMap {
  const names = listProfiles(baseDir);
  const map: ProfileMap = {};
  for (const name of names) {
    map[name] = loadProfile(name, baseDir);
  }
  return map;
}
