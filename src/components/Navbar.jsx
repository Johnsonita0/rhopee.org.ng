import { useState } from 'react';
import './Navbar.css';

function Navbar({ activePage, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const goToPage = (page) => {
    window.location.hash = page === 'home' ? '#home' : '#more';
    onNavigate(page);
    closeMenu();
  };

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
      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <button
          type="button"
          className={activePage === 'home' ? 'active' : ''}
          onClick={() => goToPage('home')}
        >
          Home
        </button>
        <button
          type="button"
          className={activePage === 'more' ? 'active' : ''}
          onClick={() => goToPage('more')}
        >
          More
        </button>
        <button
          type="button"
          className={activePage === 'register' ? 'active' : ''}
          onClick={() => goToPage('register')}
        >
          Register
        </button>
      </div>
      {menuOpen && <div className="nav-backdrop" onClick={closeMenu} />}
    </nav>
  );
}

export default Navbar;
