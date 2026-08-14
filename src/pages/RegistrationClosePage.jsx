import '../css/pages/RegistrationClosePage.css';

function RegistrationClosePage() {
  return (
    <div className="registration-close-page">
      <div className="close-card">
        <div className="close-illustration">
          <svg
            width="280"
            height="280"
            viewBox="0 0 280 280"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Building/Door base */}
            <rect x="60" y="100" width="160" height="140" fill="#f0f0f0" stroke="#333" strokeWidth="2" />
            
            {/* Door */}
            <rect x="90" y="120" width="100" height="130" fill="#8b4513" stroke="#333" strokeWidth="2" />
            
            {/* Door handle */}
            <circle cx="180" cy="185" r="5" fill="#d4af37" />
            
            {/* Door frame details */}
            <line x1="110" y1="120" x2="110" y2="250" stroke="#333" strokeWidth="1" />
            <line x1="170" y1="120" x2="170" y2="250" stroke="#333" strokeWidth="1" />
            
            {/* Roof */}
            <polygon points="60,100 140,40 220,100" fill="#d32f2f" stroke="#333" strokeWidth="2" />
            
            {/* Roof accent */}
            <line x1="140" y1="40" x2="140" y2="100" stroke="#333" strokeWidth="1" />
            
            {/* Windows on wall */}
            <rect x="75" y="70" width="20" height="20" fill="#87ceeb" stroke="#333" strokeWidth="1" />
            <rect x="185" y="70" width="20" height="20" fill="#87ceeb" stroke="#333" strokeWidth="1" />
            
            {/* Closed sign - Large X */}
            <g className="closed-sign-animation">
              <circle cx="140" cy="185" r="45" fill="#fff" stroke="#d32f2f" strokeWidth="3" />
              <text x="140" y="195" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#d32f2f">
                CLOSED
              </text>
            </g>
            
            {/* Decorative chain links */}
            <line x1="110" y1="115" x2="130" y2="95" stroke="#808080" strokeWidth="2" strokeDasharray="5,5" />
            <line x1="170" y1="115" x2="150" y2="95" stroke="#808080" strokeWidth="2" strokeDasharray="5,5" />
          </svg>
        </div>

        <div className="close-content">
          <h1>Registration Closed</h1>
          <p className="close-subtitle">We appreciate your interest!</p>
          
          <div className="close-message">
            <p>
              Registration for this event has now closed. Thank you for your interest in RHOPEE programs and events.
            </p>
            <p>
              Please check back soon for announcements about upcoming training programs and events. You can also follow us on our social media channels for the latest updates.
            </p>
          </div>

          <div className="close-actions">
            <button 
              className="btn-primary"
              onClick={() => window.location.href = '/'}
            >
              Back to Home
            </button>
            <button 
              className="btn-secondary"
              onClick={() => window.location.href = '/#contact'}
            >
              Contact Us
            </button>
          </div>

          <div className="close-info">
            <div className="info-item">
              <span className="info-icon">📧</span>
              <div>
                <h4>Stay Updated</h4>
                <p>Subscribe to our newsletter for event announcements</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">📱</span>
              <div>
                <h4>Follow Us</h4>
                <p>Connect with us on social media for news and updates</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistrationClosePage;
