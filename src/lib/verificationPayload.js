import { compressToBase64, decompressFromBase64 } from 'lz-string';

const SCANNABLE_QR_PREFIX = 'RHOPEE';

const buildScannableQrValue = (memberData) => {
  const searchValue = memberData?.barcode || memberData?.membershipId || memberData?.membership_id || memberData?.id || '';
  const trimmedValue = String(searchValue || '').trim();

  if (!trimmedValue) {
    return '';
  }

  return `${SCANNABLE_QR_PREFIX}:${trimmedValue}`;
};

const parseScannableQrValue = (value) => {
  const trimmedValue = String(value || '').trim();
  if (!trimmedValue.startsWith(`${SCANNABLE_QR_PREFIX}:`)) {
    return null;
  }

  return {
    source: 'qr',
    searchValue: trimmedValue.slice(SCANNABLE_QR_PREFIX.length + 1).trim(),
  };
};

// Compress the compact payload using lz-string to produce much shorter tokens for QR codes.
const encodeVerificationPayload = (memberData) => {
  const compactPayload = {
    n: memberData?.name || '',
    t: memberData?.tag || '',
    m: memberData?.membershipId || memberData?.membership_id || '',
    c: memberData?.chapter || '',
    i: memberData?.issuedAt || memberData?.issued_at || '',
    e: memberData?.expiresAt || memberData?.expires_at || '',
    s: memberData?.status || 'verified',
    o: memberData?.outcome || 'verified',
    r: memberData?.reason || '',
  };

  const payloadText = JSON.stringify(compactPayload);

  try {
    const compressed = compressToBase64(payloadText);
    // make URL-safe
    const compactEncoded = compressed.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    return encodeURIComponent(compactEncoded);
  } catch (err) {
    // Fallback to previous base64 method if compression fails
    const encoded = btoa(unescape(encodeURIComponent(payloadText)));
    const compactEncoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    return encodeURIComponent(compactEncoded);
  }
};

const decodeVerificationPayload = (value) => {
  if (!value) return null;

  try {
    if (value.startsWith('{')) {
      const parsed = JSON.parse(decodeURIComponent(value));
      return {
        name: parsed.name,
        tag: parsed.tag,
        membershipId: parsed.membershipId || parsed.membership_id,
        chapter: parsed.chapter,
        issuedAt: parsed.issuedAt || parsed.issued_at,
        expiresAt: parsed.expiresAt || parsed.expires_at,
        status: parsed.status,
      };
    }
  } catch (error) {
    // Fall through to the compact payload decoder.
  }

  // Try decompression first (new compressed format)
  try {
    const normalized = decodeURIComponent(value).replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const decompressed = decompressFromBase64(padded);

    if (decompressed) {
      const parsed = JSON.parse(decompressed);
      return {
        name: parsed.n,
        tag: parsed.t,
        membershipId: parsed.m,
        chapter: parsed.c,
        issuedAt: parsed.i,
        expiresAt: parsed.e,
        status: parsed.s,
        outcome: parsed.o,
        reason: parsed.r,
      };
    }
  } catch (err) {
    // ignore and fallback
  }

  // Fallback: previous compact base64 URL-safe decoder
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const decodedText = decodeURIComponent(escape(atob(padded)));
    const parsed = JSON.parse(decodedText);

    return {
      name: parsed.n,
      tag: parsed.t,
      membershipId: parsed.m,
      chapter: parsed.c,
      issuedAt: parsed.i,
      expiresAt: parsed.e,
      status: parsed.s,
      outcome: parsed.o,
      reason: parsed.r,
    };
  } catch (error) {
    return null;
  }
};

export { buildScannableQrValue, parseScannableQrValue, encodeVerificationPayload, decodeVerificationPayload };
