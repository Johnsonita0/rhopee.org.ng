import './SuccessPage.css';
import QRCode from 'qrcode.react';
import { useRef, useState } from 'react';

function SuccessPage({ data }) {
  const qrRef = useRef();
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

  // Download QR code
  const downloadQRCode = async () => {
    try {
      setIsDownloading(true);
      const element = qrRef.current.querySelector('svg');
      if (!element) {
        console.error('QR code SVG not found');
        return;
      }

      // Convert SVG to canvas then to PNG
      const svgData = new XMLSerializer().serializeToString(element);
      const canvas = document.createElement('canvas');
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `member-qr-${data.membership_id || data.membershipId}.png`;
        link.href = pngUrl;
        link.click();
        setIsDownloading(false);
      };

      img.src = url;
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

        <div className="qr-code-panel" ref={qrRef}>
          <h3>Member Verification QR Code</h3>
          <div className="qr-code-container">
            <QRCode
              value={qrData}
              level="H"
              size={256}
              includeMargin={true}
              renderAs="svg"
              quietZone={10}
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
