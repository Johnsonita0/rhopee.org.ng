import './ResultCard.css';

function ResultCard({ scannedCode, result, loading, error }) {
  return (
    <section className="result-card">
      <div className="result-heading">
        <h3>Verification result</h3>
        {result && <span className="verified-badge">Member verified</span>}
      </div>

      {loading && <p className="status-text">Verifying…</p>}
      {error && <p className="status-text error">{error}</p>}
      {!loading && !error && !scannedCode && <p>Scan an ID barcode to begin verification.</p>}

      {!loading && !error && scannedCode && result && (
        <div className="result-details">
          <p><strong>Scanned Code:</strong> {scannedCode}</p>
          <p><strong>Name:</strong> {result.name}</p>
          <p><strong>Tag/Position:</strong> {result.tag || result.position || 'Member'}</p>
          <p><strong>Chapter:</strong> {result.chapter || 'N/A'}</p>
          <p><strong>Membership ID:</strong> {result.membershipId || 'N/A'}</p>
          <p><strong>ID Status:</strong> {result.status}</p>
          <p><strong>Issued At:</strong> {result.issuedAt}</p>
          <p><strong>Expires At:</strong> {result.expiresAt}</p>
        </div>
      )}

      {!loading && !error && scannedCode && !result && (
        <p>No verification result found for this barcode.</p>
      )}
    </section>
  );
}

export default ResultCard;
