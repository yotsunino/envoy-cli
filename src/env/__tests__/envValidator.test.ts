import { validateEnvRecord, validateRequiredKeys } from '../envValidator';
import { ValidationRule } from '../envValidator.types';

describe('validateEnvRecord', () => {
  const baseRecord = {
    DATABASE_URL: 'postgres://localhost:5432/db',
    NODE_ENV: 'production',
    SECRET_KEY: 'supersecret',
  };

  it('passes when all rules are satisfied', () => {
    const rules: ValidationRule[] = [
      { key: 'DATABASE_URL', required: true },
      { key: 'NODE_ENV', required: true, allowedValues: ['development', 'production', 'test'] },
    ];
    const result = validateEnvRecord(baseRecord, rules);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('reports error for missing required key', () => {
    const rules: ValidationRule[] = [{ key: 'MISSING_KEY', required: true }];
    const result = validateEnvRecord(baseRecord, rules);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('MISSING_KEY');
  });

  it('reports error when value does not match pattern', () => {
    const rules: ValidationRule[] = [
      { key: 'DATABASE_URL', pattern: /^mysql:\/\// },
    ];
    const result = validateEnvRecord(baseRecord, rules);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('pattern');
  });

  it('reports error when value is too short', () => {
    const rules: ValidationRule[] = [{ key: 'NODE_ENV', minLength: 20 }];
    const result = validateEnvRecord(baseRecord, rules);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('too short');
  });

  it('reports warning for empty value when warnIfEmpty is set', () => {
    const record = { ...baseRecord, OPTIONAL_KEY: '' };
    const rules: ValidationRule[] = [{ key: 'OPTIONAL_KEY', warnIfEmpty: true }];
    const result = validateEnvRecord(record, rules);
    expect(result.valid).toBe(true);
    expect(result.warnings[0]).toContain('OPTIONAL_KEY');
  });

  it('reports error for disallowed value', () => {
    const rules: ValidationRule[] = [
      { key: 'NODE_ENV', allowedValues: ['development', 'test'] },
    ];
    const result = validateEnvRecord(baseRecord, rules);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('production');
  });
});

describe('validateRequiredKeys', () => {
  it('passes when all required keys exist', () => {
    const record = { A: '1', B: '2' };
    const result = validateRequiredKeys(record, ['A', 'B']);
    expect(result.valid).toBe(true);
  });

  it('fails when a required key is absent', () => {
    const record = { A: '1' };
    const result = validateRequiredKeys(record, ['A', 'B']);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('"B"');
  });
});
