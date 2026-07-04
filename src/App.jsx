import { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Header from './components/Header.jsx';
import Scanner from './components/Scanner.jsx';
import ResultCard from './components/ResultCard.jsx';
import { verifyIdCode } from './lib/supabaseClient.js';
import './App.css';

function App() {
  const [scannedCode, setScannedCode] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async (code) => {
    setScannedCode(code);
    setVerificationResult(null);
    setError('');
    setLoading(true);

    try {
      const { data, error: queryError } = await verifyIdCode(code);

      if (queryError) {
        console.error('Supabase query error:', queryError);
        setError('Unable to verify this ID code.');
        return;
      }

      if (!data) {
        setError('No matching ID record found.');
        return;
      }

      setVerificationResult({
        id: data.id,
        name: data.name,
        status: data.status,
        issuedAt: data.issued_at ?? 'Unknown',
      });
    } catch (e) {
      console.error('Verification error:', e);
      setError('Unable to verify this ID code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <Navbar />
      <Header />
      <main className="page-content">
        <section className="hero-card" id="home">
          <h2>Scan the barcode on the ID card</h2>
          <p>Verify identity with Vercel and Supabase after scanning the barcode.</p>
        </section>

        <Scanner onScan={handleScan} />

        <ResultCard
          scannedCode={scannedCode}
          result={verificationResult}
          loading={loading}
          error={error}
        />

        <section className="section-block" id="gallery">
          <h3>Gallery</h3>
          <p>Display your logo, verification process, and sample card images here.</p>
        </section>

        <section className="section-block" id="news">
          <h3>News</h3>
          <p>Latest updates about RHOPEE ID verification appear here.</p>
        </section>

        <section className="section-block" id="contact">
          <h3>Contact Us</h3>
          <p>Share support or project details for your verification flow.</p>
        </section>
      </main>
    </div>
  );
}

export default App;
