export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isOptionalBoolean(value: unknown): value is boolean | undefined {
  return value === undefined || typeof value === 'boolean';
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateSystemInfoRequest(input: unknown): ValidationResult {
  if (input !== undefined && input !== null) {
    if (!isObject(input)) {
      return { valid: false, error: 'Request payload must be an object or undefined' };
    }
    if ('includeEnv' in input && !isOptionalBoolean(input.includeEnv)) {
      return { valid: false, error: 'Property includeEnv must be a boolean if provided' };
    }
  }
  return { valid: true };
}
