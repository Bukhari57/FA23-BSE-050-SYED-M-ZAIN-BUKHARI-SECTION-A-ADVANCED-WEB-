import { useState, useRef, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { MicIcon, VolumeIcon, StopIcon, XIcon, SparklesIcon, CheckIcon } from './Icons';

// Pick the best supported audio MIME type for recording
const getAudioMime = () => {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) || '';
};

// Animated waveform bars shown while listening or speaking
function Waveform({ active, color = 'bg-white' }) {
  return (
    <div className={`flex items-end gap-[3px] h-5 transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`}>
      {[0.4, 0.9, 0.6, 1, 0.7, 0.85, 0.5].map((h, i) => (
        <div
          key={i}
          className={`w-1 rounded-full ${color}`}
          style={{
            height: `${h * 100}%`,
            animation: active ? `va-wave 0.9s ease-in-out infinite alternate` : 'none',
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
    </div>
  );
}

// Healthcare mic icon
function MedMicIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none">
      <rect x="15" y="4"  width="10" height="32" rx="4" fill="currentColor" />
      <rect x="4"  y="15" width="32" height="10" rx="4" fill="currentColor" />
      <path d="M7 20h4.5l2.5-5 4 10 3-6 2.5 1H33"
        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
    </svg>
  );
}

const cleanForSpeech = (text) =>
  text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/[#*_~`]/g, '')
    .replace(/\n+/g, ' ')
    .trim();

const WELCOME_MSG = {
  role: 'assistant',
  text: "Hi! I'm your Doctor Hub Voice Assistant. I can search doctors, check your appointments, and even book one for you. Just tap the mic and speak.",
};

export default function VoiceAgent({ above = false }) {
  const [open, setOpen]         = useState(false);
  const [msgs, setMsgs]         = useState([WELCOME_MSG]);
  const [mode, setMode]         = useState('idle'); // idle | listening | processing | speaking
  const [liveText, setLiveText] = useState('');
  const [micErr, setMicErr]     = useState('');
  const [context, setContext]   = useState({});
  const [review, setReview]     = useState(null); // {text, timer} — transcript review before send
  const reviewTimerRef          = useRef(null);

  const synthRef    = useRef(window.speechSynthesis);
  const mediaRecRef = useRef(null);
  const streamRef   = useRef(null);
  const chunksRef   = useRef([]);
  const silenceRaf  = useRef(null);   // requestAnimationFrame id for silence detection
  const audioCtxRef = useRef(null);
  const bottomRef   = useRef(null);
  const histRef     = useRef(msgs);

  useEffect(() => { histRef.current = msgs; }, [msgs]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, liveText]);
  useEffect(() => () => {
    cancelAnimationFrame(silenceRaf.current);
    clearTimeout(reviewTimerRef.current);
    mediaRecRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();
    synthRef.current?.cancel();
  }, []);

  const speak = useCallback((text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const plain = cleanForSpeech(text);
    const utt = new SpeechSynthesisUtterance(plain);
    utt.lang = /[؀-ۿ]/.test(plain) ? 'ur-PK' : 'en-US';
    utt.rate = 0.9;
    utt.onstart = () => setMode('speaking');
    utt.onend   = () => setMode('idle');
    utt.onerror = () => setMode('idle');
    synthRef.current.speak(utt);
  }, []);

  const stopAll = () => {
    cancelAnimationFrame(silenceRaf.current);
    mediaRecRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    synthRef.current?.cancel();
    setMode('idle');
    setLiveText('');
  };

  const sendVoice = useCallback(async (text) => {
    if (!text?.trim()) return;
    stopAll();
    const userMsg = { role: 'user', text: text.trim() };
    setMsgs((m) => [...m, userMsg]);
    setMode('processing');

    try {
      const history = histRef.current
        .filter((m) => m !== WELCOME_MSG)
        .map((m) => ({ role: m.role, content: m.text }));

      const { data } = await api.post('/voice/message', {
        message: text.trim(),
        history,
        context,
      });

      const reply = data.data.reply;
      if (data.data.context) setContext(data.data.context);
      setMsgs((m) => [...m, { role: 'assistant', text: reply }]);
      speak(reply);
    } catch (err) {
      const errText = err.response?.data?.message || 'Something went wrong. Please try again.';
      setMsgs((m) => [...m, { role: 'assistant', text: errText }]);
      setMode('idle');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speak]);

  const startListening = async () => {
    synthRef.current?.cancel();
    setMicErr('');
    chunksRef.current = [];

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setMicErr('Microphone access denied. Click the lock icon in your browser and allow microphone.');
      setTimeout(() => setMicErr(''), 8000);
      return;
    }

    streamRef.current = stream;
    const mime = getAudioMime();
    const rec  = new MediaRecorder(stream, mime ? { mimeType: mime } : {});
    mediaRecRef.current = rec;

    // ── Silence detection via AnalyserNode ─────────────────────────────────────
    const SILENCE_THRESHOLD = 12;  // RMS below this = silence
    const SILENCE_AFTER_SPEECH_MS = 1800; // stop 1.8s after speech ends
    const MAX_DURATION_MS = 15000; // hard cap at 15s

    let hasSpeech = false;
    let silenceStart = null;
    const startedAt = Date.now();

    try {
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      audioCtx.createMediaStreamSource(stream).connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        if (!mediaRecRef.current || mediaRecRef.current.state !== 'recording') return;

        analyser.getByteTimeDomainData(buf);
        const rms = Math.sqrt(buf.reduce((s, v) => s + (v - 128) ** 2, 0) / buf.length);

        if (rms > SILENCE_THRESHOLD) {
          hasSpeech = true;
          silenceStart = null;
        } else if (hasSpeech) {
          if (!silenceStart) silenceStart = Date.now();
          if (Date.now() - silenceStart > SILENCE_AFTER_SPEECH_MS) {
            mediaRecRef.current.stop();
            return;
          }
        }

        if (Date.now() - startedAt > MAX_DURATION_MS) {
          mediaRecRef.current.stop();
          return;
        }

        silenceRaf.current = requestAnimationFrame(tick);
      };
      silenceRaf.current = requestAnimationFrame(tick);
    } catch {
      // AudioContext unavailable — fall back to manual stop, still works
    }
    // ──────────────────────────────────────────────────────────────────────────

    rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };

    rec.onstop = async () => {
      cancelAnimationFrame(silenceRaf.current);
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
      stream.getTracks().forEach((t) => t.stop());

      const blob = new Blob(chunksRef.current, { type: mime || 'audio/webm' });
      chunksRef.current = [];

      if (blob.size < 1000) { setMode('idle'); setLiveText(''); return; }

      setMode('processing');
      setLiveText('');
      try {
        const form = new FormData();
        form.append('audio', blob, `recording.${mime?.split('/')[1]?.split(';')[0] || 'webm'}`);
        const { data } = await api.post('/voice/transcribe', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const transcript = data.data?.transcript?.trim();
        if (!transcript) {
          setMode('idle');
          setMicErr('No speech detected. Please try again.');
          setTimeout(() => setMicErr(''), 5000);
          return;
        }

        // Show transcript for 2s so the user can cancel if Whisper got it wrong
        setMode('idle');
        setLiveText('');
        setReview(transcript);
        reviewTimerRef.current = setTimeout(() => {
          setReview(null);
          sendVoice(transcript);
        }, 2000);
      } catch (err) {
        setMode('idle');
        setMicErr(err.response?.data?.message || 'Transcription failed. Please try again.');
        setTimeout(() => setMicErr(''), 6000);
      }
    };

    rec.start();
    setMode('listening');
    setLiveText('');
  };

  const handleMicClick = () => {
    if (mode === 'listening') {
      // Stop recording → triggers rec.onstop → transcribe → send
      mediaRecRef.current?.stop();
    } else if (mode === 'speaking') {
      stopAll();
    } else if (mode === 'idle') {
      startListening();
    }
  };

  const handleOpen = () => { setOpen(true); setTimeout(() => speak(WELCOME_MSG.text), 300); };
  const cancelReview = () => {
    clearTimeout(reviewTimerRef.current);
    setReview(null);
  };

  const handleClose = () => {
    clearTimeout(reviewTimerRef.current);
    setReview(null);
    stopAll();
    setOpen(false);
    setContext({});
  };

  const micBtnClass = {
    idle:       'bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-blue-500/40',
    listening:  'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/40 animate-pulse',
    processing: 'bg-gradient-to-br from-slate-600 to-slate-700 shadow-slate-500/30 cursor-not-allowed',
    speaking:   'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/40',
  }[mode];

  const posClass = above
    ? 'bottom-24 right-4 sm:bottom-28 sm:right-8'
    : 'bottom-5  right-4 sm:bottom-8  sm:right-8';

  return (
    <>
      <style>{`@keyframes va-wave { from { transform: scaleY(0.4); } to { transform: scaleY(1); } }`}</style>

      {/* Mobile backdrop */}
      {open && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 sm:hidden" onClick={handleClose} />}

      <div className={`fixed z-50 flex flex-col items-end gap-3 ${posClass}`}>

        {/* Panel */}
        {open && (
          <div className="flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-900/25 w-[calc(100vw-2rem)] sm:w-[380px]"
            style={{ height: 'min(520px, calc(100svh - 130px))' }}>

            {/* Header */}
            <div className="relative flex shrink-0 items-center gap-3 overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 px-5 py-4">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5" />
              <div className="absolute -bottom-6 right-6 h-16 w-16 rounded-full bg-white/5" />

              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-2 ring-white/25">
                <MedMicIcon className="h-6 w-6 text-white" />
                <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-indigo-700 ${
                  mode === 'listening' ? 'bg-red-400 animate-pulse'
                  : mode === 'speaking' ? 'bg-amber-400 animate-pulse'
                  : mode === 'processing' ? 'bg-slate-300 animate-pulse'
                  : 'bg-emerald-400'
                }`} />
              </div>

              <div className="relative z-10 min-w-0 flex-1">
                <p className="text-sm font-bold text-white">Voice Assistant</p>
                <div className="mt-0.5 flex items-center gap-2">
                  {mode === 'listening' ? (
                    <><Waveform active color="bg-red-300" /><span className="text-[11px] text-red-200">Listening — stops when you pause</span></>
                  ) : mode === 'speaking' ? (
                    <><Waveform active color="bg-amber-200" /><span className="text-[11px] text-amber-200">Speaking…</span></>
                  ) : mode === 'processing' ? (
                    <span className="text-[11px] text-blue-200 animate-pulse">Thinking…</span>
                  ) : (
                    <span className="text-[11px] text-blue-200">Tap the mic to speak</span>
                  )}
                </div>
              </div>

              <button onClick={handleClose}
                className="relative z-10 flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:scale-90 transition-all">
                <XIcon className="h-3.5 w-3.5 text-white" />
              </button>
            </div>

            {/* Conversation */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {msgs.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="h-7 w-7 shrink-0 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center mt-0.5">
                      <SparklesIcon className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                  }`}>
                    {m.text}
                    {m.role === 'assistant' && /appointment.*booked|booked.*appointment/i.test(m.text) && (
                      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-emerald-200 text-emerald-600 text-xs font-medium">
                        <CheckIcon className="h-3 w-3" /> Appointment booked
                      </div>
                    )}
                  </div>
                  {m.role === 'user' && (
                    <div className="h-7 w-7 shrink-0 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mt-0.5">
                      <MicIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                </div>
              ))}

              {/* Live interim transcript */}
              {liveText && (
                <div className="flex justify-end gap-2">
                  <div className="max-w-[82%] rounded-2xl rounded-br-sm px-3.5 py-2.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 italic">
                    {liveText}…
                  </div>
                  <div className="h-7 w-7 shrink-0 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mt-0.5">
                    <MicIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              )}

              {/* Transcript review — 2s window to cancel before sending */}
              {review && (
                <div className="flex justify-end gap-2 items-start">
                  <div className="max-w-[82%] rounded-2xl rounded-br-sm bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 px-3.5 py-2.5">
                    <p className="text-sm text-blue-700 dark:text-blue-300">{review}</p>
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-blue-200 dark:border-blue-800">
                      <span className="text-[10px] text-blue-400">Sending in 2s…</span>
                      <button onClick={cancelReview}
                        className="text-[11px] font-semibold text-red-500 hover:text-red-600 flex items-center gap-1">
                        <XIcon className="w-3 h-3" /> Cancel
                      </button>
                    </div>
                  </div>
                  <div className="h-7 w-7 shrink-0 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mt-0.5">
                    <MicIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              )}

              {/* Processing dots */}
              {mode === 'processing' && (
                <div className="flex gap-2 justify-start">
                  <div className="h-7 w-7 shrink-0 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center mt-0.5">
                    <SparklesIcon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="rounded-2xl rounded-bl-sm bg-slate-100 dark:bg-slate-800 px-4 py-3 flex items-center gap-1.5">
                    {[0, 0.2, 0.4].map((d) => (
                      <div key={d} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Mic error */}
            {micErr && (
              <div className="mx-4 mb-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40 px-3 py-2 text-xs text-red-600 dark:text-red-400">
                {micErr}
              </div>
            )}

            {/* Bottom mic area */}
            <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 px-4 py-4 flex flex-col items-center gap-3">
              <button
                onClick={handleMicClick}
                disabled={mode === 'processing'}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95 ${micBtnClass}`}
                title={mode === 'listening' ? 'Stop listening' : mode === 'speaking' ? 'Stop speaking' : 'Start listening'}
              >
                {mode === 'speaking'
                  ? <VolumeIcon className="h-7 w-7 text-white" />
                  : mode === 'processing'
                  ? <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  : <MicIcon className="h-7 w-7 text-white" />}
              </button>
              <p className="text-xs text-slate-400 text-center">
                {mode === 'listening' ? 'Speaking… stops automatically when you pause' : mode === 'speaking' ? 'Tap to stop speaking' : 'Tap mic and speak in English or Urdu'}
              </p>
            </div>
          </div>
        )}

        {/* Toggle button */}
        {!open && (
          <button
            onClick={handleOpen}
            className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-95 transition-all duration-200"
            title="Voice Assistant"
          >
            <MicIcon className="h-6 w-6 text-white" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 border-2 border-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
            </span>
          </button>
        )}
      </div>
    </>
  );
}
