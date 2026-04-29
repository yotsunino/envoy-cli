import { EnvRecord, ValidationResult, ValidationRule } from './envValidator.types';

export function validateEnvRecord(
  record: EnvRecord,
  rules: ValidationRule[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const rule of rules) {
    const value = record[rule.key];

    if (rule.required && (value === undefined || value === '')) {
      errors.push(`Missing required key: "${rule.key}"`);
      continue;
    }

    if (value === undefined) continue;

    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push(
        `Key "${rule.key}" does not match expected pattern: ${rule.pattern.toString()}`
      );
    }

    if (rule.minLength !== undefined && value.length < rule.minLength) {
      errors.push(
        `Key "${rule.key}" is too short (min ${rule.minLength} chars, got ${value.length})`
      );
    }

    if (rule.warnIfEmpty && value === '') {
      warnings.push(`Key "${rule.key}" is present but empty`);
    }

    if (rule.allowedValues && !rule.allowedValues.includes(value)) {
      errors.push(
        `Key "${rule.key}" has invalid value "${value}". Allowed: ${rule.allowedValues.join(', ')}`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateRequiredKeys(
  record: EnvRecord,
  requiredKeys: string[]
): ValidationResult {
  const rules: ValidationRule[] = requiredKeys.map((key) => ({
    key,
    required: true,
  }));
  return validateEnvRecord(record, rules);
}
