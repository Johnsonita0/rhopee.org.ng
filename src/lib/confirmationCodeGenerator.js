function createSegment(length, source) {
  return source.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, length).padEnd(length, '0');
}

export function generateConfirmationCode() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const checksum = ((Date.now() + random.charCodeAt(0)) % 100)
    .toString()
    .padStart(2, '0');

  return `RHO-${timestamp}-${createSegment(6, random)}-${checksum}`;
}

export function formatConfirmationCode(code) {
  const normalized = String(code || '').trim().toUpperCase();
  const parts = normalized.split('-');

  if (parts.length !== 4 || parts[0] !== 'RHO') {
    return normalized;
  }

  const [, timestamp, random, checksum] = parts;
  return `RHO-${timestamp.slice(0, 6)}-${createSegment(6, random)}-${checksum.slice(0, 2).padStart(2, '0')}`;
}
