import '../css/components/Banner.css';

function Banner() {
  return (
    <section className="hero-banner" id="home">
      <div className="hero-banner-content">
        <p className="hero-eyebrow">RHOPEE identity verification</p>
        <h2>Verify ID cards instantly with barcode scanning.</h2>
        <p className="hero-copy">
          Use your mobile scanner or barcode input to validate credentials securely with Supabase.
          This landing page is designed for fast verification and clean reporting.
        </p>
        <div className="hero-actions">
          <a className="button primary-button" href="#contact">Contact Us</a>
          <a className="button secondary-button" href="#gallery">See Gallery</a>
        </div>
      </div>
    </section>
  );
}

export default Banner;
