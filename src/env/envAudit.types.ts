export type AuditSeverity = 'error' | 'warning' | 'info';

export interface EnvAuditIssue {
  key: string;
  severity: AuditSeverity;
  message: string;
}

export interface EnvAuditSummary {
  errors: number;
  warnings: number;
  infos: number;
}

export interface EnvAuditResult {
  issues: EnvAuditIssue[];
  passed: boolean;
  summary: EnvAuditSummary;
}
