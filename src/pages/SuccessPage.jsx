import '../css/pages/SuccessPage.css';
import { QRCodeSVG } from 'qrcode.react';
import { useRef, useState } from 'react';

function SuccessPage({ data }) {
  const qrCodeRef = useRef();
  const [isDownloading, setIsDownloading] = useState(false);

  // Create a URL-based QR payload so scanners display a clickable link
  const qrPayload = {
    membershipId: data.membership_id || data.membershipId,
    name: data.name || data.fullName,
    tag: data.tag || data.position || 'Member',
    chapter: data.chapter,
    issuedAt: data.issued_at || data.issuedAt,
    expiresAt: data.expires_at || data.expiresAt,
    status: 'verified'
  };

  const qrData = `${window.location.origin}/verifyme?data=${encodeURIComponent(JSON.stringify(qrPayload))}`;

  // Download QR code as PNG
  const downloadQRCode = () => {
    try {
      setIsDownloading(true);
      if (!qrCodeRef.current) {
        console.error('QR code ref not found');
        setIsDownloading(false);
        return;
      }
      
      const svg = qrCodeRef.current.querySelector('svg');
      if (!svg) {
        console.error('SVG element not found');
        setIsDownloading(false);
        return;
      }

      // Convert SVG to canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        // Download PNG
        const link = document.createElement('a');
        link.download = `member-qr-${data.membership_id || data.membershipId}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsDownloading(false);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        console.error('Error loading SVG image');
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
            <strong>Tag/Position</strong>
            <p>{data.tag || data.position}</p>
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
            <QRCodeSVG
              ref={qrCodeRef}
              value={qrData}
              level="H"
              size={256}
              includeMargin={true}
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
