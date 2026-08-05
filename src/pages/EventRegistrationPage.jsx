import { useMemo, useState } from 'react';
import '../css/pages/EventRegistrationPage.css';
import ConfirmationSlip from '../components/ConfirmationSlip.jsx';
import { saveTrainingRegistration } from '../lib/supabaseClient.js';
import { notifyApplicantRegistration } from '../lib/emailNotification.js';
import { generateConfirmationCode } from '../lib/confirmationCodeGenerator.js';

const trainingTracks = [
  { id: 'cinematography', name: 'Cinematography', icon: '🎬' },
  { id: 'photography', name: 'Photography', icon: '📷' },
  { id: 'webdev', name: 'Web Development', icon: '💻' },
];

const trainingRoles = [
  'LGA Media Director',
  'Ward Media Director',
  'Media Director Coordinator',
];

const initialForm = {
  fullName: '',
  surname: '',
  firstName: '',
  middleName: '',
  email: '',
  phone: '',
  lga: '',
  ward: '',
  role: trainingRoles[0],
  trainingTrack: 'cinematography',
  accommodationNeeded: false,
  dietary: '',
  emergencyContact: '',
  emergencyPhone: '',
  agreeToTerms: false,
  newsletterOptIn: false,
};

const FORM_STEPS = [
  { id: 1, title: 'Personal' },
  { id: 2, title: 'Role & Location' },
  { id: 3, title: 'Training Focus' },
  { id: 4, title: 'Additional Info' },
  { id: 5, title: 'Review' },
];

function buildParticipantName(form) {
  const nameParts = [form.firstName, form.middleName, form.surname, form.fullName]
    .filter(Boolean)
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (!nameParts.length) {
    return '';
  }

  return nameParts.join(' ');
}

function EventRegistrationPage() {
  const [form, setForm] = useState(initialForm);
  const [currentStep, setCurrentStep] = useState(1);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [emailCheckMessage, setEmailCheckMessage] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const existingRegistrations = useMemo(() => [], [form.email]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;

    setForm((current) => ({
      ...current,
      [name]: nextValue,
    }));

    if (name === 'email') {
      const trimmedValue = String(nextValue).trim().toLowerCase();
      if (!trimmedValue) {
        setEmailCheckMessage('');
        setMessage('');
        return;
      }

      const hasExistingRegistration = existingRegistrations.some((entry) => String(entry.email || '').trim().toLowerCase() === trimmedValue);
      setEmailCheckMessage(
        hasExistingRegistration ? 'This email address has already been used for a registration.' : ''
      );
      if (hasExistingRegistration) {
        setMessage('This email address has already been used for a registration.');
      } else {
        setMessage('');
      }
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return form.fullName.trim() && form.email.trim() && form.phone.trim();
      case 2:
        return form.role && form.lga.trim();
      case 3:
        return form.trainingTrack;
      case 4:
        return true;
      case 5:
        return form.agreeToTerms;
      default:
        return false;
    }
  };

  const goToStep = (step) => {
    if (step < currentStep || validateStep(currentStep)) {
      setCurrentStep(step);
      setMessage('');
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < FORM_STEPS.length) {
        setCurrentStep(currentStep + 1);
        setMessage('');
      }
    } else {
      setMessage('Please complete all required fields in this step.');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setMessage('');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatus('submitting');
    setMessage('');

    if (!validateStep(5)) {
      setStatus('error');
      setMessage('Please agree to the training terms to complete registration.');
      return;
    }

    setSaveStatus('saving');
    setTimeout(async () => {
      try {
        const confirmationCode = generateConfirmationCode();
        const trainingTrackName = trainingTracks.find((track) => track.id === form.trainingTrack)?.name || 'Training Track';

        const participantName = buildParticipantName(form);

        const registrationData = {
          full_name: form.fullName || participantName,
          email: form.email,
          phone: form.phone,
          role: form.role,
          lga: form.lga,
          ward: form.ward || null,
          training_track: form.trainingTrack,
          training_track_name: trainingTrackName,
          accommodation_needed: form.accommodationNeeded,
          dietary_preferences: form.dietary || null,
          emergency_contact: form.emergencyContact || null,
          emergency_phone: form.emergencyPhone || null,
          confirmation_code: confirmationCode,
          status: 'registered',
          created_at: new Date().toISOString(),
        };

        const { data, error } = await saveTrainingRegistration(registrationData);

        if (error) {
          setStatus('error');
          setSaveStatus('failed');
          setMessage(error.message || 'This email address has already been used for a registration.');
          return;
        }

        try {
          await notifyApplicantRegistration({
            email: form.email,
            fullName: buildParticipantName(form),
            confirmationCode,
            trainingTrackName,
            newsletterOptIn: form.newsletterOptIn,
          });
          setNewsletterMessage('A confirmation email has been sent to your inbox.');
        } catch (notificationError) {
          console.warn('Email notification failed', notificationError);
          setNewsletterMessage('Registration completed, but email notification could not be sent.');
        }

        setStatus('success');
        setSaveStatus('completed');
        setSubmitted(true);
        setForm({
          ...form,
          confirmationCode,
          trainingTrackName,
        });
      } catch (error) {
        console.error('Error saving registration:', error);
        setStatus('error');
        setSaveStatus('failed');
        setMessage('Unable to save registration to the database. Please try again later.');
      }
    }, 350);
  };

  const progressPercentage = (currentStep / FORM_STEPS.length) * 100;

  if (submitted) {
    const confirmationData = {
      fullName: buildParticipantName(form),
      email: form.email,
      phone: form.phone,
      role: form.role,
      lga: form.lga,
      ward: form.ward,
      trainingTrack: form.trainingTrack,
      trainingTrackName: form.trainingTrackName,
      confirmationCode: form.confirmationCode,
    };

    return (
      <section className="event-registration-page">
        <ConfirmationSlip data={confirmationData} />
        
        <div className="event-success-card" style={{ marginTop: '32px' }}>
          <div className="success-badge">✓</div>
          <span className="success-pill">Registration confirmed</span>
          <h2>Welcome, {form.fullName.split(' ')[0] || 'participant'}!</h2>
          <p>Your registration for the Media Directors Empowerment Training has been confirmed.</p>
          
          <div className="event-summary">
            <div>
              <strong>Training Track</strong>
              <p>{form.trainingTrackName}</p>
            </div>
            <div>
              <strong>Role</strong>
              <p>{form.role}</p>
            </div>
            <div>
              <strong>Location</strong>
              <p>{form.lga}{form.ward ? ` - ${form.ward}` : ''}</p>
            </div>
          </div>

          <p className="event-details">Check your email at <strong>{form.email}</strong> for detailed logistics, training materials, and final instructions. Your trainee code is <strong>{form.confirmationCode}</strong>.</p>
          
          <button type="button" className="secondary-btn" onClick={() => {
            setSubmitted(false);
            setCurrentStep(1);
            setStatus('idle');
            setMessage('');
            setForm(initialForm);
          }}>
            Register another participant
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="event-registration-page">
      <div className="event-panel">
        <div className="event-intro">
          <span className="success-pill">Media Directors Training</span>
          <h2>Empowerment Training Registration</h2>
          <p>Step-by-step registration for the RHOPEE Media Directors empowerment training. Build capacity, enhance creativity, and impact your communities.</p>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }} />
          </div>
          <div className="progress-steps">
            {FORM_STEPS.map((step) => (
              <button
                key={step.id}
                type="button"
                className={`progress-step ${currentStep >= step.id ? 'active' : ''} ${currentStep === step.id ? 'current' : ''}`}
                onClick={() => goToStep(step.id)}
                disabled={currentStep < step.id && !validateStep(currentStep)}
              >
                <span className="step-number">{step.id}</span>
                <span className="step-label">{step.title}</span>
              </button>
            ))}
          </div>
        </div>

        <form className="event-form multi-step" onSubmit={handleSubmit}>
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="form-step active">
              <div className="step-header">
                <h3>Personal Information</h3>
                <p>Tell us who you are</p>
              </div>
              <div className="form-grid">
                <label className="full-width">
                  Full name *
                  <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Your full name" required />
                </label>

                <label className="full-width">
                  Email address *
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
                {emailCheckMessage ? <p className="form-error">{emailCheckMessage}</p> : null}
                </label>

                <label className="full-width">
                  Phone number *
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="0803 000 0000" required />
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Role & Location */}
          {currentStep === 2 && (
            <div className="form-step active">
              <div className="step-header">
                <h3>Role & Location</h3>
                <p>Your position and assignment area</p>
              </div>
              <div className="form-grid">
                <label className="full-width">
                  Role in RHOPEE *
                  <select name="role" value={form.role} onChange={handleChange} required>
                    {trainingRoles.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </label>

                <label className="full-width">
                  Local Government Area (LGA) *
                  <input name="lga" value={form.lga} onChange={handleChange} placeholder="e.g., Uyo, Eket, Ikot Ekpene" required />
                </label>

                <label className="full-width">
                  Ward (if applicable)
                  <input name="ward" value={form.ward} onChange={handleChange} placeholder="Ward name" />
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Training Track */}
          {currentStep === 3 && (
            <div className="form-step active">
              <div className="step-header">
                <h3>Training Focus</h3>
                <p>Choose your preferred learning track</p>
              </div>
              <div className="training-tracks-grid">
                {trainingTracks.map((track) => (
                  <label key={track.id} className="track-card">
                    <input 
                      type="radio" 
                      name="trainingTrack" 
                      value={track.id} 
                      checked={form.trainingTrack === track.id}
                      onChange={handleChange}
                    />
                    <div className="track-content">
                      <span className="track-icon">{track.icon}</span>
                      <span className="track-name">{track.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Additional Information */}
          {currentStep === 4 && (
            <div className="form-step active">
              <div className="step-header">
                <h3>Additional Information</h3>
                <p>Special requirements and emergency contact</p>
              </div>
              <div className="form-grid">
                <label className="full-width">
                  Emergency contact name
                  <input name="emergencyContact" value={form.emergencyContact} onChange={handleChange} placeholder="Contact name" />
                </label>

                <label className="full-width">
                  Emergency phone number
                  <input name="emergencyPhone" value={form.emergencyPhone} onChange={handleChange} placeholder="0803 000 0000" />
                </label>

                <label className="checkbox-row full-width">
                  <input type="checkbox" name="accommodationNeeded" checked={form.accommodationNeeded} onChange={handleChange} />
                  I need accommodation during the training period
                </label>

                <label className="full-width">
                  Dietary preferences or restrictions
                  <textarea name="dietary" value={form.dietary} onChange={handleChange} rows="3" placeholder="e.g., vegetarian, allergies, etc." />
                </label>
              </div>
            </div>
          )}

          {/* Step 5: Attestation */}
          {currentStep === 5 && (
            <div className="form-step active">
              <div className="step-header">
                <h3>Attestation & Agreement</h3>
                <p>Review and confirm your registration</p>
              </div>

              <div className="attestation-card">
                <div className="attestation-header">
                  <span className="attestation-seal">⭐</span>
                  <h4>Training Agreement</h4>
                </div>
                
                <div className="attestation-content">
                  <p className="attestation-intro">This is to certify that</p>
                  <p className="attestation-name">{buildParticipantName(form) || '___________________'}</p>
                  <p className="attestation-text">has voluntarily registered for the <strong>RHOPEE NEF Akwa Ibom State Chapter</strong> Media Directors Empowerment Training in <strong>{trainingTracks.find(t => t.id === form.trainingTrack)?.name || 'a training track'}</strong>.</p>
                  
                  <div className="attestation-details">
                    <div className="detail-row">
                      <span className="detail-label">Training Period:</span>
                      <span className="detail-value">24 August – 5 September 2026</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Role:</span>
                      <span className="detail-value">{form.role}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">{form.lga}{form.ward ? `, ${form.ward}` : ''}</span>
                    </div>
                  </div>

                  <div className="attestation-agreement">
                    <p className="agreement-title">As a registered participant, I agree to:</p>
                    <ul>
                      <li>Attend all training sessions from 9:00 AM daily</li>
                      <li>Complete all assigned training modules and activities</li>
                      <li>Adhere to the training code of conduct and facility rules</li>
                      <li>Participate actively and contribute to group discussions</li>
                      <li>Apply the skills learned to enhance digital media capacity in my community</li>
                    </ul>
                  </div>
                </div>
              </div>

              <label className="checkbox-row agreement-checkbox full-width">
                <input type="checkbox" name="agreeToTerms" checked={form.agreeToTerms} onChange={handleChange} required />
                I confirm that I have read and agree to all the terms of this training agreement. *
              </label>

              <label className="checkbox-row agreement-checkbox full-width">
                <input type="checkbox" name="newsletterOptIn" checked={form.newsletterOptIn} onChange={handleChange} />
                Yes, subscribe me to event updates and newsletter emails.
              </label>

              {message && <p className="form-error">{message}</p>}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="form-navigation">
            <button type="button" className="nav-btn secondary" onClick={handlePrevious} disabled={currentStep === 1}>
              ← Previous
            </button>
            
            <div className="step-indicator">
              Step {currentStep} of {FORM_STEPS.length}
            </div>

            {currentStep < FORM_STEPS.length ? (
              <button type="button" className="nav-btn primary" onClick={handleNext}>
                Next →
              </button>
            ) : (
              <button type="submit" className="nav-btn primary" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Completing…' : 'Complete Registration'}
              </button>
            )}
          </div>

          {saveStatus !== 'idle' && (
            <p className={`form-message save-status ${saveStatus}`}>
              {saveStatus === 'saving' && 'Saving registration to the database...'}
              {saveStatus === 'completed' && 'Registration saved successfully.'}
              {saveStatus === 'failed' && 'Registration failed to save. Please check the message above and try again.'}
            </p>
          )}

          {newsletterMessage && <p className="form-message form-success">{newsletterMessage}</p>}

          {currentStep === FORM_STEPS.length && message && <p className={status === 'error' ? 'form-error' : 'form-success'}>{message}</p>}
        </form>
      </div>
    </section>
  );
}

export default EventRegistrationPage;
