export type EnvRecord = Record<string, string>;

export interface ValidationRule {
  /** The environment variable key to validate */
  key: string;
  /** Whether the key must be present and non-empty */
  required?: boolean;
  /** Regex pattern the value must match */
  pattern?: RegExp;
  /** Minimum character length for the value */
  minLength?: number;
  /** Emit a warning if the value is an empty string */
  warnIfEmpty?: boolean;
  /** Restrict value to one of these strings */
  allowedValues?: string[];
}

export interface ValidationResult {
  /** True when there are no errors */
  valid: boolean;
  /** Hard failures that block usage */
  errors: string[];
  /** Non-blocking advisories */
  warnings: string[];
}
