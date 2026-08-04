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
    const normalizedOutcome = String(memberData?.outcome || '').toLowerCase();
    const normalizedStatus = String(memberData?.status || '').toLowerCase();

    if (normalizedOutcome === 'invalid' || normalizedStatus === 'invalid') {
      return 'danger';
    }

    if (normalizedOutcome === 'expired' || normalizedStatus === 'expired') {
      return 'warning';
    }

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
      return 'warning';
    }

    const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 30) {
      return 'warning';
    }

    return 'success';
  };

  const stateTone = getStatusTone();
  const isInvalidState = ['invalid', 'unrecognized', 'not found'].includes(String(memberData?.outcome || '').toLowerCase()) || ['invalid', 'unrecognized', 'not found'].includes(String(memberData?.status || '').toLowerCase());
  const isExpiredState = ['expired'].includes(String(memberData?.outcome || '').toLowerCase()) || ['expired'].includes(String(memberData?.status || '').toLowerCase()) || (memberData?.expiresAt && new Date(memberData.expiresAt) < new Date(new Date().setHours(0, 0, 0, 0)));
  const trackNameMap = {
    cinematography: 'Cinematography',
    photography: 'Photography',
    webdev: 'Web Development',
  };
  const trackDisplayValue = formatDisplayValue(
    memberData?.trainingTrackName ||
    trackNameMap[String(memberData?.trainingTrack || '').toLowerCase()] ||
    memberData?.trainingTrack ||
    'Not provided'
  );

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
    { label: 'Full Name', value: formatDisplayValue(memberData.name || 'Unrecognized code') },
    { label: 'Registration Status', value: formatDisplayValue(isInvalidState ? 'Invalid' : isExpiredState ? 'Expired' : memberData.status || 'Valid') },
    { label: 'Role', value: formatDisplayValue(memberData.tag || 'Participant') },
    { label: 'Participant Code', value: formatDisplayValue(memberData.confirmationCode || memberData.membershipId) },
    { label: 'Track Registered', value: trackDisplayValue },
  ];

  return (
    <section className="verification-status-page">
      <div className={`status-container ${stateTone}`}>
        <div className="verification-message">
          <div className="success-icon" aria-hidden="true">{isInvalidState || isExpiredState ? '!' : '✓'}</div>
          <h2>
            {isInvalidState ? (
              <>
                <span className="member-name">This registration</span>
                <span className="is-verified"> could not be verified</span>
              </>
            ) : isExpiredState ? (
              <>
                <span className="member-name">{formatDisplayValue(memberData.name || 'This registration')}</span>
                <span className="is-verified"> is no longer valid</span>
              </>
            ) : (
              <>
                <span className="member-name">{formatDisplayValue(memberData.name)}</span>
                <span className="is-verified"> has a valid training registration</span>
              </>
            )}
          </h2>
          <p className="status-subtitle">
            {isInvalidState
              ? 'The registration cannot be confirmed. Please contact the training coordinator.'
              : isExpiredState
                ? 'This registration is no longer active. Please contact the training coordinator for support.'
                : 'This registration is valid for the Media Directors Empowerment Training. Training materials will be shared through the official training channel for the relevant track.'}
          </p>
          {memberData.reason ? <p className="status-subtitle">{formatDisplayValue(memberData.reason)}</p> : null}
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

        {!isInvalidState && !isExpiredState ? (
          <div className="materials-note">
            <h3>Training materials</h3>
            <p>
              {memberData.materialsUrl ? (
                <>
                  Open the Google Drive link below to download the materials for this track:
                  <br />
                  <a href={memberData.materialsUrl} target="_blank" rel="noreferrer">Open Google Drive materials</a>
                </>
              ) : (
                'Materials for this track will be made available to registered participants through the official training portal or the coordinator’s shared link.'
              )}
            </p>
          </div>
        ) : null}

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
