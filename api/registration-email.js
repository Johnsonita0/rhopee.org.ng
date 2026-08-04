import fetch from 'node-fetch';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const NEWSLETTER_API_KEY = process.env.NEWSLETTER_API_KEY;
const NEWSLETTER_LIST_ID = process.env.NEWSLETTER_LIST_ID;

if (!SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY is not set. Email notifications will fail.');
}

if (!NEWSLETTER_API_KEY || !NEWSLETTER_LIST_ID) {
  console.warn('NEWSLETTER_API_KEY or NEWSLETTER_LIST_ID is not set. Newsletter signup will fail.');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { email, fullName, confirmationCode, trainingTrackName, newsletterOptIn } = req.body || {};

  if (!email || !fullName || !confirmationCode) {
    res.status(400).json({ error: 'Missing required email payload fields' });
    return;
  }

  try {
    const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email }],
            subject: 'Your RHOPEE training registration is confirmed',
          },
        ],
        from: {
          email: 'no-reply@rhopee.org.ng',
          name: 'RHOPEE Training Team',
        },
        content: [
          {
            type: 'text/html',
            value: `Hello ${fullName},<br/><br/>Your registration is confirmed for the ${trainingTrackName} training track. Your confirmation code is <strong>${confirmationCode}</strong>.<br/><br/>We will contact you with further details soon.<br/><br/>Thank you,<br/>RHOPEE Team`,
          },
        ],
      }),
    });

    if (!sendgridResponse.ok) {
      const errorBody = await sendgridResponse.text();
      throw new Error(`SendGrid failed: ${errorBody}`);
    }

    if (newsletterOptIn && NEWSLETTER_API_KEY && NEWSLETTER_LIST_ID) {
      await fetch(`https://api.mailerlite.com/api/v2/groups/${NEWSLETTER_LIST_ID}/subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${NEWSLETTER_API_KEY}`,
        },
        body: JSON.stringify({
          email,
          name: fullName,
          resubscribe: true,
        }),
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Registration email error:', error);
    res.status(500).json({ error: error.message || 'Failed to send registration email' });
  }
}
