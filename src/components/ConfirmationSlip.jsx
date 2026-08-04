import { useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import '../css/components/ConfirmationSlip.css';
import { encodeVerificationPayload } from '../lib/verificationPayload.js';

function ConfirmationSlip({ data }) {
  const getStoredMaterialsByTrack = () => {
    if (typeof window === 'undefined') {
      return {};
    }

    try {
      const storedValue = window.localStorage.getItem('rhopee_training_materials');
      return storedValue ? JSON.parse(storedValue) : {};
    } catch (error) {
      console.warn('Unable to read training materials links', error);
      return {};
    }
  };
  const handlePrint = () => {
    document.body.classList.add('printing-confirmation-slip');
    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => {
        document.body.classList.remove('printing-confirmation-slip');
      }, 500);
    }, 50);
  };

  const registrationDate = new Date().toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const locationLabel = [data.lga, data.ward].filter(Boolean).join(' - ');
  const trackLabel = data.trainingTrackName || data.trainingTrack || 'Training Track';
  const hasAdditionalDetails = Boolean(data.accommodationNeeded || data.dietary);
  const materialsUrl = data.materialsUrl || getStoredMaterialsByTrack()[data.trainingTrack] || '';

  const verificationUrl = useMemo(() => {
    const baseUrl = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://rhopee.org.ng';
    const payload = {
      name: data.fullName || '',
      tag: data.role || '',
      membershipId: data.confirmationCode || '',
      chapter: 'RHOPEE NEF Akwa Ibom State Chapter',
      issuedAt: new Date().toISOString(),
      expiresAt: '2026-09-05T23:59:59.000Z',
      status: 'Registered',
      outcome: 'verified',
      reason: 'Training registration verified',
      materialsUrl,
      trainingTrack: data.trainingTrack || '',
    };

    return `${baseUrl}/verifyme?data=${encodeVerificationPayload(payload)}`;
  }, [data.confirmationCode, data.fullName, data.role, data.trainingTrack, materialsUrl]);

  return (
    <div className="confirmation-slip-container">
      <div className="confirmation-slip">
        <div className="slip-header">
          <div className="slip-brand-block">
            <img src="/logo/logo1.jpeg" alt="RHOPEE" className="slip-logo" />
            <div className="slip-title">
              <h1>RHOPEE NEF</h1>
              <p>Akwa Ibom State Chapter</p>
              <span className="slip-badge">Official Registration Form</span>
            </div>
          </div>

          <div className="slip-meta">
            <p>Registration Date</p>
            <strong>{registrationDate}</strong>
            <p>Training Period</p>
            <strong>24 August – 5 September 2026</strong>
          </div>
        </div>

        <div className="slip-content">
          <div className="slip-section">
            <h2>Media Directors Empowerment Training</h2>
            <p className="slip-subtitle">Official participant registration confirmation and attendance record</p>
          </div>

          <div className="confirmation-code-box">
            <p className="code-label">Trainee Code</p>
            <p className="confirmation-code">{data.confirmationCode}</p>
            <p className="code-note">Keep this code for your records</p>
          </div>

          <div className="qr-section">
            <div className="qr-card">
              <div className="qr-code-wrap">
                <QRCodeSVG value={verificationUrl} size={130} level="M" includeMargin />
              </div>
              <div className="qr-content">
                <h3>Verification QR</h3>
                <p>Scan this code to verify the participant’s registration status.</p>
              </div>
            </div>
          </div>

          <div className="slip-summary">
            <div className="summary-panel">
              <h3>Participant Information</h3>
              <div className="slip-details">
                <div className="detail-group">
                  <label>Participant Name</label>
                  <p>{data.fullName}</p>
                </div>

                <div className="detail-group">
                  <label>Email Address</label>
                  <p>{data.email}</p>
                </div>

                <div className="detail-group">
                  <label>Phone Number</label>
                  <p>{data.phone}</p>
                </div>

                <div className="detail-group">
                  <label>Role</label>
                  <p>{data.role}</p>
                </div>

                <div className="detail-group">
                  <label>Location</label>
                  <p>{locationLabel || 'To be confirmed'}</p>
                </div>

                <div className="detail-group">
                  <label>Training Track</label>
                  <p>{trackLabel}</p>
                </div>
              </div>
            </div>

            <div className="summary-panel">
              <h3>Training & Logistics</h3>
              <div className="slip-details">
                <div className="detail-group">
                  <label>Training Period</label>
                  <p>24 August – 5 September 2026</p>
                </div>

                <div className="detail-group">
                  <label>Daily Schedule</label>
                  <p>9:00 AM - Closing Time</p>
                </div>

                <div className="detail-group">
                  <label>Accommodation</label>
                  <p>{data.accommodationNeeded ? 'Requested' : 'Not requested'}</p>
                </div>

                <div className="detail-group">
                  <label>Dietary Preference</label>
                  <p>{data.dietary || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {materialsUrl ? (
            <div className="slip-notice">
              <h3>Training Materials</h3>
              <p>Download the materials for this track here:</p>
              <a href={materialsUrl} target="_blank" rel="noreferrer" className="materials-link">
                Open Google Drive materials for {trackLabel}
              </a>
            </div>
          ) : null}

          <div className="declaration-box">
            <h3>Declaration</h3>
            <p>I confirm that the information provided above is true and accurate to the best of my knowledge and that I will attend the training in line with RHOPEE NEF guidelines.</p>
            <div className="signature-row">
              <div className="signature-block">
                <span>Participant Signature</span>
                <div className="signature-line" />
              </div>
              <div className="signature-block">
                <span>Official Stamp</span>
                <div className="signature-line stamp-line" />
              </div>
            </div>
          </div>

          {hasAdditionalDetails && (
            <div className="slip-notice">
              <h3>Additional Notes</h3>
              <ul>
                {data.accommodationNeeded ? <li>Accommodation has been requested for the training period.</li> : null}
                {data.dietary ? <li>Dietary preference: {data.dietary}</li> : null}
              </ul>
            </div>
          )}

          <div className="slip-notice">
            <h3>Attendance Requirements</h3>
            <ul>
              <li>Please arrive 15 minutes before the scheduled training time</li>
              <li>Bring a valid form of identification for attendance verification</li>
              <li>Review all logistics shared by the organizing team before arrival</li>
              <li>Comply with the training conduct and participation guidelines</li>
            </ul>
          </div>

          <div className="slip-footer">
            <p>© 2026 RHOPEE NEF Akwa Ibom State Chapter | Media Directors Empowerment Training</p>
            <p className="slip-contact">For assistance: contact@rhopee.org.ng | +234 800 0000 000</p>
          </div>
        </div>

        <button type="button" className="print-button" onClick={handlePrint}>
          🖨️ Print Confirmation Slip
        </button>
      </div>
    </div>
  );
}

export default ConfirmationSlip;
