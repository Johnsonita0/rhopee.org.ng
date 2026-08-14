import { useEffect, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import HomePage from './pages/HomePage.jsx';
import MorePage from './pages/MorePage.jsx';
import RegistrationPage from './pages/RegistrationPage.jsx';
import EventRegistrationPage from './pages/EventRegistrationPage.jsx';
import RegistrationClosePage from './pages/RegistrationClosePage.jsx';
import VerificationStatusPage from './pages/VerificationStatusPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import { ALLOWED_ADMIN_USER_ID, getAdminSession, signOutAdmin, verifyIdCode } from './lib/supabaseClient.js';
import { isRegistrationOpen } from './lib/registrationStatus.js';
import './css/App.css';
import { decodeVerificationPayload, encodeVerificationPayload, parseScannableQrValue } from './lib/verificationPayload.js';

function App() {
  const [scannedCode, setScannedCode] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState('home');
  const [scannedMemberData, setScannedMemberData] = useState(null);
  const [registrationOpen, setRegistrationOpen] = useState(() => isRegistrationOpen());
  const [adminAuthenticated, setAdminAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const storedAuth = window.localStorage.getItem('adminAuth');
      return storedAuth ? JSON.parse(storedAuth).authenticated : false;
    } catch (error) {
      console.warn('Unable to read admin auth state', error);
      return false;
    }
  });
  const [routeMode, setRouteMode] = useState(() => {
    if (typeof window === 'undefined') return 'app';
    const path = window.location.pathname.toLowerCase();
    if (path === '/verifyme') return 'verify';
    if (path === '/admin') return 'admin';
    return 'app';
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

  const normalizeVerificationPayload = (memberData, fallbackOutcome = 'verified', fallbackReason = '') => {
    const derivedOutcome = memberData?.outcome || memberData?.verificationState || fallbackOutcome;
    const derivedStatus = memberData?.status || (derivedOutcome === 'expired' ? 'Expired' : derivedOutcome === 'invalid' ? 'Invalid' : 'Verified');

    return {
      name: memberData?.name || '',
      tag: memberData?.tag || '',
      membershipId: memberData?.membershipId || memberData?.membership_id || '',
      chapter: memberData?.chapter || '',
      issuedAt: memberData?.issuedAt || memberData?.issued_at || '',
      expiresAt: memberData?.expiresAt || memberData?.expires_at || '',
      status: derivedStatus,
      outcome: derivedOutcome,
      reason: memberData?.reason || fallbackReason,
      materialsUrl: memberData?.materialsUrl || '',
      trainingTrack: memberData?.trainingTrack || '',
      trainingTrackName: memberData?.trainingTrackName || '',
    };
  };

  const openVerificationInBrowser = (memberData) => {
    const payload = normalizeVerificationPayload(memberData);
    sessionStorage.setItem('pendingVerificationData', JSON.stringify(payload));

    const encodedData = encodeVerificationPayload(payload);
    const verificationUrl = `${window.location.origin}/verifyme?data=${encodedData}`;
    const popup = window.open(verificationUrl, '_blank', 'width=980,height=760,noopener,noreferrer');

    if (!popup) {
      setScannedMemberData(payload);
      setRouteMode('verify');
      setPage('verification');
    }
  };

  const parseScannedPayload = (code) => {
    const trimmedCode = code?.trim();
    if (!trimmedCode) return null;

    const scannableValue = parseScannableQrValue(trimmedCode);
    if (scannableValue?.searchValue) {
      return { barcode: scannableValue.searchValue };
    }

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
          return decodeVerificationPayload(encodedData);
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
        const payload = normalizeVerificationPayload(memberData);

        setScannedMemberData(payload);
        openVerificationInBrowser(payload);

        setLoading(false);
        return;
      }

      const lookupValue = memberData?.barcode || memberData?.searchValue || code;

      // Barcode lookup
      const { data, error: queryError } = await verifyIdCode(lookupValue);

      if (queryError) {
        console.error('Supabase query error:', queryError);
        const invalidPayload = normalizeVerificationPayload(
          {
            name: 'Unrecognized QR code',
            tag: 'Unknown',
            status: 'Invalid',
            reason: 'Unable to verify this ID code.',
          },
          'invalid',
          'Unable to verify this ID code.'
        );
        setScannedMemberData(invalidPayload);
        openVerificationInBrowser(invalidPayload);
        setError('Unable to verify this ID code.');
        return;
      }

      if (!data) {
        const invalidPayload = normalizeVerificationPayload(
          {
            name: 'Unrecognized QR code',
            tag: 'Unknown',
            status: 'Invalid',
            reason: 'No matching ID record found.',
          },
          'invalid',
          'No matching ID record found.'
        );
        setScannedMemberData(invalidPayload);
        openVerificationInBrowser(invalidPayload);
        setError('No matching ID record found.');
        return;
      }

      const payload = normalizeVerificationPayload({
        name: data.name,
        tag: data.tag || data.position || 'Member',
        membershipId: data.membership_id,
        chapter: data.chapter,
        status: data.status,
        issuedAt: data.issued_at ?? 'Unknown',
        expiresAt: data.expires_at ?? 'Unknown',
      });

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
      setScannedMemberData(payload);
      openVerificationInBrowser(payload);
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
    setVerificationResult(null);
    setError('');
    setScannedCode('');
    setPage('home');

    if (routeMode === 'verify') {
      if (window.opener) {
        window.close();
      } else {
        window.history.replaceState({}, '', '/');
        window.location.assign('/');
      }
      return;
    }

    if (window.location.hash === '#verify-status' || window.location.pathname.toLowerCase() === '/verifyme') {
      window.history.replaceState({}, '', '/');
      window.location.assign('/');
    }
  };

  const handleAdminLoginSuccess = () => {
    setAdminAuthenticated(true);
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/admin');
    }
  };

  const handleAdminLogout = async () => {
    try {
      await signOutAdmin();
    } catch (error) {
      console.warn('Unable to sign out from Supabase', error);
    }

    setAdminAuthenticated(false);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('adminAuth');
      window.history.replaceState({}, '', '/admin');
    }
  };

  const handleOnline = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('rhopee:network-online'));
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

      if (currentPath === '/admin') {
        setRouteMode('admin');
        return;
      }

      setRouteMode('app');

      if (currentPath === '/register') {
        setPage('register');
      } else if (currentPath === '/event-register') {
        setPage('event-register');
      } else if (currentPath === '/rhoppe_training' || currentPath === '/registration-closed' || currentPath === '/registration-close') {
        setPage('registration-closed');
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

    const restoreAdminSession = async () => {
      if (typeof window === 'undefined') {
        return;
      }

      try {
        const storedAuth = window.localStorage.getItem('adminAuth');
        if (storedAuth) {
          const parsedAuth = JSON.parse(storedAuth);
          if (parsedAuth.authenticated) {
            setAdminAuthenticated(true);
          }
        }

        const { data, error } = await getAdminSession();
        if (error) {
          throw error;
        }

        if (data?.session?.user?.id === ALLOWED_ADMIN_USER_ID) {
          setAdminAuthenticated(true);
        } else if (!window.localStorage.getItem('adminAuth')) {
          setAdminAuthenticated(false);
        }
      } catch (error) {
        console.warn('Unable to restore admin session', error);
      }
    };

    updateRoute();
    restoreAdminSession();

    // Attempt to push any locally persisted registrations to Supabase on app load
    try {
      pushPendingRegistrations().catch((e) => console.warn('pushPendingRegistrations error', e));
    } catch (e) {
      // ignore if not available
    }

    window.addEventListener('popstate', updateRoute);
    window.addEventListener('hashchange', updateRoute);

    return () => {
      window.removeEventListener('popstate', updateRoute);
      window.removeEventListener('hashchange', updateRoute);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Listen for registration status changes
  useEffect(() => {
    const handleRegistrationStatusChange = (event) => {
      const newStatus = event.detail?.isOpen ?? isRegistrationOpen();
      setRegistrationOpen(newStatus);
      
      // If user is on event-register page and registration closes, redirect to closed page
      if (!newStatus && page === 'event-register') {
        setPage('registration-closed');
        if (typeof window !== 'undefined') {
          window.history.replaceState({}, '', '/registration-closed');
        }
      }
    };

    window.addEventListener('rhopee:registration-status-changed', handleRegistrationStatusChange);
    return () => {
      window.removeEventListener('rhopee:registration-status-changed', handleRegistrationStatusChange);
    };
  }, [page]);

  if (routeMode === 'verify') {
    return (
      <VerificationStatusPage
        memberData={scannedMemberData}
        onClose={handleBackToScan}
      />
    );
  }

  if (routeMode === 'admin') {
    return adminAuthenticated ? (
      <AdminDashboardPage onLogout={handleAdminLogout} />
    ) : (
      <AdminLoginPage onLoginSuccess={handleAdminLoginSuccess} />
    );
  }

  return (
    <div className="app-shell">
      <Navbar activePage={page} onNavigate={setPage} registrationOpen={registrationOpen} />
      <div className="app-main-content">
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
        {page === 'event-register' && <EventRegistrationPage />}
        {page === 'registration-closed' && <RegistrationClosePage />}
      </div>
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} RHOPEE. One Nigeria, One People, One Future</p>
      </footer>
    </div>
  );
}

export default App;
