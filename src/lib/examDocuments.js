const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const downloadDocument = (filename, title, body) => {
  const documentHtml = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>body{font-family:Georgia,serif;color:#183b25;margin:48px;line-height:1.5}header{border-bottom:4px solid #168044;padding-bottom:18px;margin-bottom:28px}h1{margin:0;color:#0f5f2b;letter-spacing:.08em}h2{color:#7d2424}table{width:100%;border-collapse:collapse;margin:20px 0}td,th{border:1px solid #b8d5c0;padding:10px;text-align:left}th{background:#eaf7ee}.signature{margin-top:48px}</style></head><body>${body}</body></html>`;
  const blob = new Blob([documentHtml], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export function downloadExamReport(result, displayName) {
  const rows = (result.performance || []).map((entry, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(entry.question)}</td><td>${escapeHtml(entry.selected_answer || 'Not answered')}</td><td>${escapeHtml(entry.correct_answer)}</td><td>${entry.is_correct ? 'Correct' : 'Review'}</td></tr>`).join('');
  downloadDocument(`rhopee-exam-report-${result.result_token || result.id}.doc`, 'RHOPEE Exam Report', `<header><h1>RHOPEE</h1><div>Web Development CBT Examination</div></header><h2>Official Examination Report</h2><p><strong>Candidate:</strong> ${escapeHtml(displayName)}</p><p><strong>Completed:</strong> ${escapeHtml(new Date(result.completed_at).toLocaleString('en-NG'))}</p><table><tr><th>Score</th><th>Percentage</th><th>Status</th><th>Warnings</th><th>Completion</th></tr><tr><td>${result.score}/${result.total_questions}</td><td>${Number(result.percentage).toFixed(1)}%</td><td>${result.passed ? 'Passed' : 'Not passed'}</td><td>${result.warning_count || 0}</td><td>${escapeHtml(result.completion_reason || 'submitted')}</td></tr></table><h2>Question-by-question analysis</h2><table><tr><th>No.</th><th>Question</th><th>Candidate answer</th><th>Correct answer</th><th>Result</th></tr>${rows}</table><p class="signature">This report was generated from the RHOPEE examination system.</p>`);
}

export function downloadExamCertificate(result, displayName) {
  downloadDocument(`rhopee-certificate-${result.result_token || result.id}.doc`, 'RHOPEE Certificate', `<header><h1>RHOPEE</h1><div>Web Development Training Programme</div></header><h2>Certificate of Examination</h2><p>This certifies that</p><h1>${escapeHtml(displayName)}</h1><p>successfully completed the RHOPEE Web Development CBT examination.</p><table><tr><th>Score</th><th>Percentage</th><th>Completed</th></tr><tr><td>${result.score}/${result.total_questions}</td><td>${Number(result.percentage).toFixed(1)}%</td><td>${escapeHtml(new Date(result.completed_at).toLocaleDateString('en-NG'))}</td></tr></table><p class="signature">Issued by RHOPEE Administration</p>`);
}