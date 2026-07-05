import { useEffect, useState } from 'react';
import '../css/pages/VerificationPage.css';

function VerificationPage({ memberData, onBackToScan }) {
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (memberData?.expiresAt) {
      const expiryDate = new Date(memberData.expiresAt);
      const today = new Date();
      setIsExpired(expiryDate < today);
    }
  }, [memberData]);

  if (!memberData) {
    return (
      <section className="verification-page">
        <div className="no-data">
          <p>No member data to verify</p>
          <button onClick={onBackToScan} className="back-btn">Back to Scanner</button>
        </div>
      </section>
    );
  }

  return (
    <section className="verification-page">
      <div className="verification-container">
        {/* Header with verification status */}
        <div className="verification-header">
          <div className={`status-badge ${isExpired ? 'expired' : 'verified'}`}>
            <span className="status-icon">
              {isExpired ? '⚠️' : '✓'}
            </span>
            <span className="status-text">
              {isExpired ? 'MEMBERSHIP EXPIRED' : 'VERIFIED MEMBER'}
            </span>
          </div>
        </div>

        {/* Member Card */}
        <div className="member-card">
          <div className="card-header">
            <h2>{memberData.name}</h2>
            <p className="member-tag">{memberData.tag || 'Member'}</p>
          </div>

          <div className="card-divider"></div>

          {/* Member Details Grid */}
          <div className="member-details">
            <div className="detail-item">
              <span className="label">Membership ID</span>
              <span className="value">{memberData.membershipId}</span>
            </div>
            <div className="detail-item">
              <span className="label">Chapter</span>
              <span className="value">{memberData.chapter}</span>
            </div>
            <div className="detail-item">
              <span className="label">Issued</span>
              <span className="value">{new Date(memberData.issuedAt).toLocaleDateString()}</span>
            </div>
            <div className="detail-item">
              <span className="label">Expires</span>
              <span className={`value ${isExpired ? 'expired-date' : ''}`}>
                {new Date(memberData.expiresAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="verification-footer">
            <div className="rhopee-badge">
              <svg viewBox="0 0 100 100" className="badge-icon">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#0f5f2b" strokeWidth="2"/>
                <path d="M 35 50 L 45 60 L 65 40" fill="none" stroke="#0f5f2b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <p className="badge-title">RHOPEE VERIFIED</p>
                <p className="badge-subtitle">Member Database</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button onClick={onBackToScan} className="back-btn">
            ← Back to Scanner
          </button>
          <button 
            onClick={() => window.print()} 
            className="print-btn"
          >
            🖨️ Print Verification
          </button>
        </div>

        {/* Expiry Warning */}
        {isExpired && (
          <div className="expiry-warning">
            <strong>⚠️ Alert:</strong> This member's ID has expired. Please contact the chapter coordinator for renewal.
          </div>
        )}
      </div>
    </section>
  );
}

export default VerificationPage;
