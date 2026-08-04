import test from 'node:test';
import assert from 'node:assert/strict';
import { generateConfirmationCode, formatConfirmationCode } from './confirmationCodeGenerator.js';

test('generateConfirmationCode uses the RHO-######-XXXXXX-## format', () => {
  const code = generateConfirmationCode();
  assert.match(code, /^RHO-\d{6}-[A-Z0-9]{6}-\d{2}$/);
});

test('formatConfirmationCode normalizes codes to the standard format', () => {
  assert.equal(formatConfirmationCode('rho-123456-abc123-7'), 'RHO-123456-ABC123-07');
});
