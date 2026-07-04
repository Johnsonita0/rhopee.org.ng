function ResultCard({ scannedCode, result, loading, error }) {
  return (
    <section className="result-card">
      <h3>Verification result</h3>
      {loading && <p className="status-text">Verifying…</p>}
      {error && <p className="status-text error">{error}</p>}
      {!loading && !error && !scannedCode && <p>Scan an ID barcode to begin verification.</p>}
      {!loading && !error && scannedCode && result && (
        <div className="result-details">
          <p><strong>Scanned Code:</strong> {scannedCode}</p>
          <p><strong>ID Status:</strong> {result.status}</p>
          <p><strong>Name:</strong> {result.name}</p>
          <p><strong>Issued At:</strong> {result.issuedAt}</p>
        </div>
      )}
      {!loading && !error && scannedCode && !result && (
        <p>No verification result found for this barcode.</p>
      )}
    </section>
  );
}

export default ResultCard;
