import { useState, useEffect, useRef } from 'react';
import '../css/components/Navbar.css';

function Navbar({ activePage, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [userToggled, setUserToggled] = useState(false);
  const AUTO_COLLAPSE_PX = 1100;

  const closeMenu = () => setMenuOpen(false);

  const goToPage = (page) => {
    window.location.hash = page === 'home' ? '#home' : '#more';
    onNavigate(page);
    closeMenu();
    // temporarily expand when user selects a menu while collapsed (auto-show labels)
    if (collapsed && !userToggled) {
      // expand for a short duration
      setCollapsed(false);
      if (expandTimeoutRef.current) clearTimeout(expandTimeoutRef.current);
      expandTimeoutRef.current = setTimeout(() => {
        setCollapsed(true);
        expandTimeoutRef.current = null;
      }, 3000);
    }
  };

  const expandTimeoutRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    if (collapsed) root.classList.add('nav-collapsed');
    else root.classList.remove('nav-collapsed');
    return () => root.classList.remove('nav-collapsed');
  }, [collapsed]);

  useEffect(() => {
    return () => {
      if (expandTimeoutRef.current) clearTimeout(expandTimeoutRef.current);
    };
  }, []);

  // responsive auto-collapse (unless user manually toggled)
  useEffect(() => {
    function handleResize() {
      if (userToggled) return;
      const w = window.innerWidth;
      if (w <= 840) {
        setCollapsed(false);
        setMenuOpen(false);
        return;
      }
      setCollapsed(w < AUTO_COLLAPSE_PX);
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [userToggled]);

  return (
    <nav className={`top-nav ${collapsed ? 'collapsed' : ''}`}>
      <div className="nav-inner">
        <button className="brand-button" type="button" onClick={() => goToPage('home')}>
          <img src="/logo/logo1.jpeg" alt="RHOPEE logo" className="brand-logo" />
          <span>RHOPEE</span>
        </button>
        <button
          className={`nav-toggle ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <div className={`nav-links ${menuOpen ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}>
        <button
          type="button"
          className={activePage === 'home' ? 'active' : ''}
          onClick={() => goToPage('home')}
          title="Home"
        >
          <span className="nav-icon" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 11.5L12 4l9 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <span className="link-text">Home</span>
        </button>
        <button
          type="button"
          className={activePage === 'more' ? 'active' : ''}
          onClick={() => goToPage('more')}
          title="More"
        >
          <span className="nav-icon" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/><path d="M19 12a7 7 0 10-14 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <span className="link-text">More</span>
        </button>
      </div>
      <button
        type="button"
        className={`nav-collapse-toggle ${collapsed ? 'collapsed' : ''}`}
        onClick={() => {
          setUserToggled(true);
          setCollapsed((c) => !c);
        }}
        aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        {collapsed ? '›' : '‹'}
      </button>
      {menuOpen && <div className="nav-backdrop" onClick={closeMenu} />}
    </nav>
  );
}

export default Navbar;
