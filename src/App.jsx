import { useEffect, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import HomePage from './pages/HomePage.jsx';
import MorePage from './pages/MorePage.jsx';
import RegistrationPage from './pages/RegistrationPage.jsx';
import VerificationStatusPage from './pages/VerificationStatusPage.jsx';
import { verifyIdCode } from './lib/supabaseClient.js';
import './App.css';
import { decodeVerificationPayload, encodeVerificationPayload } from './lib/verificationPayload.js';

function App() {
  const [scannedCode, setScannedCode] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState('home');
  const [scannedMemberData, setScannedMemberData] = useState(null);
  const [routeMode, setRouteMode] = useState(() => {
    if (typeof window === 'undefined') return 'app';
    return window.location.pathname.toLowerCase() === '/verifyme' ? 'verify' : 'app';
  });

  const readVerificationDataFromLocation = () => {
    const params = new URLSearchParams(window.location.search);
    const encodedData = params.get('data');

    if (encodedData) {
      const decodedData = decodeVerificationPayload(encodedData);
      if (decodedData) {
        return decodedData;
      }
    }

    const pendingData = sessionStorage.getItem('pendingVerificationData');
    if (pendingData) {
      try {
        return JSON.parse(pendingData);
      } catch (error) {
        console.error('Unable to restore verification data:', error);
      }
    }

    return null;
  };

  const openVerificationInBrowser = (memberData) => {
    sessionStorage.setItem('pendingVerificationData', JSON.stringify(memberData));

    const encodedData = encodeVerificationPayload(memberData);
    const verificationUrl = `${window.location.origin}/verifyme?data=${encodedData}`;
    const popup = window.open(verificationUrl, '_blank', 'width=980,height=760,noopener,noreferrer');

    if (!popup) {
      setScannedMemberData(memberData);
      setRouteMode('verify');
      setPage('verification');
    }
  };

  const parseScannedPayload = (code) => {
    const trimmedCode = code?.trim();
    if (!trimmedCode) return null;

    try {
      const parsedJson = JSON.parse(trimmedCode);
      if (parsedJson && (parsedJson.membershipId || parsedJson.membership_id || parsedJson.name)) {
        return parsedJson;
      }
    } catch (error) {
      // Ignore and try URL parsing below.
    }

    try {
      const parsedUrl = new URL(trimmedCode);
      if (parsedUrl.pathname.toLowerCase().includes('/verifyme')) {
        const encodedData = parsedUrl.searchParams.get('data');
        if (encodedData) {
          return JSON.parse(decodeURIComponent(encodedData));
        }
      }
    } catch (error) {
      // Ignore invalid URL input.
    }

    return null;
  };

  const handleScan = async (code) => {
    setScannedCode(code);
    setVerificationResult(null);
    setError('');
    setLoading(true);

    try {
      const memberData = parseScannedPayload(code);

      if (memberData && (memberData.membershipId || memberData.membership_id)) {
        const payload = {
          name: memberData.name,
          tag: memberData.tag,
          membershipId: memberData.membershipId,
          chapter: memberData.chapter,
          issuedAt: memberData.issuedAt,
          expiresAt: memberData.expiresAt,
          status: memberData.status,
        };

        setScannedMemberData(payload);

        openVerificationInBrowser(payload);

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
    sessionStorage.removeItem('pendingVerificationData');
    setScannedMemberData(null);
    setPage('home');

    if (routeMode === 'verify') {
      if (window.opener) {
        window.close();
      } else {
        window.location.assign('/');
      }
      return;
    }

    if (window.location.hash === '#verify-status' || window.location.pathname.toLowerCase() === '/verifyme') {
      window.location.hash = '';
      window.history.replaceState({}, '', '/');
    }
  };

  useEffect(() => {
    const updateRoute = () => {
      const currentPath = window.location.pathname.toLowerCase();
      const currentHash = window.location.hash.toLowerCase();

      if (currentPath === '/verifyme') {
        const verificationData = readVerificationDataFromLocation();
        if (verificationData) {
          setScannedMemberData(verificationData);
        }
        setRouteMode('verify');
        setPage('verification');
        return;
      }

      setRouteMode('app');

      if (currentHash === '#register') {
        setPage('register');
      } else if (currentHash === '#more' || ['#gallery', '#news', '#contact'].includes(currentHash)) {
        setPage('more');
      } else if (currentHash === '#verify-status') {
        const pendingData = sessionStorage.getItem('pendingVerificationData');
        if (pendingData) {
          try {
            setScannedMemberData(JSON.parse(pendingData));
          } catch (error) {
            console.error('Unable to restore verification data:', error);
          }
          setPage('verification');
        } else {
          setPage('home');
        }
      } else {
        setPage('home');
      }
    };

    updateRoute();
    window.addEventListener('popstate', updateRoute);
    window.addEventListener('hashchange', updateRoute);

    return () => {
      window.removeEventListener('popstate', updateRoute);
      window.removeEventListener('hashchange', updateRoute);
    };
  }, []);

  if (routeMode === 'verify') {
    return (
      <VerificationStatusPage
        memberData={scannedMemberData}
        onClose={handleBackToScan}
      />
    );
  }

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
        <VerificationStatusPage
          memberData={scannedMemberData}
          onClose={handleBackToScan}
        />
      )}
      {page === 'more' && <MorePage />}
      {page === 'register' && <RegistrationPage />}
    </div>
  );
}

export default App;
