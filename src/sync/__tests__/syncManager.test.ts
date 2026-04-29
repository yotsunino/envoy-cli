import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { pushEnv, pullEnv } from '../syncManager';
import * as manifestStore from '../../crypto/manifestStore';

const PASSPHRASE = 'test-secret-passphrase';
const ENV_CONTENT = 'API_KEY=abc123\nDB_HOST=localhost\nDEBUG=true\n';

let tmpDir: string;
let envFile: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envoy-test-'));
  envFile = path.join(tmpDir, '.env');
  fs.writeFileSync(envFile, ENV_CONTENT, 'utf-8');

  jest.spyOn(manifestStore, 'manifestExists').mockReturnValue(false);
  jest.spyOn(manifestStore, 'loadManifest').mockResolvedValue({});
  jest.spyOn(manifestStore, 'saveManifest').mockResolvedValue(undefined);
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  jest.restoreAllMocks();
});

describe('pushEnv', () => {
  it('should push env and report changed=true on first push', async () => {
    const result = await pushEnv(envFile, 'staging', PASSPHRASE);
    expect(result.success).toBe(true);
    expect(result.changed).toBe(true);
    expect(result.environment).toBe('staging');
    expect(manifestStore.saveManifest).toHaveBeenCalled();
  });

  it('should report changed=false when no diff and force is not set', async () => {
    // First push
    let capturedManifest: Record<string, string> = {};
    (manifestStore.saveManifest as jest.Mock).mockImplementation(async (m) => { capturedManifest = m; });
    (manifestStore.manifestExists as jest.Mock).mockReturnValue(false);
    await pushEnv(envFile, 'staging', PASSPHRASE);

    // Second push with same file
    (manifestStore.manifestExists as jest.Mock).mockReturnValue(true);
    (manifestStore.loadManifest as jest.Mock).mockResolvedValue(capturedManifest);

    const result = await pushEnv(envFile, 'staging', PASSPHRASE);
    expect(result.changed).toBe(false);
  });
});

describe('pullEnv', () => {
  it('should throw if no manifest exists', async () => {
    (manifestStore.manifestExists as jest.Mock).mockReturnValue(false);
    await expect(pullEnv(envFile, 'staging', PASSPHRASE)).rejects.toThrow('No manifest found');
  });

  it('should throw if environment not in manifest', async () => {
    (manifestStore.manifestExists as jest.Mock).mockReturnValue(true);
    (manifestStore.loadManifest as jest.Mock).mockResolvedValue({});
    await expect(pullEnv(envFile, 'production', PASSPHRASE)).rejects.toThrow('No entry found');
  });

  it('should write env file from manifest on pull', async () => {
    let capturedManifest: Record<string, string> = {};
    (manifestStore.saveManifest as jest.Mock).mockImplementation(async (m) => { capturedManifest = m; });
    (manifestStore.manifestExists as jest.Mock).mockReturnValue(false);
    await pushEnv(envFile, 'staging', PASSPHRASE);

    const pullTarget = path.join(tmpDir, '.env.pulled');
    (manifestStore.manifestExists as jest.Mock).mockReturnValue(true);
    (manifestStore.loadManifest as jest.Mock).mockResolvedValue(capturedManifest);

    const result = await pullEnv(pullTarget, 'staging', PASSPHRASE);
    expect(result.success).toBe(true);
    expect(result.changed).toBe(true);
    expect(fs.existsSync(pullTarget)).toBe(true);
    const written = fs.readFileSync(pullTarget, 'utf-8');
    expect(written).toContain('API_KEY=abc123');
  });
});
