import './Header.css';

function Header() {
  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">Rhopee ID Verifier</p>
        <h1>Secure landing page for barcode verification</h1>
      </div>
      <p className="header-note">Scan the barcode to confirm the ID and see verification details instantly.</p>
    </header>
  );
}

export default Header;
