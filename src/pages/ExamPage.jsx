import { useEffect, useMemo, useRef, useState } from 'react';
import '../css/pages/ExamPage.css';
import { saveCbtExamResult } from '../lib/supabaseClient.js';

const QUESTION_BANK = [
  ['What does HTML stand for?', ['HyperText Markup Language', 'HighText Machine Language', 'Hyperlink Text Management Language', 'Home Tool Markup Language'], 0],
  ['What is HTML used for?', ['Structuring web page content', 'Styling colours only', 'Creating databases', 'Making computer hardware'], 0],
  ['Which element creates the largest heading?', ['<heading>', '<h6>', '<h1>', '<head>'], 2],
  ['Which element creates a paragraph?', ['<text>', '<p>', '<para>', '<paragraph>'], 1],
  ['Which element creates a link?', ['<a>', '<link>', '<href>', '<url>'], 0],
  ['Which attribute holds the destination of a link?', ['src', 'href', 'link', 'path'], 1],
  ['Which element displays an image?', ['<picture>', '<image>', '<img>', '<photo>'], 2],
  ['Which attribute provides alternative text for an image?', ['title', 'alt', 'src', 'label'], 1],
  ['Which element creates an unordered list?', ['<ol>', '<list>', '<ul>', '<li>'], 2],
  ['Which element creates one list item?', ['<item>', '<li>', '<ul>', '<list-item>'], 1],
  ['Which element creates a numbered list?', ['<ol>', '<ul>', '<number-list>', '<li>'], 0],
  ['Which element creates a form?', ['<input>', '<form>', '<fieldset>', '<submit>'], 1],
  ['Which element lets a user type one line of text?', ['<type>', '<input>', '<text-box>', '<write>'], 1],
  ['Which input type hides typed characters?', ['text', 'secret', 'password', 'hidden-text'], 2],
  ['Which element creates a clickable button?', ['<click>', '<button>', '<press>', '<input-button>'], 1],
  ['Which HTML element contains the visible page content?', ['<body>', '<mainhead>', '<visible>', '<content>'], 0],
  ['Which HTML element contains page information and links to stylesheets?', ['<top>', '<head>', '<info>', '<meta-data>'], 1],
  ['Which element creates a line break?', ['<break>', '<br>', '<lb>', '<newline>'], 1],
  ['What does CSS control?', ['Page presentation and layout', 'Database records', 'Server security', 'Browser history'], 0],
  ['What does CSS stand for?', ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Syntax', 'Colourful Sheet System'], 1],
  ['Which CSS property changes text colour?', ['font-color', 'text-color', 'color', 'foreground'], 2],
  ['Which CSS property changes the background colour?', ['background-color', 'back-color', 'fill', 'page-color'], 0],
  ['Which CSS property changes text size?', ['text-size', 'font-size', 'size', 'letter-size'], 1],
  ['Which CSS property makes text bold?', ['font-weight', 'text-bold', 'bold', 'font-style'], 0],
  ['What symbol selects a class in CSS?', ['#', '.', '@', '&'], 1],
  ['What symbol selects an id in CSS?', ['.', '#', '@', '*'], 1],
  ['What does margin create?', ['Space outside an element', 'Space inside an element', 'A border', 'A shadow'], 0],
  ['What does padding create?', ['Space outside an element', 'Space inside an element', 'A new element', 'A page link'], 1],
  ['Which property adds a border?', ['line', 'edge', 'border', 'outline-box'], 2],
  ['Which declaration makes a flex container?', ['position: flex', 'display: flex', 'flex: on', 'layout: flex'], 1],
  ['What does text-align: center do?', ['Makes text bold', 'Moves text to the centre', 'Changes text colour', 'Hides text'], 1],
  ['What does display: none do?', ['Makes text bold', 'Hides the element from the page layout', 'Moves it left', 'Adds transparency only'], 1],
  ['What does responsive design mean?', ['A site adapts to different screen sizes', 'A site responds only to clicks', 'A site has no CSS', 'A site loads once'], 0],
  ['Which CSS pseudo-class applies when the pointer is over an element?', [':focus', ':active', ':hover', ':visited'], 2],
  ['Which language adds behaviour to web pages?', ['HTML', 'CSS', 'JavaScript', 'SQL'], 2],
  ['Which keyword declares a variable that can be reassigned?', ['varName', 'let', 'change', 'value'], 1],
  ['Which keyword declares a variable that should not be reassigned?', ['fixed', 'let', 'const', 'constant-var'], 2],
  ['Which older keyword can also declare a JavaScript variable?', ['var', 'variable', 'old', 'declare'], 0],
  ['Which is a JavaScript string?', ['42', 'true', '"Hello"', 'null'], 2],
  ['Which is a JavaScript number?', ['"25"', '25', 'number', 'twenty-five'], 1],
  ['Which value is a JavaScript boolean?', ['"true"', '1', 'true', 'yes'], 2],
  ['Which value means no value in JavaScript?', ['none', 'empty', 'null', 'nothing'], 2],
  ['Which operator assigns a value to a variable?', ['==', '=', '===', '=>'], 1],
  ['Which operator checks value and type equality?', ['=', '==', '===', '!='], 2],
  ['Which method logs a value to the browser console?', ['console.log()', 'browser.print()', 'log.console()', 'print.console()'], 0],
  ['Which keyword creates a decision in JavaScript?', ['if', 'choose', 'check-now', 'when'], 0],
  ['Which keyword runs code when an if condition is false?', ['otherwise', 'else', 'no', 'false-if'], 1],
  ['Which symbol starts a single-line JavaScript comment?', ['//', '<!--', '#', '**'], 0],
  ['Which brackets create an array?', ['{}', '()', '[]', '<>'], 2],
  ['Which array method adds an item to the end?', ['shift()', 'push()', 'pop()', 'join()'], 1],
  ['Which function shows a message in a browser pop-up?', ['message()', 'alert()', 'popup()', 'show()'], 1],
  ['Which event happens when a button is clicked?', ['onpress', 'onhover', 'onclick', 'onbutton'], 2],
  ['What does getElementById find?', ['An element with a specific id', 'Every paragraph', 'A CSS file', 'A browser window'], 0],
];

const linkFor = (name) => `${window.location.origin}/cbt/${encodeURIComponent(name.trim())}`;
const formatStudentName = (name) => name.trim().toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
const studentQuestionSet = (name) => {
  let seed = [...name.toLowerCase()].reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, 7);
  const randomized = [...QUESTION_BANK].sort(() => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return (seed / 4294967296) - 0.5;
  });
  return randomized.slice(0, 40);
};

function ExamPage({ studentName }) {
  const [namesInput, setNamesInput] = useState('');
  const [links, setLinks] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [warning, setWarning] = useState('');
  const [warningCount, setWarningCount] = useState(0);
  const [warningDetails, setWarningDetails] = useState(null);
  const [resultSaveError, setResultSaveError] = useState('');
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const lastVideoFrameRef = useRef(null);
  const lastWarningAtRef = useRef(0);
  const startedAtRef = useRef(null);
  const answersRef = useRef(answers);
  const resultSavedRef = useRef(false);
  const warningCountRef = useRef(0);

  const savedLinksKey = 'rhopee-cbt-links';
  const examQuestions = useMemo(() => studentQuestionSet(studentName || 'default-student'), [studentName]);

  useEffect(() => {
    if (!studentName) {
      try {
        setLinks(JSON.parse(localStorage.getItem(savedLinksKey) || '[]'));
      } catch {
        setLinks([]);
      }
    }
  }, [studentName]);

  const score = useMemo(() => examQuestions.reduce((total, question, index) => total + (answers[index] === question[2] ? 1 : 0), 0), [answers, examQuestions]);
  const displayName = formatStudentName(studentName || '');
  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);
  const currentDateTime = useMemo(() => new Date().toLocaleString('en-NG', {
    dateStyle: 'full',
    timeStyle: 'short',
  }), []);
  const answeredCount = Object.keys(answers).length;
  const incorrectCount = answeredCount - score;

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    if (!started || submitted) return undefined;

    const timer = window.setInterval(() => {
      setTimeLeft((currentTime) => {
        if (currentTime <= 1) {
          finishExam('time_expired');
          return 0;
        }
        return currentTime - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [started, submitted]);

  useEffect(() => {
    if (!started || submitted) return undefined;

    const showWarning = (message, eventType) => {
      const now = Date.now();
      if (now - lastWarningAtRef.current < 3000) return;
      lastWarningAtRef.current = now;
      setWarningCount((count) => {
        warningCountRef.current = count + 1;
        return count + 1;
      });
      setWarning(message);
      setWarningDetails({ eventType, time: new Date(now).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit', second: '2-digit' }) });
      window.setTimeout(() => setWarning(''), 4500);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) showWarning('The exam tab was left or hidden.', 'Tab or window change');
    };
    const handleWindowBlur = () => showWarning('Focus moved away from the exam window.', 'Window focus lost');
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) showWarning('Fullscreen mode was exited during the exam.', 'Fullscreen exited');
    };

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 48;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const motionCheck = window.setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = context.getImageData(0, 0, canvas.width, canvas.height).data;
      if (lastVideoFrameRef.current) {
        let difference = 0;
        for (let index = 0; index < frame.length; index += 16) difference += Math.abs(frame[index] - lastVideoFrameRef.current[index]);
        if (difference / (frame.length / 16) > 18) showWarning('Movement was detected in the camera view.', 'Camera movement');
      }
      lastVideoFrameRef.current = frame;
    }, 700);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      window.clearInterval(motionCheck);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      lastVideoFrameRef.current = null;
    };
  }, [started, submitted]);

  useEffect(() => () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const generateLinks = (event) => {
    event.preventDefault();
    const names = [...new Set(namesInput.split(/[\n,]+/).map((name) => name.trim()).filter(Boolean))];
    const generated = names.map((name) => ({ name, url: linkFor(name) }));
    setLinks(generated);
    localStorage.setItem(savedLinksKey, JSON.stringify(generated));
  };

  const selectAnswer = (questionIndex, answerIndex) => {
    if (started && !submitted) {
      setAnswers((current) => {
        const nextAnswers = { ...current, [questionIndex]: answerIndex };
        answersRef.current = nextAnswers;
        return nextAnswers;
      });
    }
  };

  const finishExam = async (completionReason = 'submitted') => {
    if (submitted || resultSavedRef.current) return;

    setSubmitted(true);
    setStarted(false);
    resultSavedRef.current = true;
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});

    const submittedAnswers = answersRef.current;
    const resultScore = examQuestions.reduce((total, question, index) => total + (submittedAnswers[index] === question[2] ? 1 : 0), 0);
    const performance = examQuestions.map(([question, options, correctAnswer], index) => ({
      question,
      selected_answer: submittedAnswers[index] === undefined ? null : options[submittedAnswers[index]],
      correct_answer: options[correctAnswer],
      is_correct: submittedAnswers[index] === correctAnswer,
    }));

    const { error: resultError } = await saveCbtExamResult({
      student_name: displayName,
      score: resultScore,
      total_questions: examQuestions.length,
      percentage: Number(((resultScore / examQuestions.length) * 100).toFixed(2)),
      passed: resultScore >= 24,
      completion_reason: completionReason,
      warning_count: warningCountRef.current,
      started_at: startedAtRef.current,
      completed_at: new Date().toISOString(),
      performance,
    });

    if (resultError) {
      console.error('[CBT] Unable to save exam result:', resultError);
      setResultSaveError(resultError.message?.includes('cbt_exam_results')
        ? 'Admin sync is not ready yet. Run supabase/schema.sql in the Supabase SQL Editor, then submit a new attempt.'
        : `Admin sync failed: ${resultError.message || 'the result could not be saved.'}`);
    }
  };

  const submitExam = () => finishExam('submitted');

  const stopMediaStream = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  };

  const startExam = async () => {
    try {
      if (!document.documentElement.requestFullscreen) throw new Error('Fullscreen is not supported by this browser.');
      await document.documentElement.requestFullscreen();
    } catch {
      setWarning('Exam cannot start: fullscreen access is required.');
      setWarningDetails({ eventType: 'Permission required', time: new Date().toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit', second: '2-digit' }) });
      return;
    }

    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera and microphone are not available.');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const hasCamera = stream.getVideoTracks().some((track) => track.readyState === 'live');
      const hasMicrophone = stream.getAudioTracks().some((track) => track.readyState === 'live');
      if (!hasCamera || !hasMicrophone) {
        stream.getTracks().forEach((track) => track.stop());
        throw new Error('Both camera and microphone access are required.');
      }

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      stopMediaStream();
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      setWarning('Exam cannot start: camera and microphone permission are both required. Allow access and try again.');
      setWarningDetails({ eventType: 'Permission required', time: new Date().toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit', second: '2-digit' }) });
      return;
    }

    startedAtRef.current = new Date().toISOString();
    resultSavedRef.current = false;
    warningCountRef.current = 0;
    setWarningCount(0);
    setStarted(true);
  };

  if (studentName) {
    return (
      <main className="cbt-page page-content">
        <section className="cbt-hero">
          <div>
            <p className="eyebrow">RHOPEE WEB DEVELOPMENT CBT</p>
            <h1>{timeGreeting}, {displayName}</h1>
            <p className="exam-timestamp">{currentDateTime}</p>
            <p>{submitted ? 'Your results are ready below.' : started ? 'Answer all 40 questions before the timer reaches zero.' : 'Click Start exam when you are ready. The 45-minute timer starts immediately.'}</p>
          </div>
          <div className={started && timeLeft <= 300 ? 'exam-stat timer-warning' : 'exam-stat'}><strong>{started || submitted ? formatTime(timeLeft) : '45:00'}</strong><span>{submitted ? 'time used' : 'time left'}</span></div>
        </section>
        {!started && !submitted && <section className="start-panel"><h2>Ready to begin?</h2><p>This exam contains 40 questions and has a 45-minute time limit.</p><p className="proctoring-note">Starting requests fullscreen, camera, and microphone access for exam monitoring.</p><button className="primary-button" type="button" onClick={startExam}>Start exam</button></section>}
        {started && <div className="proctor-preview" aria-label="Live camera monitoring"><div className="proctor-preview-header"><span className="recording-dot" /> <strong>LIVE MONITORING</strong><span>Camera</span></div><video ref={videoRef} className="proctor-camera" muted playsInline /></div>}
        {warning && <div className="warning-toast" role="alert"><div className="warning-toast-title"><span aria-hidden>!</span><strong>Malpractice warning {warningCount}</strong></div><span>{warning}</span>{warningDetails && <small>{warningDetails.eventType} · {warningDetails.time}</small>}</div>}
        {started && <>
          <section className="question-list">
            {examQuestions.map(([question, options], questionIndex) => (
              <article className="question-card" key={question}>
                <div className="question-heading"><span>{String(questionIndex + 1).padStart(2, '0')}</span><h2>{question}</h2></div>
                <div className="answer-grid">
                  {options.map((option, optionIndex) => (
                    <button className={`answer ${answers[questionIndex] === optionIndex ? 'selected' : ''}`} key={option} type="button" onClick={() => selectAnswer(questionIndex, optionIndex)}>
                      <span>{String.fromCharCode(65 + optionIndex)}</span>{option}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </section>
          <section className="submit-bar">
            <button className="primary-button" type="button" onClick={submitExam}>Submit exam</button>
          </section>
        </>}
        {submitted && <section className="results-page">
          <div className={score >= 24 ? 'results-hero passed' : 'results-hero'}>
            <div><p className="eyebrow">EXAM SUBMISSION COMPLETE</p><h2>{score >= 24 ? 'Congratulations, ' : 'Keep practising, '}{displayName}</h2><p>Submitted on {currentDateTime}</p></div>
            <div className="results-score"><strong>{score}<small>/40</small></strong><span>{score >= 24 ? 'Passed' : 'Not passed'}</span></div>
          </div>
          <div className="results-metrics">
            <div><span>Percentage</span><strong>{((score / examQuestions.length) * 100).toFixed(1)}%</strong></div>
            <div><span>Answered</span><strong>{answeredCount}/40</strong></div>
            <div><span>Correct</span><strong>{score}</strong></div>
            <div><span>Needs review</span><strong>{incorrectCount}</strong></div>
          </div>
          {resultSaveError && <div className="result-sync-error" role="alert"><strong>Admin dashboard sync</strong><span>{resultSaveError}</span></div>}
          <div className="results-review"><div className="results-section-heading"><div><p className="eyebrow">ANSWER ANALYSIS</p><h3>Review your submission</h3></div><span>{warningCount} proctoring warning{warningCount === 1 ? '' : 's'}</span></div><div className="review-list">{examQuestions.map(([question, options, correctAnswer], questionIndex) => { const selectedAnswer = answers[questionIndex]; const isCorrect = selectedAnswer === correctAnswer; return <article className={isCorrect ? 'review-row correct-row' : 'review-row'} key={question}><div className="review-number">{String(questionIndex + 1).padStart(2, '0')}</div><div className="review-copy"><strong>{question}</strong><span>Your answer: {selectedAnswer === undefined ? 'Not answered' : options[selectedAnswer]}</span><span className="review-correct">Correct answer: {options[correctAnswer]}</span></div><div className="review-result">{isCorrect ? 'Correct' : 'Review'}</div></article>; })}</div></div>
        </section>}
      </main>
    );
  }

  return (
    <main className="cbt-page page-content">
      <section className="cbt-hero manager-hero">
        <div><p className="eyebrow">EXAM CENTRE</p><h1>Web development CBT</h1><p>Generate a private exam link for each student. Every link opens the same 40-question assessment with the student name attached.</p></div>
        <div className="exam-stat"><strong>40</strong><span>questions</span></div>
      </section>
      <section className="generator-panel">
        <div><h2>Create student links</h2><p>Enter one name per line or separate names with commas.</p></div>
        <form onSubmit={generateLinks}>
          <textarea value={namesInput} onChange={(event) => setNamesInput(event.target.value)} placeholder={'Ada Lovelace\nAlan Turing'} rows="5" aria-label="Student names" />
          <button className="primary-button" type="submit">Generate exam links</button>
        </form>
      </section>
      {links.length > 0 && <section className="links-panel"><div className="panel-heading"><h2>Generated links</h2><span>{links.length} student{links.length === 1 ? '' : 's'}</span></div><div className="link-list">{links.map((link) => <div className="student-link" key={link.name}><strong>{link.name}</strong><a href={link.url}>{link.url}</a><button type="button" onClick={() => navigator.clipboard?.writeText(link.url)}>Copy</button></div>)}</div></section>}
    </main>
  );
}

export default ExamPage;