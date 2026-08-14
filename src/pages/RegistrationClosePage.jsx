import '../css/pages/RegistrationClosePage.css';

function RegistrationClosePage() {
  return (
    <div className="registration-close-page">
      <div className="close-card">
        <div className="close-illustration">
          <svg
            width="300"
            height="300"
            viewBox="0 0 300 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background circle */}
            <circle cx="150" cy="150" r="140" fill="rgba(211, 47, 47, 0.08)" stroke="rgba(211, 47, 47, 0.16)" strokeWidth="2" strokeDasharray="5,5" />
            
            {/* Building/Store base */}
            <rect x="50" y="100" width="200" height="160" fill="#f5f5f5" stroke="#333" strokeWidth="2.5" rx="4" />
            
            {/* Door */}
            <g className="store-door">
              <rect x="100" y="120" width="100" height="140" fill="#c62828" stroke="#333" strokeWidth="2.5" rx="2" />
              <line x1="130" y1="120" x2="130" y2="260" stroke="#333" strokeWidth="1.5" />
              <line x1="170" y1="120" x2="170" y2="260" stroke="#333" strokeWidth="1.5" />
              
              {/* Door handle */}
              <circle cx="185" cy="190" r="6" fill="#ffd54f" stroke="#333" strokeWidth="1.5" />
            </g>
            
            {/* Roof */}
            <polygon points="50,100 150,30 250,100" fill="#d32f2f" stroke="#333" strokeWidth="2.5" />
            <line x1="150" y1="30" x2="150" y2="100" stroke="#333" strokeWidth="1.5" />
            
            {/* Roof shingles */}
            <circle cx="150" cy="50" r="8" fill="rgba(0,0,0,0.1)" />
            
            {/* Windows */}
            <rect x="70" y="65" width="22" height="22" fill="#87ceeb" stroke="#333" strokeWidth="1.5" rx="2" />
            <rect x="208" y="65" width="22" height="22" fill="#87ceeb" stroke="#333" strokeWidth="1.5" rx="2" />
            
            {/* Window panes */}
            <line x1="81" y1="65" x2="81" y2="87" stroke="#333" strokeWidth="0.8" />
            <line x1="70" y1="76" x2="92" y2="76" stroke="#333" strokeWidth="0.8" />
            <line x1="219" y1="65" x2="219" y2="87" stroke="#333" strokeWidth="0.8" />
            <line x1="208" y1="76" x2="230" y2="76" stroke="#333" strokeWidth="0.8" />
            
            {/* Main CLOSED sign */}
            <g className="closed-sign">
              <circle cx="150" cy="190" r="52" fill="#fff" stroke="#d32f2f" strokeWidth="4" />
              <circle cx="150" cy="190" r="48" fill="rgba(211, 47, 47, 0.05)" stroke="rgba(211, 47, 47, 0.1)" strokeWidth="1" />
              
              {/* Red X */}
              <line x1="115" y1="155" x2="185" y2="225" stroke="#d32f2f" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="185" y1="155" x2="115" y2="225" stroke="#d32f2f" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            
            {/* Decorative lock chain */}
            <path d="M 120 105 Q 125 85 130 80" stroke="#808080" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 180 105 Q 175 85 170 80" stroke="#808080" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="128" cy="77" r="3" fill="#606060" />
            <circle cx="172" cy="77" r="3" fill="#606060" />
          </svg>
        </div>

        <div className="close-content">
          <h1>Registration Closed</h1>
          <p className="close-subtitle">We appreciate your interest!</p>
          
          <div className="close-message">
            <p>
              Registration for this training program has now closed. Thank you for your interest in RHOPEE programs and events.
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
              ← Back to Home
            </button>
            <button 
              className="btn-secondary"
              onClick={() => window.location.href = '/#contact'}
            >
              📧 Contact Us
            </button>
          </div>

          <div className="close-info">
            <div className="info-item">
              <span className="info-icon">📧</span>
              <div>
                <h4>Stay Updated</h4>
                <p>Subscribe to our newsletter for announcements</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">📱</span>
              <div>
                <h4>Follow Us</h4>
                <p>Get updates on social media</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistrationClosePage;
