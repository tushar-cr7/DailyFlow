import { describe, expect, it } from 'vitest';
import { IPC_CHANNELS } from '../src/shared/constants/ipc';
import {
  isObject,
  isOptionalBoolean,
  validateSystemInfoRequest,
} from '../src/shared/utils/validation';

describe('IPC Channels', () => {
  it('has system:get-info channel defined', () => {
    expect(IPC_CHANNELS.SYSTEM.GET_INFO).toBe('system:get-info');
  });
});

describe('IPC Validation Utilities', () => {
  it('identifies valid objects', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ a: 1 })).toBe(true);
    expect(isObject(null)).toBe(false);
    expect(isObject([])).toBe(false);
    expect(isObject('string')).toBe(false);
  });

  it('validates optional boolean values', () => {
    expect(isOptionalBoolean(undefined)).toBe(true);
    expect(isOptionalBoolean(true)).toBe(true);
    expect(isOptionalBoolean(false)).toBe(true);
    expect(isOptionalBoolean('true')).toBe(false);
  });

  it('validates SystemInfoRequest payloads correctly', () => {
    expect(validateSystemInfoRequest(undefined).valid).toBe(true);
    expect(validateSystemInfoRequest(null).valid).toBe(true);
    expect(validateSystemInfoRequest({}).valid).toBe(true);
    expect(validateSystemInfoRequest({ includeEnv: true }).valid).toBe(true);
    expect(validateSystemInfoRequest({ includeEnv: false }).valid).toBe(true);

    const invalidType = validateSystemInfoRequest('not an object');
    expect(invalidType.valid).toBe(false);
    expect(invalidType.error).toContain('must be an object');

    const invalidProp = validateSystemInfoRequest({ includeEnv: 'invalid' });
    expect(invalidProp.valid).toBe(false);
    expect(invalidProp.error).toContain('must be a boolean');
  });
});
