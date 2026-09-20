import test from 'node:test';
import assert from 'node:assert/strict';

import { getCameraStatus, shouldAutoSubmitMalpractice, MAX_MALPRACTICE_WARNINGS } from './examSafety.js';

test('malpractice auto-submit triggers at the configured threshold', () => {
  assert.equal(shouldAutoSubmitMalpractice(9), false);
  assert.equal(shouldAutoSubmitMalpractice(10), true);
  assert.equal(shouldAutoSubmitMalpractice(12), true);
});

test('camera status reflects safety and warning states', () => {
  assert.equal(getCameraStatus({ warningCount: 0, hasWarning: false }), 'safe');
  assert.equal(getCameraStatus({ warningCount: 1, hasWarning: true }), 'warning');
  assert.equal(getCameraStatus({ warningCount: MAX_MALPRACTICE_WARNINGS, hasWarning: false }), 'warning');
});
