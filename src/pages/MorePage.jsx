import AboutSection from '../components/AboutSection.jsx';

function MorePage() {
  return (
    <main id="more" className="page-content">
      <AboutSection />

      <section className="section-block" id="gallery">
        <h3>Gallery</h3>
        <p>Display your logo, verification process, and sample card images here.</p>
      </section>

      <section className="section-block" id="news">
        <h3>News</h3>
        <p>Latest updates about RHOPEE ID verification appear here.</p>
      </section>

      <section className="section-block" id="contact">
        <h3>Contact Us</h3>
        <p>Share support or project details for your verification flow.</p>
      </section>
    </main>
  );
}

export default MorePage;
