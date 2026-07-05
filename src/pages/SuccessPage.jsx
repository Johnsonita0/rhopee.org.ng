import '../css/pages/SuccessPage.css';
import { QRCodeSVG } from 'qrcode.react';
import { useRef, useState } from 'react';
import { buildScannableQrValue } from '../lib/verificationPayload.js';

function SuccessPage({ data }) {
  const qrCodeRef = useRef();
  const [isDownloading, setIsDownloading] = useState(false);

  const qrPayload = {
    membershipId: data.membership_id || data.membershipId,
    name: data.name || data.fullName,
    tag: data.tag || data.position || 'Member',
    chapter: data.chapter,
    issuedAt: data.issued_at || data.issuedAt,
    expiresAt: data.expires_at || data.expiresAt,
    status: 'verified'
  };

  const qrSize = 200;
  const qrData = buildScannableQrValue({
    barcode: data.barcode,
    membershipId: data.membership_id || data.membershipId,
    id: data.id,
  }) || `${window.location.origin}/verifyme?data=${encodeURIComponent(JSON.stringify(qrPayload))}`;

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

      const width = parseInt(svg.getAttribute('width') || qrSize, 10) || qrSize;
      const height = parseInt(svg.getAttribute('height') || qrSize, 10) || qrSize;
      const scale = 2;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      const clonedSvg = svg.cloneNode(true);
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clonedSvg.setAttribute('width', width);
      clonedSvg.setAttribute('height', height);
      const svgData = new XMLSerializer().serializeToString(clonedSvg);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);

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
          <div className="qr-code-container" ref={qrCodeRef}>
            <div className="qr-code-frame">
              <div className="qr-code-badge">RHOPEE</div>
              <QRCodeSVG
                value={qrData}
                level="H"
                size={240}
                includeMargin={true}
                bgColor="#ffffff"
                fgColor="#0f5f2b"
              />
            </div>
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
