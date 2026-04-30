import {
  isSensitiveKey,
  redactEnvRecord,
  redactEnvString,
} from '../envRedactor';

describe('isSensitiveKey', () => {
  it('detects keys matching default sensitive patterns', () => {
    expect(isSensitiveKey('DB_PASSWORD')).toBe(true);
    expect(isSensitiveKey('API_KEY')).toBe(true);
    expect(isSensitiveKey('AUTH_TOKEN')).toBe(true);
    expect(isSensitiveKey('PRIVATE_KEY')).toBe(true);
    expect(isSensitiveKey('JWT_SECRET')).toBe(true);
  });

  it('returns false for non-sensitive keys', () => {
    expect(isSensitiveKey('APP_NAME')).toBe(false);
    expect(isSensitiveKey('PORT')).toBe(false);
    expect(isSensitiveKey('NODE_ENV')).toBe(false);
  });

  it('detects keys in extraKeys list (case-insensitive)', () => {
    expect(isSensitiveKey('MY_CUSTOM_VAR', [], ['my_custom_var'])).toBe(true);
    expect(isSensitiveKey('MY_CUSTOM_VAR', [], ['MY_CUSTOM_VAR'])).toBe(true);
  });

  it('uses custom patterns when provided', () => {
    expect(isSensitiveKey('STRIPE_KEY', [/stripe/i], [])).toBe(true);
    expect(isSensitiveKey('API_KEY', [/stripe/i], [])).toBe(false);
  });
});

describe('redactEnvRecord', () => {
  const record = {
    APP_NAME: 'my-app',
    DB_PASSWORD: 'supersecret',
    API_KEY: 'abc123',
    PORT: '3000',
  };

  it('redacts sensitive keys with default placeholder', () => {
    const result = redactEnvRecord(record);
    expect(result.APP_NAME).toBe('my-app');
    expect(result.PORT).toBe('3000');
    expect(result.DB_PASSWORD).toBe('***REDACTED***');
    expect(result.API_KEY).toBe('***REDACTED***');
  });

  it('uses custom placeholder', () => {
    const result = redactEnvRecord(record, { placeholder: '[HIDDEN]' });
    expect(result.DB_PASSWORD).toBe('[HIDDEN]');
  });

  it('redacts extra specified keys', () => {
    const result = redactEnvRecord(record, { sensitiveKeys: ['PORT'] });
    expect(result.PORT).toBe('***REDACTED***');
  });

  it('does not mutate the original record', () => {
    redactEnvRecord(record);
    expect(record.DB_PASSWORD).toBe('supersecret');
  });
});

describe('redactEnvString', () => {
  const envString = [
    '# App config',
    'APP_NAME=my-app',
    'DB_PASSWORD=supersecret',
    'API_KEY=abc123',
    'PORT=3000',
  ].join('\n');

  it('redacts sensitive lines in env string', () => {
    const result = redactEnvString(envString);
    expect(result).toContain('APP_NAME=my-app');
    expect(result).toContain('PORT=3000');
    expect(result).toContain('DB_PASSWORD=***REDACTED***');
    expect(result).toContain('API_KEY=***REDACTED***');
  });

  it('preserves comments and blank lines', () => {
    const result = redactEnvString(envString);
    expect(result).toContain('# App config');
  });

  it('uses custom placeholder in string output', () => {
    const result = redactEnvString(envString, { placeholder: 'XXXXX' });
    expect(result).toContain('DB_PASSWORD=XXXXX');
  });
});
