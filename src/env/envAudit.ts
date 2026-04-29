import { EnvRecord } from './envParser.types';
import { EnvAuditResult, EnvAuditIssue, AuditSeverity } from './envAudit.types';

const SENSITIVE_KEY_PATTERNS = [
  /secret/i,
  /password/i,
  /passwd/i,
  /token/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /auth/i,
  /credential/i,
];

const PLACEHOLDER_PATTERNS = [
  /^your[_-]/i,
  /^change[_-]?me$/i,
  /^todo$/i,
  /^fixme$/i,
  /^xxx+$/i,
  /^<.*>$/,
  /^\[.*\]$/,
];

export function auditEnvRecord(record: EnvRecord): EnvAuditResult {
  const issues: EnvAuditIssue[] = [];

  for (const [key, value] of Object.entries(record)) {
    if (value === '' || value === undefined) {
      issues.push({
        key,
        severity: 'warning',
        message: `Key "${key}" has an empty value.`,
      });
      continue;
    }

    const isSensitive = SENSITIVE_KEY_PATTERNS.some((p) => p.test(key));

    if (isSensitive) {
      const isPlaceholder = PLACEHOLDER_PATTERNS.some((p) => p.test(value));
      if (isPlaceholder) {
        issues.push({
          key,
          severity: 'error',
          message: `Sensitive key "${key}" appears to contain a placeholder value.`,
        });
      }

      if (value.length < 8) {
        issues.push({
          key,
          severity: 'warning',
          message: `Sensitive key "${key}" has a suspiciously short value (${value.length} chars).`,
        });
      }
    }

    if (/\s/.test(value) && !(value.startsWith('"') || value.startsWith("'"))) {
      issues.push({
        key,
        severity: 'info',
        message: `Key "${key}" contains whitespace but is not quoted.`,
      });
    }
  }

  return {
    issues,
    passed: issues.filter((i) => i.severity === 'error').length === 0,
    summary: {
      errors: issues.filter((i) => i.severity === 'error').length,
      warnings: issues.filter((i) => i.severity === 'warning').length,
      infos: issues.filter((i) => i.severity === 'info').length,
    },
  };
}

export function formatAuditResult(result: EnvAuditResult): string {
  if (result.issues.length === 0) {
    return '✅ Audit passed with no issues.';
  }

  const lines: string[] = [];
  const icons: Record<AuditSeverity, string> = {
    error: '❌',
    warning: '⚠️ ',
    info: 'ℹ️ ',
  };

  for (const issue of result.issues) {
    lines.push(`${icons[issue.severity]} [${issue.severity.toUpperCase()}] ${issue.message}`);
  }

  lines.push('');
  lines.push(
    `Summary: ${result.summary.errors} error(s), ${result.summary.warnings} warning(s), ${result.summary.infos} info(s).`
  );

  return lines.join('\n');
}
