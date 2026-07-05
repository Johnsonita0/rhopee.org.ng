import '../css/pages/VerificationStatusPage.css';

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

  const getStatusTone = () => {
    if (!memberData?.expiresAt) {
      return 'success';
    }

    const expiryDate = new Date(memberData.expiresAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(expiryDate.getTime())) {
      return 'success';
    }

    if (expiryDate < today) {
      return 'danger';
    }

    const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 30) {
      return 'warning';
    }

    return 'success';
  };

  const stateTone = getStatusTone();

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
    { label: 'Name', value: formatDisplayValue(memberData.name) },
    { label: 'Status', value: formatDisplayValue(memberData.status || 'Verified') },
    { label: 'Membership No.', value: formatDisplayValue(memberData.membershipId) },
  ];

  return (
    <section className="verification-status-page">
      <div className={`status-container ${stateTone}`}>
        <div className="verification-message">
          <div className="success-icon" aria-hidden="true">✓</div>
          <h2>
            <span className="member-name">{formatDisplayValue(memberData.name)}</span>
            <span className="is-verified"> is a verified member of</span>
            <span className="rhopee-text"> RHOPEE</span>
          </h2>
          <p className="status-subtitle">This is to inform you that the holder of this ID is a verified member of RHOPEE.</p>
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
