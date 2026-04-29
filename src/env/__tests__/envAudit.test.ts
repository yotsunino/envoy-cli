import { auditEnvRecord, formatAuditResult } from '../envAudit';
import { EnvRecord } from '../envParser.types';

describe('auditEnvRecord', () => {
  it('returns passed=true and no issues for a clean record', () => {
    const record: EnvRecord = {
      APP_NAME: 'my-app',
      PORT: '3000',
      DATABASE_URL: 'postgres://localhost:5432/mydb',
    };
    const result = auditEnvRecord(record);
    expect(result.passed).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('flags empty values as warnings', () => {
    const record: EnvRecord = { API_URL: '' };
    const result = auditEnvRecord(record);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].severity).toBe('warning');
    expect(result.issues[0].key).toBe('API_URL');
  });

  it('flags sensitive keys with placeholder values as errors', () => {
    const record: EnvRecord = { API_KEY: '<your-api-key>' };
    const result = auditEnvRecord(record);
    const errors = result.issues.filter((i) => i.severity === 'error');
    expect(errors).toHaveLength(1);
    expect(result.passed).toBe(false);
  });

  it('flags sensitive keys with short values as warnings', () => {
    const record: EnvRecord = { SECRET: 'abc' };
    const result = auditEnvRecord(record);
    const warnings = result.issues.filter((i) => i.severity === 'warning');
    expect(warnings.length).toBeGreaterThanOrEqual(1);
  });

  it('flags unquoted values with whitespace as info', () => {
    const record: EnvRecord = { APP_TITLE: 'My Cool App' };
    const result = auditEnvRecord(record);
    const infos = result.issues.filter((i) => i.severity === 'info');
    expect(infos).toHaveLength(1);
  });

  it('does not flag quoted values with whitespace', () => {
    const record: EnvRecord = { APP_TITLE: '"My Cool App"' };
    const result = auditEnvRecord(record);
    const infos = result.issues.filter((i) => i.severity === 'info');
    expect(infos).toHaveLength(0);
  });

  it('returns correct summary counts', () => {
    const record: EnvRecord = {
      API_KEY: '[placeholder]',
      SECRET: 'abc',
      EMPTY_VAL: '',
    };
    const result = auditEnvRecord(record);
    expect(result.summary.errors).toBeGreaterThanOrEqual(1);
    expect(result.summary.warnings).toBeGreaterThanOrEqual(1);
  });
});

describe('formatAuditResult', () => {
  it('returns success message when no issues', () => {
    const result = auditEnvRecord({ PORT: '3000' });
    const output = formatAuditResult(result);
    expect(output).toContain('✅');
  });

  it('includes summary line when issues exist', () => {
    const result = auditEnvRecord({ SECRET_TOKEN: 'xxx' });
    const output = formatAuditResult(result);
    expect(output).toContain('Summary:');
  });
});
