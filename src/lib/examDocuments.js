import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QRCodeSVG } from 'qrcode.react';

const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = src;
});

const safeFilePart = (value) => String(value || 'exam').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();

const downloadPdf = (filename, jpegDataUrl, width, height) => {
  const base64 = jpegDataUrl.split(',')[1];
  const imageBytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
  const encoder = new TextEncoder();
  const chunks = [encoder.encode('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n')];
  const offsets = [0];
  let length = chunks[0].length;
  const addObject = (number, header, body, binary = null) => {
    offsets[number] = length;
    const start = encoder.encode(`${number} 0 obj\n${header}\n`).length;
    const end = encoder.encode('\nendobj\n').length;
    const objectBytes = binary ? [encoder.encode(`${number} 0 obj\n${header}\n`), binary, encoder.encode('\nendstream\nendobj\n')] : [encoder.encode(`${number} 0 obj\n${body}\nendobj\n`)];
    objectBytes.forEach((chunk) => { chunks.push(chunk); length += chunk.length; });
    return start + end;
  };
  addObject(1, '', '<< /Type /Catalog /Pages 2 0 R >>');
  addObject(2, '', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  addObject(3, '', `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>`);
  addObject(4, `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream`, null, imageBytes);
  const content = `q\n${width} 0 0 ${height} 0 0 cm\n/Im1 Do\nQ`;
  addObject(5, '', `<< /Length ${encoder.encode(content).length} >>\nstream\n${content}\nendstream`);
  const xref = length;
  const entries = [offsets[0], offsets[1], offsets[2], offsets[3], offsets[4], offsets[5]].map((offset) => String(offset).padStart(10, '0') + ' 00000 n ').join('\n');
  chunks.push(encoder.encode(`xref\n0 6\n0000000000 65535 f \n${entries}\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`));
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob(chunks, { type: 'application/pdf' }));
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
};

const roundedRect = (context, x, y, width, height, radius) => {
  if (typeof context.roundRect === 'function') {
    context.roundRect(x, y, width, height, radius);
    return;
  }
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
};

const qrDataUrl = async (value, size) => {
  const svg = renderToStaticMarkup(createElement(QRCodeSVG, { value, size, level: 'H', includeMargin: true }));
  const image = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  canvas.getContext('2d').drawImage(image, 0, 0, size, size);
  return canvas.toDataURL('image/png');
};

export async function downloadExamReport(result, displayName) {
  const canvas = document.createElement('canvas');
  canvas.width = 1240;
  canvas.height = Math.max(1754, 500 + (result.performance || []).length * 105);
  const context = canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#0f5f2b';
  context.font = 'bold 42px Georgia';
  context.fillText('RHOPEE / NEF', 70, 90);
  context.font = '24px Georgia';
  context.fillText('Web Development CBT Examination Report', 70, 135);
  context.fillStyle = '#183b25';
  context.font = '22px Georgia';
  context.fillText(`Candidate: ${displayName}`, 70, 205);
  context.fillText(`Score: ${result.score}/${result.total_questions}   Percentage: ${Number(result.percentage).toFixed(1)}%   Status: ${result.passed ? 'Passed' : 'Not passed'}`, 70, 245);
  let y = 320;
  (result.performance || []).forEach((entry, index) => {
    context.font = 'bold 18px Georgia';
    context.fillText(`${index + 1}. ${entry.question}`, 70, y);
    context.font = '16px Georgia';
    context.fillText(`Answer: ${entry.selected_answer || 'Not answered'}`, 90, y + 30);
    context.fillText(`Correct: ${entry.correct_answer}`, 90, y + 56);
    context.fillStyle = entry.is_correct ? '#176b38' : '#9c3030';
    context.fillText(entry.is_correct ? 'Correct' : 'Review', 90, y + 82);
    context.fillStyle = '#183b25';
    y += 105;
  });
  downloadPdf(`rhopee-exam-report-${safeFilePart(displayName)}.pdf`, canvas.toDataURL('image/jpeg', .94), canvas.width, canvas.height);
}

export async function downloadExamCertificate(result, displayName) {
  const certificateName = result.certificate_name || displayName;
  const certificateNumber = result.certificate_number || `RHOPEE/WD/2026/${String(result.result_token || result.id).slice(0, 6).toUpperCase()}`;
  const issueDate = result.certificate_issue_date || new Date(result.completed_at).toLocaleDateString('en-NG');
  const verifierUrl = `${window.location.origin}/certificate-verify?token=${encodeURIComponent(result.result_token)}`;
  const [background, qrImage] = await Promise.all([loadImage('/cert/cert.jpeg'), qrDataUrl(verifierUrl, 360)]);
  const canvas = document.createElement('canvas');
  canvas.width = 1152;
  canvas.height = 768;
  const context = canvas.getContext('2d');
  context.drawImage(background, 0, 0, 1152, 768);
  const cardX = 58;
  const cardY = 320;
  const cardWidth = 226;
  const cardHeight = 250;
  const cardRadius = 16;
  context.fillStyle = '#fffefa';
  context.beginPath();
  roundedRect(context, cardX, cardY, cardWidth, cardHeight, cardRadius);
  context.fill();
  context.strokeStyle = '#b88732';
  context.lineWidth = 2.5;
  context.stroke();
  context.strokeStyle = 'rgba(184, 135, 50, .38)';
  context.lineWidth = 1;
  context.beginPath();
  roundedRect(context, cardX + 6, cardY + 6, cardWidth - 12, cardHeight - 12, 11);
  context.stroke();
  context.fillStyle = '#123d2a';
  context.beginPath();
  roundedRect(context, cardX + 2, cardY + 2, cardWidth - 4, 35, 13);
  context.fill();
  context.fillStyle = '#f3d28a';
  context.font = 'bold 10px Georgia, Times New Roman, serif';
  context.textAlign = 'center';
  context.fillText('CERTIFICATE DETAILS', cardX + cardWidth / 2, cardY + 24);
  const drawCardRow = (label, value, top, fontSize = 12, separator = true) => {
    context.fillStyle = '#9a7028';
    context.font = 'bold 8px Arial, sans-serif';
    context.textAlign = 'left';
    context.fillText(label.toUpperCase(), cardX + 19, top + 15);
    context.fillStyle = '#123d2a';
    context.font = `bold ${fontSize}px Georgia, Times New Roman, serif`;
    const maxWidth = cardWidth - 38;
    const words = String(value).split(' ');
    const lines = [];
    let currentLine = '';
    words.forEach((word) => {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (currentLine && context.measureText(candidate).width > maxWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = candidate;
      }
    });
    if (currentLine) lines.push(currentLine);
    lines.slice(0, 2).forEach((line, index) => context.fillText(line, cardX + 19, top + 34 + (index * 13)));
    if (separator) {
      context.strokeStyle = '#dfc98d';
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(cardX + 19, top + 57);
      context.lineTo(cardX + cardWidth - 19, top + 57);
      context.stroke();
    }
  };
  drawCardRow('Course', result.certificate_course || 'Professional Web Development', cardY + 42, 11);
  drawCardRow('Certificate number', certificateNumber, cardY + 100, 9);
  drawCardRow('Date of issue', issueDate, cardY + 158, 10, false);
  context.fillStyle = '#0f2d1f';
  context.textAlign = 'center';
  context.font = 'italic 600 26px Georgia, Times New Roman, serif';
  context.fillText(certificateName, 576, 345);
  const qr = await loadImage(qrImage);
  context.drawImage(qr, 936, 348, 126, 126);
  downloadPdf(`rhopee-certificate-${safeFilePart(certificateName)}.pdf`, canvas.toDataURL('image/jpeg', .95), 1152, 768);
}
