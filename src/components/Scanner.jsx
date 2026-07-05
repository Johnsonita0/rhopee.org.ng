import { useState } from 'react';
import './Scanner.css';

function Scanner({ onScan }) {
  const [inputValue, setInputValue] = useState('');
  const [parsedQRData, setParsedQRData] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!inputValue.trim()) return;
    
    // Try to parse as JSON (QR code data)
    try {
      const parsed = JSON.parse(inputValue.trim());
      if (parsed.membershipId && parsed.name) {
        // Valid QR code data
        setParsedQRData(parsed);
        return;
      }
    } catch (e) {
      // Not JSON, treat as barcode
    }
    
    // Regular barcode scan
    onScan(inputValue.trim());
    setInputValue('');
    setParsedQRData(null);
  };

  const handleVerifyQR = () => {
    if (parsedQRData) {
      onScan(JSON.stringify(parsedQRData));
      setInputValue('');
      setParsedQRData(null);
    }
  };

  return (
    <section className="scanner-panel">
      <h3>Scan Member ID</h3>
      <p>Scan a QR code or paste a barcode value from the ID card.</p>
      
      {!parsedQRData ? (
        <form onSubmit={handleSubmit} className="scanner-form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Scan barcode or QR code here..."
            aria-label="Scanned barcode or QR code value"
            autoFocus
          />
          <button type="submit">Verify ID</button>
        </form>
      ) : (
        <div className="qr-result">
          <div className="qr-parsed-data">
            <h4>QR Code Detected ✓</h4>
            <div className="member-preview">
              <p><strong>{parsedQRData.name}</strong></p>
              <p>{parsedQRData.tag || 'Member'}</p>
              <p className="membership-id">{parsedQRData.membershipId}</p>
            </div>
          </div>
          <button onClick={handleVerifyQR} className="verify-btn">
            View Verification →
          </button>
          <button 
            onClick={() => {
              setParsedQRData(null);
              setInputValue('');
            }} 
            className="cancel-btn"
          >
            Scan Another
          </button>
        </div>
      )}
    </section>
  );
}

export default Scanner;
