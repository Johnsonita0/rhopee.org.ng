import './VerificationStatusPage.css';

function VerificationStatusPage({ memberData, onClose }) {
  const formatDisplayValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return 'Not provided';
    }

    if (typeof value === 'string' && value.trim() === '') {
      return 'Not provided';
    }

    return String(value);
  };

  const formatDateValue = (value) => {
    if (!value) return 'Not provided';

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return formatDisplayValue(value);
    }

    return parsedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!memberData) {
    return (
      <section className="verification-status-page">
        <div className="status-container empty-state">
          <p>No verification data to display.</p>
          <button onClick={onClose} className="close-btn">Close</button>
        </div>
      </section>
    );
  }

  const detailItems = [
    { label: 'Membership ID', value: formatDisplayValue(memberData.membershipId) },
    { label: 'Tag/Position', value: formatDisplayValue(memberData.tag || 'Member') },
    { label: 'Chapter', value: formatDisplayValue(memberData.chapter) },
    { label: 'Status', value: formatDisplayValue(memberData.status || 'Verified') },
    { label: 'Issued Date', value: formatDateValue(memberData.issuedAt) },
    { label: 'Expiration Date', value: formatDateValue(memberData.expiresAt) },
  ];

  return (
    <section className="verification-status-page">
      <div className="status-container">
        <div className="verification-message">
          <div className="success-icon">✓</div>
          <h2>
            <span className="member-name">{formatDisplayValue(memberData.name)}</span>
            <span className="is-verified"> is a verified member of</span>
            <span className="rhopee-text"> RHOPEE</span>
          </h2>
          <p className="status-subtitle">The scanned QR details are shown below in a clear, readable format.</p>
        </div>

        <div className="details-card">
          <div className="detail-grid">
            {detailItems.map((item) => (
              <div className="detail-item" key={item.label}>
                <span className="detail-label">{item.label}</span>
                <span className="detail-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="action-buttons">
          <button onClick={onClose} className="close-btn">
            Close and return home
          </button>
        </div>
      </div>
    </section>
  );
}

export default VerificationStatusPage;
