import { loadManifest, saveManifest, manifestExists } from '../crypto/manifestStore';
import { parseEnvFile, envEntriesToRecord } from '../env/envParser';
import { diffEnvRecords, hasDiff, formatDiff } from '../env/envDiff';
import { encrypt, decrypt } from '../crypto/manifest';
import type { SyncOptions, SyncResult, Environment } from './syncManager.types';
import * as fs from 'fs';

export async function pushEnv(
  envFilePath: string,
  environment: Environment,
  passphrase: string,
  options: SyncOptions = {}
): Promise<SyncResult> {
  const entries = parseEnvFile(envFilePath);
  const record = envEntriesToRecord(entries);
  const serialized = JSON.stringify(record);
  const encrypted = await encrypt(serialized, passphrase);

  const manifest = manifestExists() ? await loadManifest(passphrase) : {};
  const previous = manifest[environment] ? JSON.parse(await decrypt(manifest[environment], passphrase)) : {};

  const diff = diffEnvRecords(previous, record);

  if (!hasDiff(diff) && !options.force) {
    return { success: true, changed: false, environment, diff };
  }

  manifest[environment] = encrypted;
  await saveManifest(manifest, passphrase);

  if (options.verbose) {
    console.log(formatDiff(diff));
  }

  return { success: true, changed: true, environment, diff };
}

export async function pullEnv(
  envFilePath: string,
  environment: Environment,
  passphrase: string,
  options: SyncOptions = {}
): Promise<SyncResult> {
  if (!manifestExists()) {
    throw new Error('No manifest found. Run push first.');
  }

  const manifest = await loadManifest(passphrase);

  if (!manifest[environment]) {
    throw new Error(`No entry found for environment: ${environment}`);
  }

  const decrypted = await decrypt(manifest[environment], passphrase);
  const record = JSON.parse(decrypted) as Record<string, string>;

  const existing: Record<string, string> = fs.existsSync(envFilePath)
    ? envEntriesToRecord(parseEnvFile(envFilePath))
    : {};

  const diff = diffEnvRecords(existing, record);

  if (!hasDiff(diff) && !options.force) {
    return { success: true, changed: false, environment, diff };
  }

  const lines = Object.entries(record).map(([k, v]) => `${k}=${v}`);
  fs.writeFileSync(envFilePath, lines.join('\n') + '\n', 'utf-8');

  if (options.verbose) {
    console.log(formatDiff(diff));
  }

  return { success: true, changed: true, environment, diff };
}
