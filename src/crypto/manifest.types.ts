export interface ManifestEntry {
  key: string;
  description?: string;
  required: boolean;
  environments: EnvironmentName[];
}

export type EnvironmentName = 'local' | 'staging' | 'production' | string;

export interface Manifest {
  version: string;
  entries: ManifestEntry[];
  checksum: string;
}

export interface EncryptedManifestFile {
  /** Base64-encoded, AES-256-GCM encrypted JSON of Manifest */
  data: string;
  /** ISO timestamp of last update */
  updatedAt: string;
}
