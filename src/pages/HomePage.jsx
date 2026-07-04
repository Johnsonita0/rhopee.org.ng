import Banner from '../components/Banner.jsx';
import Scanner from '../components/Scanner.jsx';
import ResultCard from '../components/ResultCard.jsx';

function HomePage({ scannedCode, verificationResult, loading, error, onScan }) {
  return (
    <main id="home" className="page-content">
      <Banner />
      <Scanner onScan={onScan} />
      <ResultCard
        scannedCode={scannedCode}
        result={verificationResult}
        loading={loading}
        error={error}
      />
    </main>
  );
}

export default HomePage;
