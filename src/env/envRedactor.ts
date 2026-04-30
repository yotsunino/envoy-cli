import { EnvRecord } from './envParser.types';

export interface RedactOptions {
  placeholder?: string;
  sensitivePatterns?: RegExp[];
  sensitiveKeys?: string[];
}

const DEFAULT_SENSITIVE_PATTERNS: RegExp[] = [
  /secret/i,
  /password/i,
  /passwd/i,
  /token/i,
  /api_key/i,
  /apikey/i,
  /private/i,
  /credentials/i,
  /auth/i,
  /cert/i,
  /signing/i,
];

const DEFAULT_PLACEHOLDER = '***REDACTED***';

export function isSensitiveKey(
  key: string,
  patterns: RegExp[] = DEFAULT_SENSITIVE_PATTERNS,
  extraKeys: string[] = []
): boolean {
  const normalizedKey = key.trim();
  if (extraKeys.map(k => k.toUpperCase()).includes(normalizedKey.toUpperCase())) {
    return true;
  }
  return patterns.some(pattern => pattern.test(normalizedKey));
}

export function redactEnvRecord(
  record: EnvRecord,
  options: RedactOptions = {}
): EnvRecord {
  const {
    placeholder = DEFAULT_PLACEHOLDER,
    sensitivePatterns = DEFAULT_SENSITIVE_PATTERNS,
    sensitiveKeys = [],
  } = options;

  const redacted: EnvRecord = {};
  for (const [key, value] of Object.entries(record)) {
    redacted[key] = isSensitiveKey(key, sensitivePatterns, sensitiveKeys)
      ? placeholder
      : value;
  }
  return redacted;
}

export function redactEnvString(
  envString: string,
  options: RedactOptions = {}
): string {
  const lines = envString.split('\n');
  const {
    placeholder = DEFAULT_PLACEHOLDER,
    sensitivePatterns = DEFAULT_SENSITIVE_PATTERNS,
    sensitiveKeys = [],
  } = options;

  return lines
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return line;
      const eqIndex = line.indexOf('=');
      if (eqIndex === -1) return line;
      const key = line.substring(0, eqIndex).trim();
      if (isSensitiveKey(key, sensitivePatterns, sensitiveKeys)) {
        return `${key}=${placeholder}`;
      }
      return line;
    })
    .join('\n');
}
