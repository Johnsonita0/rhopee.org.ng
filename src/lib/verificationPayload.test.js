import test from 'node:test';
import assert from 'node:assert/strict';
import { buildScannableQrValue, parseScannableQrValue } from './verificationPayload.js';

test('buildScannableQrValue uses the member barcode for scanning', () => {
  const result = buildScannableQrValue({
    barcode: 'RHOPEE-MEM-AKS-123456',
    membershipId: 'RHOPEE-MEM-001',
    name: 'Johnson',
  });

  assert.equal(result, 'RHOPEE:RHOPEE-MEM-AKS-123456');
});

test('parseScannableQrValue extracts the scan value from our QR format', () => {
  const result = parseScannableQrValue('RHOPEE:RHOPEE-MEM-AKS-123456');

  assert.deepEqual(result, {
    source: 'qr',
    searchValue: 'RHOPEE-MEM-AKS-123456',
  });
});
