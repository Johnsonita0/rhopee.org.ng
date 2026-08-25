import { useState } from 'react';
import '../css/pages/FeedbackPage.css';
import { saveClassFeedback } from '../lib/supabaseClient.js';

const tracks = [
  { id: 'webdev', name: 'Web Development' },
  { id: 'cinematography', name: 'Cinematography' },
  { id: 'photography', name: 'Photography' },
];

const genders = ['Female', 'Male', 'Prefer not to say'];

const initialForm = {
  studentName: '',
  gender: '',
  track: 'webdev',
  classDate: '',
  classRating: '5',
  favouriteMoment: '',
  classSpirit: '',
  challenges: '',
  additionalNotes: '',
};

function FeedbackPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [submittedName, setSubmittedName] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('submitting');
    setMessage('');

    const selectedTrack = tracks.find((track) => track.id === form.track);
    const { error } = await saveClassFeedback({
      student_name: form.studentName.trim(),
      gender: form.gender,
      training_track: form.track,
      training_track_name: selectedTrack?.name || form.track,
      class_date: form.classDate,
      class_rating: Number(form.classRating),
      favourite_moment: form.favouriteMoment.trim(),
      class_spirit: form.classSpirit.trim(),
      challenges: form.challenges.trim() || null,
      additional_notes: form.additionalNotes.trim() || null,
    });

    if (error) {
      setStatus('error');
      setMessage(error.message || 'Unable to submit your feedback. Please try again.');
      return;
    }

    setSubmittedName(form.studentName.trim());
    setStatus('success');
    setMessage('');
    setForm(initialForm);
  };

  if (status === 'success') {
    return (
      <section className="feedback-page">
        <div className="feedback-success-panel" role="status">
          <div className="fireworks" aria-hidden="true">
            {Array.from({ length: 20 }, (_, index) => <span key={index} style={{ '--particle': index }} />)}
          </div>
          <span className="feedback-success-icon" aria-hidden="true">✓</span>
          <span className="feedback-kicker">Feedback received</span>
          <h1>Thank you, {submittedName}!</h1>
          <p>Your voice helps us make every class better. We appreciate you taking a moment to share how today’s session went.</p>
          <button type="button" className="feedback-submit" onClick={() => { setStatus('idle'); setMessage(''); }}>
            Share another response
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="feedback-page">
      <div className="feedback-panel">
        <div className="feedback-intro">
          <span className="feedback-kicker">Daily class check-in</span>
          <h1>Class feedback</h1>
          <p>Tell us how today’s class felt so we can keep improving the learning experience for every student.</p>
        </div>

        <form className="feedback-form" onSubmit={handleSubmit}>
          <div className="feedback-grid">
            <label>
              Your name *
              <input name="studentName" value={form.studentName} onChange={handleChange} placeholder="Enter your name" required />
            </label>
            <label>
              Gender *
              <select name="gender" value={form.gender} onChange={handleChange} required>
                <option value="">Select gender</option>
                {genders.map((gender) => <option key={gender} value={gender}>{gender}</option>)}
              </select>
            </label>
            <label>
              Class date *
              <input className="date-input" type="date" name="classDate" value={form.classDate} onChange={handleChange} required />
            </label>
            <label className="feedback-full-width">
              Training track *
              <select name="track" value={form.track} onChange={handleChange} required>
                {tracks.map((track) => <option key={track.id} value={track.id}>{track.name}</option>)}
              </select>
            </label>
          </div>

          <fieldset className="rating-fieldset">
            <legend>How would you rate today’s class? *</legend>
            <div className="rating-options">
              {[1, 2, 3, 4, 5].map((rating) => (
                <label key={rating} className={form.classRating === String(rating) ? 'selected' : ''}>
                  <input type="radio" name="classRating" value={rating} checked={form.classRating === String(rating)} onChange={handleChange} />
                  <span>{rating}</span>
                  <small>{rating === 1 ? 'Needs work' : rating === 5 ? 'Excellent' : ''}</small>
                </label>
              ))}
            </div>
          </fieldset>

          <label>
            What was your favourite moment? *
            <textarea name="favouriteMoment" value={form.favouriteMoment} onChange={handleChange} placeholder="Share the moment, lesson, or activity you enjoyed most" required />
          </label>
          <label>
            How was the class spirit? *
            <textarea name="classSpirit" value={form.classSpirit} onChange={handleChange} placeholder="Tell us about the energy, teamwork, and support in class" required />
          </label>
          <label>
            What challenges did you encounter? *
            <textarea name="challenges" value={form.challenges} onChange={handleChange} placeholder="Tell us what made learning difficult today, if anything" required />
          </label>
          <label>
            Anything else to share?
            <textarea name="additionalNotes" value={form.additionalNotes} onChange={handleChange} placeholder="Optional note for your instructor" />
          </label>

          {message ? <p className={status === 'error' ? 'form-error' : 'feedback-message'} role="status">{message}</p> : null}
          <button type="submit" className="feedback-submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Submitting feedback...' : 'Submit class feedback'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default FeedbackPage;
