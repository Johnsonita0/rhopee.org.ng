import { useEffect, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import HomePage from './pages/HomePage.jsx';
import MorePage from './pages/MorePage.jsx';
import RegistrationPage from './pages/RegistrationPage.jsx';
import { verifyIdCode } from './lib/supabaseClient.js';
import './App.css';

function App() {
  const [scannedCode, setScannedCode] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState('home');

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
        position: data.position,
        membershipId: data.membership_id,
        chapter: data.chapter,
        status: data.status,
        issuedAt: data.issued_at ?? 'Unknown',
        expiresAt: data.expires_at ?? 'Unknown',
        barcode: code,
      });
    } catch (e) {
      console.error('Verification error:', e);
      setError('Unable to verify this ID code.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const updatePageFromHash = () => {
      const currentHash = window.location.hash.toLowerCase();

      if (currentHash === '#register') {
        setPage('register');
      } else if (currentHash === '#more' || ['#gallery', '#news', '#contact'].includes(currentHash)) {
        setPage('more');
      } else {
        setPage('home');
      }
    };

    updatePageFromHash();
    window.addEventListener('hashchange', updatePageFromHash);

    return () => window.removeEventListener('hashchange', updatePageFromHash);
  }, []);

  return (
    <div className="app-shell">
      <Navbar activePage={page} onNavigate={setPage} />
      {page === 'home' && (
        <HomePage
          scannedCode={scannedCode}
          verificationResult={verificationResult}
          loading={loading}
          error={error}
          onScan={handleScan}
        />
      )}
      {page === 'more' && <MorePage />}
      {page === 'register' && <RegistrationPage />}
    </div>
  );
}

export default App;
