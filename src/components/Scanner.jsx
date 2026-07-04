import { useState } from 'react';
import './Scanner.css';

function Scanner({ onScan }) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!inputValue.trim()) return;
    onScan(inputValue.trim());
    setInputValue('');
  };

  return (
    <section className="scanner-panel">
      <h3>Barcode input</h3>
      <p>Paste or type the scanned barcode value from the ID card.</p>
      <form onSubmit={handleSubmit} className="scanner-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter scanned barcode value"
          aria-label="Scanned barcode value"
        />
        <button type="submit">Verify ID</button>
      </form>
    </section>
  );
}

export default Scanner;
