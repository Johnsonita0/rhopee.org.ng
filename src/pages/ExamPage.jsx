import { useEffect, useMemo, useRef, useState } from 'react';
import '../css/pages/ExamPage.css';
import { getCameraStatus, MAX_MALPRACTICE_WARNINGS, shouldAutoSubmitMalpractice } from '../lib/examSafety.js';
import { getPublicCbtExamResult, getPublicCbtExamResultByStudentName, hasCompletedCbtExam, saveCbtExamResult } from '../lib/supabaseClient.js';
import { downloadExamCertificate, downloadExamReport } from '../lib/examDocuments.js';

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

const createResultToken = () => window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const linkFor = (name, resultToken, certificateData) => `${window.location.origin}/cbt/${encodeURIComponent(name.trim())}?result=${resultToken}&cert=${encodeURIComponent(JSON.stringify(certificateData))}`;
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

function ExamPage({ studentName, resultToken = '' }) {
  const [namesInput, setNamesInput] = useState('');
  const [certificateCourse, setCertificateCourse] = useState('Professional Web Development');
  const [certificateChapter, setCertificateChapter] = useState('RHOPEE-NEF Akwa Ibom State Chapter');
  const [certificateIssueDate, setCertificateIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [certificatePrefix, setCertificatePrefix] = useState('RHOPEE/WD/2026');
  const [links, setLinks] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [warning, setWarning] = useState('');
  const [warningCount, setWarningCount] = useState(0);
  const [warningDetails, setWarningDetails] = useState(null);
  const [examAccess, setExamAccess] = useState({ status: 'checking', message: '' });
  const [resultSaveError, setResultSaveError] = useState('');
  const [certificateDownloadError, setCertificateDownloadError] = useState('');
  const [resultData, setResultData] = useState(null);
  const [showInstructionsModal, setShowInstructionsModal] = useState(true);
  const [instructionsAccepted, setInstructionsAccepted] = useState(false);
  const [cameraStatus, setCameraStatus] = useState('safe');
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const lastVideoFrameRef = useRef(null);
  const lastWarningAtRef = useRef(0);
  const warningTimeoutRef = useRef(null);
  const startedAtRef = useRef(null);
  const answersRef = useRef(answers);
  const resultSavedRef = useRef(false);
  const warningCountRef = useRef(0);
  const resultTokenRef = useRef(resultToken || createResultToken());

  const savedLinksKey = 'rhopee-cbt-links';
  const examQuestions = useMemo(() => studentQuestionSet(studentName || 'default-student'), [studentName]);
  const displayName = formatStudentName(studentName || '');
  const score = useMemo(() => examQuestions.reduce((total, question, index) => total + (answers[index] === question[2] ? 1 : 0), 0), [answers, examQuestions]);
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
  const resultDateTime = resultData?.completed_at
    ? new Date(resultData.completed_at).toLocaleString('en-NG', { dateStyle: 'full', timeStyle: 'short' })
    : currentDateTime;
  const certificateData = useMemo(() => {
    if (resultData?.certificate_name) {
      return {
        name: resultData.certificate_name,
        course: resultData.certificate_course || 'Professional Web Development',
        chapter: resultData.certificate_chapter || 'RHOPEE-NEF Akwa Ibom State Chapter',
        issueDate: resultData.certificate_issue_date || new Date(resultData.completed_at || Date.now()).toISOString().slice(0, 10),
        certificateNumber: resultData.certificate_number || `RHOPEE/WD/2026/${resultTokenRef.current.slice(0, 6).toUpperCase()}`,
      };
    }
    try {
      const value = new URLSearchParams(window.location.search).get('cert');
      return value ? JSON.parse(value) : { name: displayName, course: 'Professional Web Development', chapter: 'RHOPEE-NEF Akwa Ibom State Chapter', issueDate: new Date().toISOString().slice(0, 10), certificateNumber: `RHOPEE/WD/2026/${resultTokenRef.current.slice(0, 6).toUpperCase()}` };
    } catch {
      return { name: displayName, course: 'Professional Web Development', chapter: 'RHOPEE-NEF Akwa Ibom State Chapter', issueDate: new Date().toISOString().slice(0, 10), certificateNumber: `RHOPEE/WD/2026/${resultTokenRef.current.slice(0, 6).toUpperCase()}` };
    }
  }, [displayName, resultData]);

  useEffect(() => {
    if (!studentName) {
      try {
        setLinks(JSON.parse(localStorage.getItem(savedLinksKey) || '[]'));
      } catch {
        setLinks([]);
      }
    }
  }, [studentName]);

  useEffect(() => {
    if (!studentName) return undefined;

    let isMounted = true;
    const restoreSubmittedResult = (data) => {
      if (!data) return;
      const restoredAnswers = {};
      (data.performance || []).forEach((entry, index) => {
        const answerIndex = examQuestions[index]?.[1].indexOf(entry.selected_answer);
        if (answerIndex >= 0) restoredAnswers[index] = answerIndex;
      });
      setAnswers(restoredAnswers);
      answersRef.current = restoredAnswers;
      setResultData(data);
      setWarningCount(data.warning_count || 0);
      warningCountRef.current = data.warning_count || 0;
      setSubmitted(true);
      setExamAccess({ status: 'completed', message: 'This exam has already been submitted.' });
    };
    if (resultToken) {
      getPublicCbtExamResult(resultToken).then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          setResultSaveError(error.message || 'Unable to load the submitted exam report.');
          return;
        }
        restoreSubmittedResult(data);
      });
    }
    hasCompletedCbtExam(displayName).then(({ data, error }) => {
      if (!isMounted) return;
      if (error) {
        setExamAccess({ status: 'error', message: error.message || 'Unable to verify exam access.' });
      } else if (data) {
        getPublicCbtExamResultByStudentName(displayName).then(({ data: result }) => {
          if (isMounted) restoreSubmittedResult(result);
        });
        setExamAccess({ status: 'completed', message: 'This exam link has already been submitted.' });
      } else {
        setExamAccess({ status: 'available', message: '' });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [displayName, examQuestions, resultToken, studentName]);

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
      const nextWarningCount = warningCountRef.current + 1;
      lastWarningAtRef.current = now;
      warningCountRef.current = nextWarningCount;
      setWarningCount(nextWarningCount);
      setCameraStatus(getCameraStatus({ warningCount: nextWarningCount, hasWarning: true }));
      setWarning(message);
      setWarningDetails({ eventType, time: new Date(now).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit', second: '2-digit' }) });
      if (shouldAutoSubmitMalpractice(nextWarningCount)) finishExam('malpractice_limit');
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
      if (warningTimeoutRef.current) {
        window.clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      lastVideoFrameRef.current = null;
    };
  }, [started, submitted]);

  useEffect(() => {
    if (!warning) return undefined;

    warningTimeoutRef.current = window.setTimeout(() => {
      setWarning('');
      setWarningDetails(null);
      setCameraStatus(getCameraStatus({ warningCount: warningCountRef.current, hasWarning: false }));
      warningTimeoutRef.current = null;
    }, 4000);

    return () => {
      if (warningTimeoutRef.current) {
        window.clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = null;
      }
    };
  }, [warning]);

  useEffect(() => () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    if (!started || !videoRef.current || !mediaStreamRef.current) return;
    videoRef.current.srcObject = mediaStreamRef.current;
    videoRef.current.play().catch(() => {});
  }, [started]);

  const generateLinks = (event) => {
    event.preventDefault();
    const names = [...new Set(namesInput.split(/[\n,]+/).map((name) => name.trim()).filter(Boolean))];
    const generated = names.map((name) => {
      const resultToken = createResultToken();
      const certificateData = {
        name,
        course: certificateCourse,
        chapter: certificateChapter,
        issueDate: certificateIssueDate,
        certificateNumber: `${certificatePrefix}/${resultToken.slice(0, 6).toUpperCase()}`,
      };
      return { name, resultToken, certificateData, url: linkFor(name, resultToken, certificateData) };
    });
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

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    setWarning('');
    setWarningDetails(null);
    setSubmitted(true);
    setStarted(false);
    setShowInstructionsModal(false);
    resultSavedRef.current = true;
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});

    if (warningTimeoutRef.current) {
      window.clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }

    const submittedAnswers = answersRef.current;
    const resultScore = examQuestions.reduce((total, question, index) => total + (submittedAnswers[index] === question[2] ? 1 : 0), 0);
    const performance = examQuestions.map(([question, options, correctAnswer], index) => ({
      question,
      selected_answer: submittedAnswers[index] === undefined ? null : options[submittedAnswers[index]],
      correct_answer: options[correctAnswer],
      is_correct: submittedAnswers[index] === correctAnswer,
    }));

    const { data: savedResult, error: resultError } = await saveCbtExamResult({
      result_token: resultTokenRef.current,
      student_name: displayName,
      certificate_name: certificateData.name || displayName,
      certificate_course: certificateData.course,
      certificate_chapter: certificateData.chapter,
      certificate_issue_date: certificateData.issueDate,
      certificate_number: certificateData.certificateNumber,
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
    } else if (typeof window !== 'undefined') {
      setResultData(savedResult || {
        result_token: resultTokenRef.current,
        student_name: displayName,
        score: resultScore,
        total_questions: examQuestions.length,
        percentage: Number(((resultScore / examQuestions.length) * 100).toFixed(2)),
        passed: resultScore >= 24,
        completion_reason: completionReason,
        warning_count: warningCountRef.current,
        completed_at: new Date().toISOString(),
        performance,
        certificate_published: false,
        certificate_name: certificateData.name || displayName,
        certificate_course: certificateData.course,
        certificate_chapter: certificateData.chapter,
        certificate_issue_date: certificateData.issueDate,
        certificate_number: certificateData.certificateNumber,
      });
      window.sessionStorage.setItem('rhopee-cbt-completed-route', `/cbt/${encodeURIComponent(displayName)}`);
    }
  };

  const submitExam = () => finishExam('submitted');

  const downloadCertificate = async () => {
    setCertificateDownloadError('');
    try {
      await downloadExamCertificate(resultData, displayName);
    } catch (error) {
      console.error('[CBT] Certificate download failed:', error);
      setCertificateDownloadError('Certificate download failed. Please try again or check that the certificate artwork is available.');
    }
  };

  const stopMediaStream = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  };

  const beginExam = async () => {
    if (examAccess.status !== 'available') return;

    setShowInstructionsModal(false);
    setInstructionsAccepted(true);

    if (navigator.permissions?.query) {
      const [cameraPermission, microphonePermission] = await Promise.all([
        navigator.permissions.query({ name: 'camera' }).catch(() => null),
        navigator.permissions.query({ name: 'microphone' }).catch(() => null),
      ]);
      if (cameraPermission?.state === 'denied' || microphonePermission?.state === 'denied') {
        setWarning('Exam cannot start: camera and microphone access is blocked in this browser.');
        setWarningDetails({ eventType: 'Permission blocked', time: new Date().toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit', second: '2-digit' }) });
        return;
      }
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
    } catch {
      stopMediaStream();
      setWarning('Exam cannot start: camera and microphone permission are both required. Allow access and try again.');
      setWarningDetails({ eventType: 'Permission required', time: new Date().toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit', second: '2-digit' }) });
      return;
    }

    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      setWarning('Fullscreen is unavailable on this browser. The exam will continue with camera and microphone monitoring.');
      setWarningDetails({ eventType: 'Fullscreen unavailable', time: new Date().toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit', second: '2-digit' }) });
    }

    startedAtRef.current = new Date().toISOString();
    resultSavedRef.current = false;
    warningCountRef.current = 0;
    setWarningCount(0);
    setCameraStatus('safe');
    setStarted(true);
  };

  const openRulesModal = () => {
    setShowInstructionsModal(true);
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
        {!started && !submitted && <section className="start-panel">
          {examAccess.status === 'checking' && <><h2>Checking exam access...</h2><p>Please wait while we verify this student link.</p></>}
          {examAccess.status === 'completed' && <><h2>Exam already submitted</h2><p>{examAccess.message}</p></>}
          {examAccess.status === 'error' && <><h2>Exam access unavailable</h2><p>{examAccess.message}</p><p className="proctoring-note">Ask the administrator to apply the latest supabase/schema.sql file.</p></>}
          {examAccess.status === 'available' && <><h2>Ready to begin?</h2><p>This exam contains 40 questions and has a 45-minute time limit.</p><p className="proctoring-note">Read the rules, accept them, and then the exam will request fullscreen, camera, and microphone access for monitoring.</p><button className="primary-button" type="button" onClick={openRulesModal}>Start exam</button></>}
        </section>}
        {showInstructionsModal && examAccess.status === 'available' && !started && !submitted && (
          <div className="rules-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="exam-rules-title">
            <div className="rules-modal">
              <h2 id="exam-rules-title">Exam rules and instructions</h2>
              <ul className="rules-list">
                <li>Complete the exam alone and do not share answers or consult other people.</li>
                <li>Stay in full-screen mode throughout the exam. Leaving fullscreen or switching tabs is treated as malpractice.</li>
                <li>Keep your camera and microphone on. The system monitors your environment continuously.</li>
                <li>Do not use external resources, notes, websites, AI assistants, or messaging apps during the test.</li>
                <li>Answer all questions honestly and submit only when you are satisfied with your work.</li>
                <li>If the monitoring system records multiple malpractice incidents, the exam will auto-submit once the warning count reaches 10.</li>
              </ul>
              <button className="primary-button" type="button" onClick={beginExam}>Accept and begin exam</button>
            </div>
          </div>
        )}
        {started && <div className={`proctor-preview ${cameraStatus}`} aria-label={`Live camera monitoring: ${cameraStatus === 'safe' ? 'no malpractice detected' : 'malpractice detected'}`}><div className={`proctor-preview-header ${cameraStatus}`}><span className="recording-dot" /> <strong>LIVE MONITORING</strong><span>{cameraStatus === 'safe' ? 'Safe' : 'Warning'}</span></div><video ref={videoRef} className="proctor-camera" muted playsInline /></div>}
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
            <div><p className="eyebrow">EXAM SUBMISSION COMPLETE</p><h2>{(resultData?.passed ?? score >= 24) ? 'Congratulations, ' : 'Keep practising, '}{displayName}</h2><p>Submitted on {resultDateTime}</p></div>
            <div className="results-score"><strong>{resultData?.score ?? score}<small>/{resultData?.total_questions || 40}</small></strong><span>{(resultData?.passed ?? score >= 24) ? 'Passed' : 'Not passed'}</span></div>
          </div>
          <div className="results-metrics">
            <div><span>Percentage</span><strong>{Number(resultData?.percentage ?? ((score / examQuestions.length) * 100)).toFixed(1)}%</strong></div>
            <div><span>Answered</span><strong>{answeredCount}/40</strong></div>
            <div><span>Correct</span><strong>{score}</strong></div>
            <div><span>Needs review</span><strong>{incorrectCount}</strong></div>
          </div>
          {resultData && <div className="results-downloads"><button className="primary-button" type="button" onClick={() => downloadExamReport(resultData, displayName)}>Download exam report</button>{resultData.certificate_published ? <button className="secondary-button" type="button" onClick={downloadCertificate}>Download certificate</button> : <p className="certificate-pending">Certificate download will appear here after admin publication.</p>}{certificateDownloadError && <p className="certificate-download-error" role="alert">{certificateDownloadError}</p>}</div>}
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
          <div className="certificate-fields">
            <label>Certificate course<input value={certificateCourse} onChange={(event) => setCertificateCourse(event.target.value)} /></label>
            <label>RHOPEE chapter<input value={certificateChapter} onChange={(event) => setCertificateChapter(event.target.value)} /></label>
            <label>Issue date<input type="date" value={certificateIssueDate} onChange={(event) => setCertificateIssueDate(event.target.value)} /></label>
            <label>Certificate number prefix<input value={certificatePrefix} onChange={(event) => setCertificatePrefix(event.target.value)} /></label>
          </div>
          <button className="primary-button" type="submit">Generate exam links</button>
        </form>
      </section>
      {links.length > 0 && <section className="links-panel"><div className="panel-heading"><h2>Generated links</h2><span>{links.length} student{links.length === 1 ? '' : 's'}</span></div><div className="link-list">{links.map((link) => <div className="student-link" key={link.name}><strong>{link.name}</strong><a href={link.url}>{link.url}</a><button type="button" onClick={() => navigator.clipboard?.writeText(link.url)}>Copy</button></div>)}</div></section>}
    </main>
  );
}

export default ExamPage;