import { useState } from 'react';
import SuccessPage from './SuccessPage.jsx';
import { registerMember, uploadPassportFile } from '../lib/supabaseClient.js';
import './RegistrationPage.css';

const localGovernments = [
  'Abak',
  'Eastern Obolo',
  'Eket',
  'Esit Eket',
  'Essien Udim',
  'Etim Ekpo',
  'Etinan',
  'Ibeno',
  'Ibiono-Ibom',
  'Ika',
  'Ikono',
  'Ikot Abasi',
  'Ikot Ekpene',
  'Ini',
  'Itu',
  'Mbo',
  'Mkpat Enin',
  'Nsit-Atai',
  'Nsit-Ibom',
  'Nsit-Ubium',
  'Obot Akara',
  'Okobo',
  'Onna',
  'Oron',
  'Oruk Anam',
  'Udung Uko',
  'Ukanafun',
  'Uruan',
  'Urue-Offong/Oruko',
  'Uyo',
  'Ibesikpo Asutan',
];

const positionOptions = [
  'Chairman',
  'State Excos',
  'Local Government Coordinator',
  'Member',
];

const initialForm = {
  fullName: '',
  membershipId: '',
  position: 'Member',
  chapter: 'AKWA IBOM STATE CHAPTER',
  localGovernment: 'Uyo',
  issuedAt: '',
  expiresAt: '',
  passportFile: null,
  passportPreview: '',
};

function generateBarcodeValue(chapter) {
  const codePrefix = `RHOPEE-MEM-${chapter.slice(0, 3).toUpperCase()}`;
  const suffix = Math.floor(100000 + Math.random() * 900000);
  return `${codePrefix}-${suffix}`;
}

function RegistrationPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, passportFile: file, passportPreview: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (
      !form.fullName.trim() ||
      !form.membershipId.trim() ||
      !form.passportPreview ||
      !form.issuedAt ||
      !form.expiresAt
    ) {
      setError('Please complete all required fields.');
      return;
    }

    setStatus('submitting');

    const barcode = generateBarcodeValue(form.chapter);

    // Upload passport file to storage (if present) and use returned public URL
    let passport_url = null;
    try {
      if (form.passportFile) {
        passport_url = await uploadPassportFile(form.passportFile, form.membershipId || form.fullName);
      }
    } catch (uploadErr) {
      console.error('Passport upload error', uploadErr);
      setError('Failed to upload passport image.');
      setStatus('error');
      return;
    }

    const payload = {
      name: form.fullName,
      membership_id: form.membershipId,
      position: form.position,
      chapter: form.chapter,
      local_government: form.localGovernment,
      passport_url,
      issued_at: form.issuedAt,
      expires_at: form.expiresAt,
      barcode,
      status: 'Verified Member',
    };

    try {
      const { data, error: insertError } = await registerMember(payload);
      if (insertError) {
        throw insertError;
      }

      setSuccessData({ ...payload, id: data?.id });
      setStatus('success');
    } catch (submissionError) {
      console.error(submissionError);
      setError(submissionError.message || 'Unable to complete registration.');
      setStatus('error');
    }
  };

  if (successData) {
    return <SuccessPage data={successData} />;
  }

  return (
    <section className="registration-page">
      <h2>Member Registration</h2>
      <p>Register a new RHOPEE member and generate a barcode for verification.</p>

      <form className="registration-form" onSubmit={handleSubmit}>
        <label>
          Full Name
          <input value={form.fullName} onChange={updateField('fullName')} placeholder="Johnson Imeobong" />
        </label>

        <label>
          Membership ID
          <input value={form.membershipId} onChange={updateField('membershipId')} placeholder="RHOPEE-MEM-AKS-0254" />
        </label>

        <label>
          Position Held
          <select value={form.position} onChange={updateField('position')}>
            {positionOptions.map((position) => (
              <option key={position} value={position}>{position}</option>
            ))}
          </select>
        </label>

        <label>
          Chapter
          <input value={form.chapter} onChange={updateField('chapter')} placeholder="AKWA IBOM STATE CHAPTER" />
        </label>

        <label>
          Local Government
          <select value={form.localGovernment} onChange={updateField('localGovernment')}>
            {localGovernments.map((lg) => (
              <option key={lg} value={lg}>{lg}</option>
            ))}
          </select>
        </label>

        <label>
          Passport photo
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </label>

        {form.passportPreview && (
          <div className="image-preview">
            <img src={form.passportPreview} alt="Passport preview" />
          </div>
        )}

        <label>
          Date Issued
          <input type="date" value={form.issuedAt} onChange={updateField('issuedAt')} />
        </label>

        <label>
          Expires
          <input type="date" value={form.expiresAt} onChange={updateField('expiresAt')} />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Registering…' : 'Register Member'}
        </button>
      </form>
    </section>
  );
}

export default RegistrationPage;
