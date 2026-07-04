import { useState, useRef, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { XIcon, SendIcon, MicIcon, VolumeIcon, StopIcon } from './Icons';

/* ── Healthcare AI icon: medical cross with heartbeat pulse ── */
function MedAIIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none">
      {/* Cross arms */}
      <rect x="15" y="4"  width="10" height="32" rx="4" fill="currentColor" />
      <rect x="4"  y="15" width="32" height="10" rx="4" fill="currentColor" />
      {/* Heartbeat line through horizontal arm */}
      <path
        d="M7 20h4.5l2.5-5 4 10 3-6 2.5 1H33"
        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        opacity="0.75"
      />
    </svg>
  );
}

/* ── Small version for message bubbles ── */
function MedAISmall({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="9"  y="2"  width="6" height="20" rx="2.5" fill="currentColor" />
      <rect x="2"  y="9"  width="20" height="6"  rx="2.5" fill="currentColor" />
      <path d="M4.5 12h3l1.5-3 2.5 6 1.5-3 1.5 0H19.5"
        stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    </svg>
  );
}

const QUICK_ACTIONS = [
  { label: '🩺 Find Doctors',     text: 'Show me available doctors' },
  { label: '📅 Appointments',     text: 'Show my appointments' },
  { label: '💊 Prescriptions',    text: 'Show my prescriptions' },
  { label: '💳 Payments',         text: 'Show my payment history' },
];

const WELCOME = {
  role: 'assistant',
  content: "Hello! I'm **Doctor Hub AI** — your personal health assistant.\n\nI can help you find doctors, manage appointments, view prescriptions, and answer health questions.\n\nTap a quick action below or type your question:",
};

const hasUrduScript = (text) => /[؀-ۿ]/.test(text);

function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

function RefreshIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

export default function ChatWidget() {
  const [open, setOpen]           = useState(false);
  const [input, setInput]         = useState('');
  const [history, setHistory]     = useState([WELCOME]);
  const [loading, setLoading]     = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking]   = useState(false);
  const [liveText, setLiveText]   = useState('');
  const [voiceLang, setVoiceLang] = useState('ur-PK');
  const [micError, setMicError]   = useState('');
  const [autoSpeak, setAutoSpeak] = useState(false);

  const bottomRef      = useRef(null);
  const inputRef       = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef       = useRef(window.speechSynthesis);
  const historyRef     = useRef(history);
  const loadingRef     = useRef(loading);

  useEffect(() => { historyRef.current = history; }, [history]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);

  const supportsVoice = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const isIOS    = /iP(hone|ad|od)/i.test(navigator.userAgent) ||
    (/MacIntel/i.test(navigator.platform) && navigator.maxTouchPoints > 1);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 200);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading, liveText]);

  useEffect(() => () => {
    recognitionRef.current?.abort();
    synthRef.current?.cancel();
  }, []);

  /* ── TTS ── */
  const speak = useCallback((text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const plain = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/<[^>]+>/g, '');
    const utt   = new SpeechSynthesisUtterance(plain);
    utt.lang    = hasUrduScript(plain) ? 'ur-PK' : 'en-US';
    utt.rate    = 0.92;
    utt.onstart = () => setSpeaking(true);
    utt.onend   = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    synthRef.current.speak(utt);
  }, []);

  const stopSpeaking = () => { synthRef.current?.cancel(); setSpeaking(false); };

  /* ── Send ── */
  const sendRef = useRef(null);
  sendRef.current = async (textOverride) => {
    const text = (textOverride || input).trim();
    if (!text || loadingRef.current) return;
    stopSpeaking();
    setHistory((h) => [...h, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/chat/message', {
        message: text,
        history: historyRef.current.filter((m) => m !== WELCOME),
      });
      const reply = data.data.reply;
      setHistory((h) => [...h, { role: 'assistant', content: reply }]);
      if (autoSpeak) speak(reply);
    } catch (err) {
      const msg = err.response?.data?.message || 'Sorry, something went wrong. Please try again.';
      setHistory((h) => [...h, { role: 'assistant', content: msg }]);
    } finally {
      setLoading(false);
    }
  };

  const send = (textOverride) => sendRef.current(textOverride);

  /* ── Voice ── */
  const startListening = () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setMicError((isIOS || isSafari)
        ? 'Voice input requires iOS 14.5+ / Safari 14.5+.'
        : 'Voice not supported. Use Chrome or Safari.');
      setTimeout(() => setMicError(''), 5000);
      return;
    }
    setMicError('');
    synthRef.current?.cancel();
    const recLang = (isIOS && voiceLang === 'ur-PK') ? 'en-US' : voiceLang;
    try {
      const rec = new SpeechRec();
      rec.continuous = false; rec.interimResults = true;
      rec.lang = recLang; rec.maxAlternatives = 1;
      rec.onstart  = () => { setListening(true); setLiveText(''); };
      rec.onresult = (e) => {
        let interim = '', final = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) final += e.results[i][0].transcript;
          else interim += e.results[i][0].transcript;
        }
        if (final) { setLiveText(''); setListening(false); sendRef.current(final); }
        else setLiveText(interim);
      };
      rec.onerror = (e) => {
        setListening(false); setLiveText('');
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          setMicError(isIOS
            ? 'Mic blocked. iPhone Settings → Privacy & Security → Microphone → enable Safari. Reload page.'
            : isSafari
              ? 'Mic blocked. Safari menu → Settings for This Website → Microphone → Allow. Reload.'
              : 'Mic blocked. Click 🔒 in address bar → Microphone → Allow.');
        } else if (e.error === 'no-speech') {
          setMicError('No speech detected. Tap mic and speak clearly.');
        } else if (e.error === 'network') {
          setMicError('Network error. Check your connection.');
        } else if (e.error === 'audio-capture') {
          setMicError('Mic not found or in use by another app.');
        } else {
          setMicError(`Mic error: ${e.error}. Try again.`);
        }
        setTimeout(() => setMicError(''), 10000);
      };
      rec.onend = () => { setListening(false); setLiveText(''); };
      recognitionRef.current = rec;
      rec.start();
    } catch {
      setListening(false);
      setMicError(isIOS
        ? 'Could not start mic. Check iPhone Settings → Safari → Microphone.'
        : 'Could not start mic. Check browser permissions.');
      setTimeout(() => setMicError(''), 6000);
    }
  };

  const stopListening  = () => { recognitionRef.current?.stop(); setListening(false); setLiveText(''); };
  const handleKey      = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
  const clearChat      = () => { stopSpeaking(); stopListening(); setHistory([WELCOME]); setInput(''); setMicError(''); };

  const statusText = listening
    ? `🎤 Listening in ${voiceLang === 'ur-PK' ? 'Urdu' : 'English'}…`
    : speaking ? '🔊 Speaking…'
    : '● Online · Ready to help';

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 sm:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="fixed z-50 bottom-5 right-4 sm:bottom-8 sm:right-8 flex flex-col items-end gap-4">

        {/* ── Chat panel ── */}
        {open && (
          <div
            className="flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-900/25 dark:shadow-black/50 w-[calc(100vw-2rem)] sm:w-[400px]"
            style={{ height: 'min(600px, calc(100svh - 110px))' }}
          >

            {/* Header */}
            <div className="relative flex flex-shrink-0 items-center gap-3.5 overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 px-5 py-4">
              <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/5" />
              <div className="absolute -bottom-8 right-8 h-20 w-20 rounded-full bg-white/5" />

              {/* Avatar with status dot */}
              <div className="relative flex-shrink-0">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 ring-2 ring-white/30 backdrop-blur-sm">
                  <MedAIIcon className="h-6 w-6 text-white" />
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-indigo-700 shadow-sm ${
                  listening ? 'bg-red-400 animate-pulse'
                  : speaking ? 'bg-amber-400 animate-pulse'
                  : 'bg-emerald-400'
                }`} />
              </div>

              <div className="relative z-10 flex-1 min-w-0">
                <p className="text-sm font-bold text-white tracking-wide">Doctor Hub AI</p>
                <p className="mt-0.5 text-[11px] font-medium text-blue-200 truncate">{statusText}</p>
              </div>

              <div className="relative z-10 flex items-center gap-1">
                {speaking && (
                  <button onClick={stopSpeaking}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 transition-all hover:bg-white/20 active:scale-90"
                    title="Stop speaking">
                    <StopIcon className="h-3.5 w-3.5 text-white" />
                  </button>
                )}
                <button
                  onClick={() => { setAutoSpeak((v) => { if (v) stopSpeaking(); return !v; }); }}
                  className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all active:scale-90 ${
                    autoSpeak ? 'bg-white/25 ring-1 ring-white/40' : 'bg-white/10 hover:bg-white/20'
                  }`}
                  title={autoSpeak ? 'Auto-speak on' : 'Auto-speak off'}>
                  <VolumeIcon className={`h-3.5 w-3.5 ${autoSpeak ? 'text-white' : 'text-white/50'}`} />
                </button>
                <button onClick={clearChat}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 transition-all hover:bg-white/20 active:scale-90"
                  title="Clear chat">
                  <RefreshIcon className="h-3.5 w-3.5 text-white" />
                </button>
                <button onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 transition-all hover:bg-white/20 active:scale-90"
                  title="Close">
                  <XIcon className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 min-h-0 overflow-y-auto px-4 py-5 space-y-4"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}
            >
              {history.map((msg, i) => (
                <div key={i} className={`flex items-end gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                  {msg.role === 'assistant' && (
                    <div className="mb-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow shadow-blue-300/40 dark:shadow-blue-900/40">
                      <MedAISmall className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}

                  <div className="group relative max-w-[80%]">
                    <div className={`px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'rounded-2xl rounded-br-md bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                        : 'rounded-2xl rounded-bl-md border border-slate-200/70 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100'
                    }`}>
                      <span dangerouslySetInnerHTML={{ __html: formatText(msg.content) }} />
                    </div>

                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => speak(msg.content)}
                        className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm opacity-0 transition-all group-hover:opacity-100 hover:scale-110 active:scale-95"
                        title="Read aloud">
                        <VolumeIcon className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Quick action chips — only after the welcome message */}
              {history.length === 1 && !loading && (
                <div className="flex flex-wrap gap-2 pl-9 pt-1">
                  {QUICK_ACTIONS.map((qa) => (
                    <button
                      key={qa.text}
                      onClick={() => send(qa.text)}
                      className="rounded-full border border-blue-200 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-900/25 px-3.5 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 transition-all hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:shadow-sm active:scale-95">
                      {qa.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Live transcript */}
              {liveText && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-md border border-blue-200/60 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/20 px-4 py-2.5 text-sm italic text-blue-700 dark:text-blue-300">
                    {liveText}…
                  </div>
                </div>
              )}

              {/* Typing indicator */}
              {loading && (
                <div className="flex items-end gap-2.5">
                  <div className="mb-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow shadow-blue-300/40 dark:shadow-blue-900/40">
                    <MedAISmall className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md border border-slate-200/70 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-800 px-4 py-3">
                    <div className="flex h-4 items-center gap-1">
                      {[0, 160, 320].map((d) => (
                        <span key={d}
                          className="h-1.5 w-1.5 rounded-full bg-blue-400 dark:bg-blue-500 animate-bounce"
                          style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div className="flex-shrink-0 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pb-4 pt-3">

              {/* Error banner */}
              {micError && (
                <div
                  onClick={() => setMicError('')}
                  className="mb-3 flex cursor-pointer items-start gap-2 rounded-xl border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs leading-relaxed text-red-600 dark:text-red-400 transition-colors hover:bg-red-100 dark:hover:bg-red-900/30">
                  <span className="flex-1">{micError}</span>
                  <span className="flex-shrink-0 font-bold text-red-400 opacity-70">✕</span>
                </div>
              )}

              {/* Unified input bar */}
              <div className={`flex items-end gap-2 rounded-2xl border bg-slate-50 dark:bg-slate-800 p-1.5 transition-all ${
                listening
                  ? 'border-red-300 dark:border-red-700 ring-2 ring-red-100 dark:ring-red-900/40'
                  : 'border-slate-200 dark:border-slate-700 focus-within:border-blue-300 dark:focus-within:border-blue-700 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30'
              }`}>

                {supportsVoice && (
                  <div className="flex flex-shrink-0 items-center gap-1 pl-0.5">
                    <button
                      onClick={() => setVoiceLang((l) => l === 'ur-PK' ? 'en-US' : 'ur-PK')}
                      disabled={listening}
                      title="Switch voice language"
                      className="h-8 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-2.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-40">
                      {voiceLang === 'ur-PK' ? 'اردو' : 'EN'}
                    </button>
                    <button
                      onClick={listening ? stopListening : startListening}
                      disabled={loading}
                      title={listening ? 'Stop' : 'Speak'}
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl shadow-sm transition-all disabled:opacity-40 ${
                        listening
                          ? 'animate-pulse bg-red-500 hover:bg-red-600 shadow-red-200 dark:shadow-red-900/40'
                          : 'border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600'
                      }`}>
                      <MicIcon className={`h-4 w-4 ${listening ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    </button>
                  </div>
                )}

                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  rows={1}
                  placeholder={listening ? '🎤 Listening…' : 'Message Doctor Hub AI…'}
                  disabled={listening}
                  className="flex-1 resize-none bg-transparent px-1 py-1.5 text-sm leading-relaxed text-slate-800 placeholder-slate-400 outline-none dark:text-slate-100 dark:placeholder-slate-500 disabled:opacity-60"
                  style={{ minHeight: '32px', maxHeight: '96px' }}
                />

                <button
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-30 active:scale-90">
                  {loading
                    ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    : <SendIcon className="h-3.5 w-3.5 text-white" />}
                </button>
              </div>

              {isIOS && voiceLang === 'ur-PK' && !listening && (
                <p className="mt-2 text-center text-[10px] text-amber-500 dark:text-amber-400">
                  iOS mic: speak Roman Urdu — "doctor dhundna hai"
                </p>
              )}
              <p className="mt-1.5 text-center text-[10px] text-slate-400 dark:text-slate-600">
                Emergency <span className="font-semibold text-red-400">1122</span> · AI advice only — always consult a doctor
              </p>
            </div>
          </div>
        )}

        {/* ── FAB toggle ── */}
        {open ? (
          /* Close — compact square */
          <button
            onClick={() => setOpen(false)}
            aria-label="Close AI Assistant"
            className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-700 shadow-lg shadow-slate-900/30 transition-all duration-200 hover:bg-slate-600 active:scale-90">
            <XIcon className="h-5 w-5 text-white" />
          </button>
        ) : (
          /* Open — pill with icon + label */
          <div className="relative">
            <span className="absolute inset-0 animate-ping rounded-2xl bg-blue-400 opacity-20" />
            <button
              onClick={() => setOpen(true)}
              aria-label="Open AI Assistant"
              className="relative flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl shadow-blue-600/40 transition-all duration-200 hover:brightness-110 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #4338ca 50%, #6d28d9 100%)' }}>

              {/* Medical AI icon */}
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 flex-shrink-0">
                <MedAIIcon className="h-5 w-5 text-white" />
              </div>

              {/* Label */}
              <div className="text-left pr-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 leading-none">Doctor Hub</p>
                <p className="text-sm font-bold text-white leading-snug mt-0.5">AI Assistant</p>
              </div>

              {/* Online indicator */}
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-white shadow" />
              </span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
