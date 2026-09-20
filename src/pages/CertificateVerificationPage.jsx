import { useEffect, useState } from 'react';
import { getPublicCbtExamResult } from '../lib/supabaseClient.js';
import '../css/pages/CertificateVerificationPage.css';

function CertificateVerificationPage() {
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setStatus('invalid');
      return;
    }
    getPublicCbtExamResult(token).then(({ data, error }) => {
      if (error || !data || !data.certificate_published) {
        setStatus('invalid');
      } else {
        setResult(data);
        setStatus('verified');
      }
    });
  }, []);

  return (
    <main className="certificate-verification-page">
      <section className="certificate-verification-card">
        <header className="verification-header"><p className="verification-mark">RHOPEE / NEF</p><span>Official Certificate Verification</span></header>
        {status === 'checking' && <h1>Checking certificate...</h1>}
        {status === 'invalid' && <><h1>Certificate not verified</h1><p>This certificate number is not an active licensed RHOPEE certificate.</p></>}
        {status === 'verified' && <><div className="verified-status"><div className="verified-icon" aria-hidden="true">✓</div><span className="verified-label">LICENSED RHOPEE CERTIFICATE</span><h1>Certificate verified</h1><p>This certificate has been successfully verified in the RHOPEE / NEF records and is recognized as an authentic professional credential.</p></div><dl><div><dt>Holder</dt><dd>{result.certificate_name || result.student_name}</dd></div><div><dt>Certificate number</dt><dd>{result.certificate_number}</dd></div><div><dt>Course</dt><dd>{result.certificate_course}</dd></div><div><dt>Issue date</dt><dd>{result.certificate_issue_date}</dd></div></dl></>}
      </section>
    </main>
  );
}

export default CertificateVerificationPage;
