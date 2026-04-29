import { EnvRecord } from './envParser.types';

export interface EnvProfile {
  name: string;
  record: EnvRecord;
  filePath: string;
}

export type ProfileMap = Record<string, EnvProfile>;

export interface ProfileDiffResult {
  profileA: string;
  profileB: string;
  onlyInA: string[];
  onlyInB: string[];
  diffValues: Array<{ key: string; valueA: string; valueB: string }>;
  identical: boolean;
}

export interface ProfileSwitchResult {
  profile: string;
  written: string;
  keysApplied: number;
}
