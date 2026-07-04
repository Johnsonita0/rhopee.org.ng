function Navbar() {
  return (
    <nav className="top-nav">
      <div className="nav-inner">
        <a className="brand" href="#home">
          <img src="/logo/logo1.jpeg" alt="RHOPEE logo" className="brand-logo" />
          <span>RHOPEE</span>
        </a>
        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#gallery">Gallery</a>
          <a href="#news">News</a>
          <a href="#contact">Contact Us</a>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
