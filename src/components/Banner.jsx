import '../css/components/Banner.css';

function Banner() {
  return (
    <section className="hero-banner" id="home">
      <div className="hero-banner-content">
        <p className="hero-eyebrow">T-Shirts Village 8th Anniversary</p>
        <h2>Join Our Free 6-Month Internship Program</h2>
        <p className="hero-copy">
          Learn professional textile production, T-shirt manufacturing, polo tailoring, and face cap production from industry experts. 
          Limited slots available. Registration deadline: 27th August. Classes start 31st August.
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
