import * as fs from 'fs';
import * as path from 'path';
import { EnvRecord } from './envParser.types';

export interface EnvSnapshot {
  timestamp: string;
  label?: string;
  env: EnvRecord;
}

const SNAPSHOT_DIR = '.envoy/snapshots';

export function getSnapshotDir(): string {
  return path.resolve(process.cwd(), SNAPSHOT_DIR);
}

export function saveSnapshot(env: EnvRecord, label?: string): EnvSnapshot {
  const snapshotDir = getSnapshotDir();
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }

  const timestamp = new Date().toISOString();
  const snapshot: EnvSnapshot = { timestamp, env, ...(label ? { label } : {}) };
  const filename = `${timestamp.replace(/[:.]/g, '-')}${label ? `-${label}` : ''}.json`;
  const filepath = path.join(snapshotDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2), 'utf-8');
  return snapshot;
}

export function listSnapshots(): EnvSnapshot[] {
  const snapshotDir = getSnapshotDir();
  if (!fs.existsSync(snapshotDir)) return [];

  return fs
    .readdirSync(snapshotDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(snapshotDir, f), 'utf-8');
      return JSON.parse(raw) as EnvSnapshot;
    })
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function loadSnapshot(timestamp: string): EnvSnapshot | null {
  const snapshots = listSnapshots();
  return snapshots.find((s) => s.timestamp === timestamp) ?? null;
}

export function deleteSnapshot(timestamp: string): boolean {
  const snapshotDir = getSnapshotDir();
  if (!fs.existsSync(snapshotDir)) return false;

  const files = fs.readdirSync(snapshotDir).filter((f) => f.startsWith(timestamp.replace(/[:.]/g, '-')));
  if (files.length === 0) return false;

  files.forEach((f) => fs.unlinkSync(path.join(snapshotDir, f)));
  return true;
}
