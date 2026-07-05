import './SuccessPage.css';
import QRCode from 'qrcode.react';
import { useRef, useState } from 'react';

function SuccessPage({ data }) {
  const qrCodeRef = useRef();
  const [isDownloading, setIsDownloading] = useState(false);

  // Create QR code data - encodes member information for verification
  const qrData = JSON.stringify({
    membershipId: data.membership_id || data.membershipId,
    name: data.name || data.fullName,
    chapter: data.chapter,
    issuedAt: data.issued_at || data.issuedAt,
    expiresAt: data.expires_at || data.expiresAt,
    status: 'verified'
  });

  // Download QR code as PNG
  const downloadQRCode = () => {
    try {
      setIsDownloading(true);
      if (!qrCodeRef.current) {
        console.error('QR code ref not found');
        return;
      }
      
      const url = qrCodeRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `member-qr-${data.membership_id || data.membershipId}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsDownloading(false);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      setIsDownloading(false);
    }
  };

  return (
    <section className="success-page">
      <div className="success-card">
        <div className="success-head">
          <span className="badge verified">Member verified</span>
          <h2>Registration complete</h2>
          <p>{data.name || data.fullName} has been registered successfully as a verified member.</p>
        </div>

        <div className="success-details">
          <div>
            <strong>Name</strong>
            <p>{data.name || data.fullName}</p>
          </div>
          <div>
            <strong>Position</strong>
            <p>{data.position}</p>
          </div>
          <div>
            <strong>Membership ID</strong>
            <p>{data.membership_id || data.membershipId}</p>
          </div>
          <div>
            <strong>Chapter</strong>
            <p>{data.chapter}</p>
          </div>
          <div>
            <strong>Local Government</strong>
            <p>{data.local_government || data.localGovernment}</p>
          </div>
          
          <div>
            <strong>Issued</strong>
            <p>{data.issued_at || data.issuedAt}</p>
          </div>
          <div>
            <strong>Expires</strong>
            <p>{data.expires_at || data.expiresAt}</p>
          </div>
        </div>

        <div className="qr-code-panel">
          <h3>Member Verification QR Code</h3>
          <div className="qr-code-container">
            <QRCode
              ref={qrCodeRef}
              value={qrData}
              level="H"
              size={256}
              includeMargin={true}
              renderAs="canvas"
            />
          </div>
          <p className="qr-label">Scan this QR code to verify member details</p>
          <button 
            className="download-qr-btn" 
            onClick={downloadQRCode}
            disabled={isDownloading}
          >
            {isDownloading ? 'Downloading...' : 'Download QR Code'}
          </button>
        </div>

        <div className="barcode-panel">
          <div className="barcode-placeholder">{data.barcode}</div>
          <p className="barcode-label">Scan code to verify this member</p>
        </div>
      </div>
    </section>
  );
}

export default SuccessPage;
