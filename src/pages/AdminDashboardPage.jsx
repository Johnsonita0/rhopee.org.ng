import { useEffect, useMemo, useState } from 'react';
import '../css/pages/AdminDashboardPage.css';
import ConfirmationSlip from '../components/ConfirmationSlip.jsx';
import { getAllTrainingRegistrations } from '../lib/supabaseClient.js';

const trackLabels = {
  cinematography: 'Cinematography',
  photography: 'Photography',
  webdev: 'Web Development',
};

function formatDate(value) {
  if (!value) {
    return '—';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function AdminDashboardPage({ onLogout }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [selectedForPrint, setSelectedForPrint] = useState([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [materialsByTrack, setMaterialsByTrack] = useState({
    cinematography: '',
    photography: '',
    webdev: '',
  });
  const [materialsMessage, setMaterialsMessage] = useState('');

  const escapeHtml = (value = '') =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const openPreviewModal = () => {
    if (selectedRegistration) {
      setIsPreviewOpen(true);
    }
  };

  const closePreviewModal = () => {
    setIsPreviewOpen(false);
  };

  const printSelectedSheet = () => {
    const registrationsToPrint = selectedForPrint.length ? selectedForPrint : selectedRegistration ? [selectedRegistration] : [];

    if (!registrationsToPrint.length) {
      return;
    }

    const printWindow = window.open('', '_blank', 'width=900,height=900');
    if (!printWindow) {
      return;
    }

    const generatedAt = new Date().toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const sheetsMarkup = registrationsToPrint
      .map((registration) => {
        const detailRows = [
          ['Full Name', registration.full_name || '—'],
          ['Email Address', registration.email || '—'],
          ['Phone Number', registration.phone || '—'],
          ['Role', registration.role || '—'],
          ['Local Government Area', registration.lga || '—'],
          ['Ward', registration.ward || '—'],
          ['Training Track', registration.training_track_name || trackLabels[registration.training_track] || registration.training_track || '—'],
          ['Accommodation Required', registration.accommodation_needed ? 'Yes' : 'No'],
          ['Dietary Preference', registration.dietary_preferences || 'Not provided'],
          ['Confirmation Code', registration.confirmation_code || '—'],
          ['Registration Status', registration.status || 'Registered'],
          ['Submitted On', formatDate(registration.created_at)],
        ];

        const detailMarkup = detailRows
          .map(
            ([label, value]) => `
              <tr>
                <th>${escapeHtml(label)}</th>
                <td>${escapeHtml(value)}</td>
              </tr>
            `,
          )
          .join('');

        return `
          <div class="sheet">
            <header class="sheet-header">
              <div class="brand">
                <img src="/logo/logo1.jpeg" alt="RHOPEE logo" />
                <div>
                  <h1>RHOPEE NEF</h1>
                  <p>Akwa Ibom State Chapter</p>
                </div>
              </div>
              <div class="sheet-meta">
                <span>Official Registration Record</span>
                <strong>${escapeHtml(registration.full_name || 'Participant')}</strong>
              </div>
            </header>
            <section class="sheet-title">
              <h2>Media Directors Empowerment Training</h2>
              <p>Official participant registration and attendance record</p>
            </section>
            <div class="sheet-note">
              <span>Prepared on ${escapeHtml(generatedAt)}</span>
              <span>Training period: 24 August – 5 September 2026</span>
            </div>
            <div class="sheet-grid">
              <div class="sheet-card">
                <h3>Participant Details</h3>
                <table class="sheet-table">
                  <tbody>${detailMarkup}</tbody>
                </table>
              </div>
              <div class="sheet-card">
                <h3>Training Logistics</h3>
                <table class="sheet-table">
                  <tbody>
                    <tr><th>Training Track</th><td>${escapeHtml(registration.training_track_name || trackLabels[registration.training_track] || registration.training_track || '—')}</td></tr>
                    <tr><th>Accommodation</th><td>${escapeHtml(registration.accommodation_needed ? 'Requested' : 'Not requested')}</td></tr>
                    <tr><th>Dietary Preference</th><td>${escapeHtml(registration.dietary_preferences || 'Not provided')}</td></tr>
                    <tr><th>Location</th><td>${escapeHtml([registration.lga, registration.ward].filter(Boolean).join(' / ') || 'To be confirmed')}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="declaration">
              <p>I confirm that the information provided above is accurate and complete to the best of my knowledge.</p>
              <div class="signature-row">
                <div class="signature-block">
                  <span>Participant Signature</span>
                  <div class="signature-line"></div>
                </div>
                <div class="signature-block">
                  <span>Official Stamp</span>
                  <div class="signature-line stamp-line"></div>
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join('<div class="page-break"></div>');

    printWindow.document.write(`
      <html>
        <head>
          <title>Registration Sheets</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #1d3c1a; background: #fff; }
            .sheet { border: 1px solid #dbe8de; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(15, 95, 43, 0.05); }
            .sheet-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 16px; border-bottom: 2px solid #0f5f2b; margin-bottom: 16px; }
            .brand { display: flex; gap: 12px; align-items: center; }
            .brand img { width: 54px; height: 54px; border-radius: 10px; }
            .brand h1 { margin: 0; font-size: 1.2rem; color: #0f5f2b; }
            .brand p { margin: 2px 0 0; color: #4c6d55; }
            .sheet-meta { text-align: right; color: #4c6d55; }
            .sheet-meta strong { display: block; color: #0f5f2b; margin-top: 4px; }
            .sheet-title { text-align: center; margin-bottom: 12px; }
            .sheet-title h2 { margin: 0 0 4px; color: #0f5f2b; }
            .sheet-title p { margin: 0; color: #4c6d55; }
            .sheet-note { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; font-size: 12px; color: #4c6d55; margin-bottom: 14px; }
            .sheet-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 16px; }
            .sheet-card { border: 1px solid #e1ece3; border-radius: 12px; padding: 12px; }
            .sheet-card h3 { margin-top: 0; color: #0f5f2b; font-size: 0.95rem; }
            .sheet-table { width: 100%; border-collapse: collapse; font-size: 12px; }
            .sheet-table th, .sheet-table td { border: 1px solid #dbe8de; padding: 8px; text-align: left; vertical-align: top; }
            .sheet-table th { background: #eaf7ee; width: 38%; }
            .declaration { margin-top: 16px; padding: 12px; border-radius: 10px; background: #f8fbf8; border: 1px solid #e1ece3; }
            .signature-row { display: flex; gap: 16px; margin-top: 14px; }
            .signature-block { flex: 1; }
            .signature-line { border-bottom: 1px solid #0f5f2b; height: 28px; margin-top: 6px; }
            .stamp-line { border-bottom: 2px dotted #0f5f2b; }
            .page-break { page-break-after: always; height: 0; }
          </style>
        </head>
        <body>${sheetsMarkup}</body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const toggleRegistrationSelection = (registrationId) => {
    setSelectedForPrint((current) => {
      if (current.includes(registrationId)) {
        return current.filter((id) => id !== registrationId);
      }

      return [...current, registrationId];
    });
  };

  const printAllRegistrations = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=900');
    if (!printWindow) {
      return;
    }

    const generatedAt = new Date().toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const rows = registrations.map((registration) => [
      registration.full_name || '—',
      registration.role || '—',
      [registration.lga, registration.ward].filter(Boolean).join(' / ') || '—',
      registration.training_track_name || trackLabels[registration.training_track] || registration.training_track || '—',
      registration.confirmation_code || '—',
      registration.status || 'registered',
    ]);

    const tableMarkup = rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>All Registrations</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #1d3c1a; background: #fff; }
            .sheet { border: 1px solid #dbe8de; border-radius: 16px; padding: 24px; }
            .sheet-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 12px; border-bottom: 2px solid #0f5f2b; margin-bottom: 12px; }
            .brand { display: flex; gap: 12px; align-items: center; }
            .brand img { width: 48px; height: 48px; border-radius: 10px; }
            .brand h1 { margin: 0; font-size: 1.05rem; color: #0f5f2b; }
            .brand p { margin: 2px 0 0; color: #4c6d55; font-size: 0.9rem; }
            .sheet-meta { text-align: right; color: #4c6d55; font-size: 0.95rem; }
            .sheet-title { margin: 12px 0 10px; color: #0f5f2b; font-size: 1.1rem; font-weight: 700; }
            .sheet-note { color: #4c6d55; font-size: 0.9rem; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
            td, th { border: 1px solid #d9e7dc; padding: 8px; text-align: left; }
            th { background: #eaf7ee; }
          </style>
        </head>
        <body>
          <div class="sheet">
            <header class="sheet-header">
              <div class="brand">
                <img src="/logo/logo1.jpeg" alt="RHOPEE logo" />
                <div>
                  <h1>RHOPEE NEF</h1>
                  <p>Akwa Ibom State Chapter</p>
                </div>
              </div>
              <div class="sheet-meta">
                <div>Official Registration Summary</div>
                <strong>${escapeHtml(generatedAt)}</strong>
              </div>
            </header>
            <div class="sheet-title">Media Directors Empowerment Training</div>
            <div class="sheet-note">A formal summary of all registered participants for the training programme.</div>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Location</th>
                  <th>Track</th>
                  <th>Code</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>${tableMarkup}</tbody>
            </table>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedMaterials = window.localStorage.getItem('rhopee_training_materials');
        if (storedMaterials) {
          const parsedMaterials = JSON.parse(storedMaterials);
          setMaterialsByTrack((current) => ({ ...current, ...parsedMaterials }));
        }
      } catch (storageError) {
        console.warn('Unable to load saved training materials', storageError);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadRegistrations() {
      try {
        setLoading(true);
        setError('');
        const { data, error: fetchError } = await getAllTrainingRegistrations();

        if (!isMounted) {
          return;
        }

        if (fetchError) {
          throw fetchError;
        }

        setRegistrations(data || []);
        if (data?.length) {
          setSelectedRegistration((currentSelection) => {
            if (currentSelection && data.some((entry) => entry.id === currentSelection.id)) {
              return currentSelection;
            }
            return data[0];
          });
        }
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }
        console.error(fetchError);
        setError(fetchError.message || 'Unable to load registrations.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadRegistrations();

    const handleRegistrationsUpdated = () => {
      loadRegistrations();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('rhopee:registrations-updated', handleRegistrationsUpdated);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('rhopee:registrations-updated', handleRegistrationsUpdated);
      }
    };
  }, []);

  const saveMaterialsLinks = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('rhopee_training_materials', JSON.stringify(materialsByTrack));
      setMaterialsMessage('Training materials links saved.');
    }
  };

  const selectedSlipData = useMemo(() => {
    if (!selectedRegistration) {
      return null;
    }

    return {
      fullName: selectedRegistration.full_name || '',
      email: selectedRegistration.email || '',
      phone: selectedRegistration.phone || '',
      role: selectedRegistration.role || '',
      lga: selectedRegistration.lga || '',
      ward: selectedRegistration.ward || '',
      trainingTrackName: selectedRegistration.training_track_name || trackLabels[selectedRegistration.training_track] || selectedRegistration.training_track || 'Training Track',
      confirmationCode: selectedRegistration.confirmation_code || '',
      accommodationNeeded: Boolean(selectedRegistration.accommodation_needed),
      dietary: selectedRegistration.dietary_preferences || '',
      materialsUrl: materialsByTrack[selectedRegistration.training_track] || '',
      trainingTrack: selectedRegistration.training_track || '',
    };
  }, [materialsByTrack, selectedRegistration]);

  return (
    <section className="admin-dashboard-page">
      <div className="admin-dashboard-shell">
        <div className="admin-dashboard-header">
          <div>
            <p className="admin-eyebrow">Admin Control Panel</p>
            <h1>Training registrations</h1>
            <p className="admin-subtitle">Review every participant registration and print a neatly formatted confirmation slip.</p>
          </div>
          <button type="button" className="admin-logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>

        <div className="admin-materials-card">
          <div className="admin-materials-card-header">
            <div>
              <p className="admin-eyebrow">Track materials</p>
              <h2>Upload training materials links</h2>
              <p className="admin-subtitle">Add a download link for each training track so it appears when a participant’s QR code is scanned.</p>
            </div>
            <button type="button" className="admin-action-btn" onClick={saveMaterialsLinks}>Save links</button>
          </div>

          <div className="materials-grid">
            {Object.entries(materialsByTrack).map(([trackId, url]) => (
              <label key={trackId} className="materials-field">
                <span>{trackLabels[trackId] || trackId}</span>
                <input
                  type="url"
                  value={url}
                  onChange={(event) => setMaterialsByTrack((current) => ({ ...current, [trackId]: event.target.value }))}
                  placeholder="https://example.com/materials"
                />
              </label>
            ))}
          </div>

          {materialsMessage ? <p className="materials-message">{materialsMessage}</p> : null}
        </div>

        <div className="admin-metrics">
          <div className="admin-metric-card">
            <span>Total registered</span>
            <strong>{registrations.length}</strong>
          </div>
          <div className="admin-metric-card">
            <span>Needs accommodation</span>
            <strong>{registrations.filter((row) => row.accommodation_needed).length}</strong>
          </div>
          <div className="admin-metric-card">
            <span>Confirmed codes</span>
            <strong>{registrations.filter((row) => row.confirmation_code).length}</strong>
          </div>
        </div>

        {loading ? (
          <div className="admin-state-card">Loading registrations…</div>
        ) : error ? (
          <div className="admin-state-card form-error">{error}</div>
        ) : registrations.length === 0 ? (
          <div className="admin-state-card">No registrations have been submitted yet.</div>
        ) : (
          <div className="admin-grid">
            <div className="admin-table-card">
              <div className="table-toolbar">
                <div className="table-toolbar-copy">
                  <h2>Registered participants</h2>
                  <p>Manage participant records and prepare registration documents from one place.</p>
                </div>
                <div className="table-actions">
                  <button type="button" className="admin-action-btn" onClick={printAllRegistrations}>
                    Print all sheet
                  </button>
                  <button type="button" className="admin-action-btn secondary" onClick={openPreviewModal} disabled={!selectedRegistration}>
                    Preview slip
                  </button>
                  <button type="button" className="admin-action-btn secondary" onClick={printSelectedSheet} disabled={!selectedRegistration && !selectedForPrint.length}>
                    Print selected sheet
                  </button>
                </div>
              </div>

              {selectedRegistration ? (
                <div className="selected-summary-banner">
                  <div className="selected-summary-banner-info">
                    <p className="admin-eyebrow">Selected participant</p>
                    <h3>{selectedRegistration.full_name}</h3>
                    <p>{selectedRegistration.email || '—'} • {selectedRegistration.phone || '—'}</p>
                  </div>
                  <div className="selected-summary-banner-meta">
                    <span>Track: {selectedRegistration.training_track_name || trackLabels[selectedRegistration.training_track] || selectedRegistration.training_track || '—'}</span>
                    <span>Code: {selectedRegistration.confirmation_code || '—'}</span>
                  </div>
                </div>
              ) : (
                <div className="selected-summary-banner empty">
                  <div className="selected-summary-banner-info">
                    <p className="admin-eyebrow">Selected participant</p>
                    <h3>Select a registration</h3>
                    <p>Choose a participant from the table to view their key details here.</p>
                  </div>
                </div>
              )}

              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="selection-column-header">
                        <input
                          type="checkbox"
                          aria-label="Select all registrations"
                          checked={registrations.length > 0 && selectedForPrint.length === registrations.length}
                          onChange={(event) => {
                            if (event.target.checked) {
                              setSelectedForPrint(registrations.map((registration) => registration.id));
                            } else {
                              setSelectedForPrint([]);
                            }
                          }}
                        />
                      </th>
                      <th>Name</th>
                      <th>Contact</th>
                      <th>Role</th>
                      <th>Location</th>
                      <th>Track</th>
                      <th>Code</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((registration) => (
                      <tr
                        key={registration.id}
                        className={selectedRegistration?.id === registration.id ? 'selected-row' : ''}
                        onClick={() => setSelectedRegistration(registration)}
                      >
                        <td className="selection-cell" onClick={(event) => event.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedForPrint.includes(registration.id)}
                            onChange={() => toggleRegistrationSelection(registration.id)}
                            aria-label={`Select ${registration.full_name}`}
                          />
                        </td>
                        <td>
                          <strong>{registration.full_name}</strong>
                          <span>{formatDate(registration.created_at)}</span>
                        </td>
                        <td>
                          <span>{registration.email}</span>
                          <span>{registration.phone}</span>
                        </td>
                        <td>{registration.role}</td>
                        <td>
                          <span>{registration.lga}</span>
                          <span>{registration.ward || '—'}</span>
                        </td>
                        <td>{registration.training_track_name || trackLabels[registration.training_track] || registration.training_track || '—'}</td>
                        <td>{registration.confirmation_code || '—'}</td>
                        <td>
                          <span className="status-pill">{registration.status || 'registered'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {isPreviewOpen && selectedSlipData ? (
        <div className="preview-modal-backdrop" onClick={closePreviewModal}>
          <div className="preview-modal" onClick={(event) => event.stopPropagation()}>
            <div className="preview-modal-header">
              <div>
                <p className="admin-eyebrow">Confirmation slip preview</p>
                <h3>{selectedRegistration?.full_name || 'Participant'}</h3>
              </div>
              <div className="preview-modal-actions">
                <button type="button" className="admin-action-btn secondary" onClick={printSelectedSheet}>
                  Print
                </button>
                <button type="button" className="admin-action-btn" onClick={closePreviewModal}>
                  Close
                </button>
              </div>
            </div>
            <div className="preview-modal-body">
              <ConfirmationSlip data={selectedSlipData} />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default AdminDashboardPage;
