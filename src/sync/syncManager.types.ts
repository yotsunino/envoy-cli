import type { EnvDiff } from '../env/envParser.types';

export type Environment = 'local' | 'staging' | 'production' | string;

export interface SyncOptions {
  /** Force write even if no diff detected */
  force?: boolean;
  /** Print diff to stdout */
  verbose?: boolean;
}

export interface SyncResult {
  success: boolean;
  changed: boolean;
  environment: Environment;
  diff: EnvDiff;
}

export interface ManifestData {
  [environment: string]: string; // encrypted env blob per environment
}
