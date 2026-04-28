import * as fs from 'fs';
import * as path from 'path';
import { encrypt, decrypt } from './manifest';
import type { Manifest, EncryptedManifestFile } from './manifest.types';

const DEFAULT_PATH = '.envoy-manifest.enc';

export function saveManifest(
  manifest: Manifest,
  passphrase: string,
  filePath: string = DEFAULT_PATH
): void {
  const json = JSON.stringify(manifest, null, 2);
  const data = encrypt(json, passphrase);
  const file: EncryptedManifestFile = {
    data,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.resolve(filePath), JSON.stringify(file, null, 2), 'utf8');
}

export function loadManifest(
  passphrase: string,
  filePath: string = DEFAULT_PATH
): Manifest {
  const raw = fs.readFileSync(path.resolve(filePath), 'utf8');
  const file: EncryptedManifestFile = JSON.parse(raw);
  const json = decrypt(file.data, passphrase);
  return JSON.parse(json) as Manifest;
}

export function manifestExists(filePath: string = DEFAULT_PATH): boolean {
  return fs.existsSync(path.resolve(filePath));
}
