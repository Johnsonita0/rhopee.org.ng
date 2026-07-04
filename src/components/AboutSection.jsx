import './AboutSection.css';

function AboutSection() {
  return (
    <section className="about-section" id="about">
      <div className="about-card">
        <h3>About RHOPEE / NEF</h3>
        <p>
          RHOPEE/NEF is the grassroots mobilization and advocacy arm for the Renewed Hope Agenda in Akwa Ibom State.
          We deepen, defend, and deliver the agenda of President Bola Ahmed Tinubu GCFR at the ward and LGA level.
        </p>
        <p className="about-highlight">Motto: ONE NIGERIA</p>
        <p className="about-highlight">Vision: A politically conscious, empowered, and united grassroots base for sustainable APC governance.</p>
      </div>

      <div className="about-group">
        <div className="about-card">
          <h4>Our Mandate</h4>
          <ul>
            <li>Grassroots Mobilization: Voter education, membership drive, and political sensitization across 31 LGAs & 329 Wards.</li>
            <li>Policy Advocacy: Explain Federal Government projects in local language.</li>
            <li>Loyalty & Discipline: Build a disciplined structure that supports party decisions.</li>
            <li>Data & Feedback: Provide real-time grassroots intelligence to party leadership.</li>
          </ul>
        </div>

        <div className="about-card">
          <h4>State Structure</h4>
          <ul>
            <li>State Coordinator: Hon. Churchill Udeme</li>
            <li>State Exco: 30-member team across key portfolios.</li>
            <li>31 LGA Coordinators and 5,593 Ward Executives.</li>
            <li>82,250+ verified grassroots members in Akwa Ibom.</li>
          </ul>
        </div>
      </div>

      <div className="about-group">
        <div className="about-card">
          <h4>Q3 2026 Activities</h4>
          <ul>
            <li>LGA Inauguration Tour for all 31 LGA Coordinators.</li>
            <li>Ward Sensitization Caravans and townhall meetings.</li>
            <li>Compliance & Capacity Training for coordinators.</li>
            <li>Database Harmonization with biometric member capture.</li>
          </ul>
        </div>

        <div className="about-card">
          <h4>Why Partner With Us?</h4>
          <ul>
            <li>Largest boots-on-ground network ready for deployment.</li>
            <li>Message discipline and real-time narrative control.</li>
            <li>Direct feedback channel from grassroots to leadership.</li>
            <li>Voluntary service model with minimal logistics burden.</li>
          </ul>
        </div>
      </div>

      <div className="about-card about-ask">
        <h4>Our Ask from ALGON</h4>
        <ol>
          <li>Recognition as a key grassroots partner in all LGA programs.</li>
          <li>Audience with LGA Chairmen to align activities.</li>
          <li>Guidance on areas where our mobilization can support LGA development.</li>
        </ol>
      </div>
    </section>
  );
}

export default AboutSection;
