import '../css/components/Banner.css';

function Banner() {
  return (
    <section className="hero-banner" id="home">
      <div className="hero-banner-content">
        <p className="hero-eyebrow">RHOPEE Professional Development</p>
        <h2>Professional Skills Training & Development</h2>
        <p className="hero-copy">
          Develop professional skills with industry experts through our comprehensive training programs. 
          Earn recognized certifications. Limited slots available. Register today for the next cohort.
        </p>
        <div className="hero-actions">
          <a className="button primary-button" href="#registration">Register Now</a>
          <a className="button secondary-button" href="#about">Learn More</a>
        </div>
      </div>
    </section>
  );
}

export default Banner;
