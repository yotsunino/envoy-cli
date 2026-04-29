import * as fs from 'fs';
import * as path from 'path';
import {
  saveSnapshot,
  listSnapshots,
  loadSnapshot,
  deleteSnapshot,
  getSnapshotDir,
} from '../envSnapshot';

const MOCK_ENV = { API_KEY: 'abc123', NODE_ENV: 'test' };
const snapshotDir = path.resolve(process.cwd(), '.envoy/snapshots');

afterEach(() => {
  if (fs.existsSync(snapshotDir)) {
    fs.readdirSync(snapshotDir).forEach((f) => fs.unlinkSync(path.join(snapshotDir, f)));
    fs.rmdirSync(snapshotDir, { recursive: true });
  }
});

describe('envSnapshot', () => {
  it('getSnapshotDir returns correct path', () => {
    expect(getSnapshotDir()).toBe(snapshotDir);
  });

  it('saveSnapshot creates a snapshot file and returns snapshot object', () => {
    const snapshot = saveSnapshot(MOCK_ENV, 'before-deploy');
    expect(snapshot.env).toEqual(MOCK_ENV);
    expect(snapshot.label).toBe('before-deploy');
    expect(snapshot.timestamp).toBeDefined();
    expect(fs.existsSync(snapshotDir)).toBe(true);
  });

  it('saveSnapshot works without a label', () => {
    const snapshot = saveSnapshot(MOCK_ENV);
    expect(snapshot.label).toBeUndefined();
    expect(snapshot.env).toEqual(MOCK_ENV);
  });

  it('listSnapshots returns all saved snapshots sorted by timestamp', () => {
    saveSnapshot(MOCK_ENV, 'first');
    saveSnapshot({ ...MOCK_ENV, EXTRA: 'value' }, 'second');
    const snapshots = listSnapshots();
    expect(snapshots).toHaveLength(2);
    expect(snapshots[0].timestamp <= snapshots[1].timestamp).toBe(true);
  });

  it('listSnapshots returns empty array when no snapshots exist', () => {
    expect(listSnapshots()).toEqual([]);
  });

  it('loadSnapshot returns the correct snapshot by timestamp', () => {
    const saved = saveSnapshot(MOCK_ENV, 'load-test');
    const loaded = loadSnapshot(saved.timestamp);
    expect(loaded).not.toBeNull();
    expect(loaded?.env).toEqual(MOCK_ENV);
    expect(loaded?.label).toBe('load-test');
  });

  it('loadSnapshot returns null for unknown timestamp', () => {
    expect(loadSnapshot('1970-01-01T00:00:00.000Z')).toBeNull();
  });

  it('deleteSnapshot removes the snapshot and returns true', () => {
    const saved = saveSnapshot(MOCK_ENV);
    const result = deleteSnapshot(saved.timestamp);
    expect(result).toBe(true);
    expect(loadSnapshot(saved.timestamp)).toBeNull();
  });

  it('deleteSnapshot returns false if snapshot does not exist', () => {
    expect(deleteSnapshot('1970-01-01T00:00:00.000Z')).toBe(false);
  });
});
