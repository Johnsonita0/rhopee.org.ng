import { useState, useEffect } from 'react';
import './Navbar.css';

function Navbar({ activePage, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const goToPage = (page) => {
    window.location.hash = page === 'home' ? '#home' : '#more';
    onNavigate(page);
    closeMenu();
  };

  useEffect(() => {
    const root = document.documentElement;
    if (collapsed) root.classList.add('nav-collapsed');
    else root.classList.remove('nav-collapsed');
    return () => root.classList.remove('nav-collapsed');
  }, [collapsed]);

  return (
    <nav className="top-nav">
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
        >
          <span className="link-text">Home</span>
        </button>
        <button
          type="button"
          className={activePage === 'more' ? 'active' : ''}
          onClick={() => goToPage('more')}
        >
          <span className="link-text">More</span>
        </button>
        <button
          type="button"
          className={activePage === 'register' ? 'active' : ''}
          onClick={() => goToPage('register')}
        >
          <span className="link-text">Register</span>
        </button>
      </div>
      <button
        type="button"
        className={`nav-collapse-toggle ${collapsed ? 'collapsed' : ''}`}
        onClick={() => setCollapsed((c) => !c)}
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
