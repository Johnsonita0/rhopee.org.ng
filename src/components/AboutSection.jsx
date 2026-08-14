import '../css/components/AboutSection.css';

function AboutSection() {
  return (
    <section className="about-section" id="about">
      <div className="about-card">
        <h3>About RHOPEE</h3>
        <p>
          RHOPEE is dedicated to professional development and skills training, providing industry-standard programs and certifications for individuals looking to advance their careers. 
          With over 8 years of excellence in the industry, we are committed to training the next generation of skilled artisans and professionals.
        </p>
        <p className="about-highlight">Motto: Quality Craftsmanship, Professional Excellence</p>
        <p className="about-highlight">Vision: To be the premier training hub for textile production and custom apparel manufacturing in West Africa.</p>
      </div>

      <div className="about-group">
        <div className="about-card">
          <h4>Program Highlights</h4>
          <ul>
            <li><strong>Duration:</strong> 6 months intensive training (31 August – 27 February 2027)</li>
            <li><strong>Registration Fee:</strong> ₦10,000 (covers materials and certification)</li>
            <li><strong>Training Tracks:</strong> Professional Development, Technical Skills, Business Management, Quality Assurance</li>
            <li><strong>Expert Trainers:</strong> Industry professionals with 10+ years experience</li>
            <li><strong>Hands-on Learning:</strong> 70% practical workshops, 30% theory</li>
          </ul>
        </div>

        <div className="about-card">
          <h4>What You'll Learn</h4>
          <ul>
            <li>Practical textile handling and fabric preparation techniques</li>
            <li>Professional industry-standard methodologies and best practices</li>
            <li>Face cap design and manufacturing process</li>
            <li>Quality control and finishing techniques</li>
            <li>Equipment operation and maintenance</li>
            <li>Workplace safety and professional ethics</li>
          </ul>
        </div>
      </div>

      <div className="about-group">
        <div className="about-card">
          <h4>Who Should Apply</h4>
          <ul>
            <li>Students seeking practical work experience</li>
            <li>Career changers looking to enter manufacturing</li>
            <li>Entrepreneurs wanting to start their own production business</li>
            <li>Corporate employees seeking skill development</li>
            <li>Anyone passionate about textile and apparel manufacturing</li>
          </ul>
        </div>

        <div className="about-card">
          <h4>Program Benefits</h4>
          <ul>
            <li>✓ Free comprehensive training for 6 months</li>
            <li>✓ Industry-recognized certificate upon completion</li>
            <li>✓ Hands-on experience with professional equipment</li>
            <li>✓ Networking with industry professionals</li>
            <li>✓ Career guidance and job placement assistance</li>
            <li>✓ Opportunity for continued employment</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
