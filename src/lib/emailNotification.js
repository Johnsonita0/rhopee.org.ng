export async function notifyApplicantRegistration(payload) {
  const response = await fetch('/api/registration-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorResponse = await response.json().catch(() => null);
    const message = errorResponse?.error || 'Unable to send registration email.';
    throw new Error(message);
  }

  return response.json();
}
