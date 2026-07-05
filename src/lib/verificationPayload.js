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
  const encoded = btoa(unescape(encodeURIComponent(payloadText)));

  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
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

export { encodeVerificationPayload, decodeVerificationPayload };
