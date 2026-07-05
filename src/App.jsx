import { useEffect, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import HomePage from './pages/HomePage.jsx';
import MorePage from './pages/MorePage.jsx';
import RegistrationPage from './pages/RegistrationPage.jsx';
import VerificationPage from './pages/VerificationPage.jsx';
import { verifyIdCode } from './lib/supabaseClient.js';
import './App.css';

function App() {
  const [scannedCode, setScannedCode] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState('home');
  const [scannedMemberData, setScannedMemberData] = useState(null);

  const handleScan = async (code) => {
    setScannedCode(code);
    setVerificationResult(null);
    setError('');
    setLoading(true);

    try {
      // Try parsing as JSON first (QR code data)
      let memberData = null;
      try {
        memberData = JSON.parse(code);
      } catch (e) {
        // Not JSON, treat as barcode
        memberData = null;
      }

      if (memberData && memberData.membershipId) {
        // QR code scanned - show verification page
        setScannedMemberData({
          name: memberData.name,
          tag: memberData.tag,
          membershipId: memberData.membershipId,
          chapter: memberData.chapter,
          issuedAt: memberData.issuedAt,
          expiresAt: memberData.expiresAt,
          status: memberData.status,
        });
        setPage('verification');
        setLoading(false);
        return;
      }

      // Barcode lookup
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
        tag: data.tag || data.position || 'Member',
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

  const handleBackToScan = () => {
    setScannedMemberData(null);
    setPage('home');
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
      {page === 'verification' && (
        <VerificationPage
          memberData={scannedMemberData}
          onBackToScan={handleBackToScan}
        />
      )}
      {page === 'more' && <MorePage />}
      {page === 'register' && <RegistrationPage />}
    </div>
  );
}

export default App;
