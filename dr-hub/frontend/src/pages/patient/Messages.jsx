import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { MessageIcon, ArrowLeftIcon } from '../../components/Icons';

export default function PatientMessages() {
  const { user } = useAuth();
  const [contacts, setContacts]   = useState([]);
  const [selected, setSelected]   = useState(null);
  const [mobileView, setMobileView] = useState('contacts'); // 'contacts' | 'chat'
  const [thread, setThread]       = useState([]);
  const [text, setText]           = useState('');
  const [sending, setSending]     = useState(false);
  const bottomRef = useRef(null);
  const pollRef   = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    api.get('/messages/contacts')
      .then(({ data }) => setContacts(data.data || []))
      .catch(console.error);
  }, []);

  const loadThread = (userId) => {
    api.get(`/messages/${userId}`)
      .then(({ data }) => {
        setThread(data.data || []);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (!selected) return;
    loadThread(selected.id);
    pollRef.current = setInterval(() => loadThread(selected.id), 5000);
    return () => clearInterval(pollRef.current);
  }, [selected]);

  const selectContact = (c) => {
    setSelected(c);
    setMobileView('chat');
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selected) return;
    setSending(true);
    try {
      await api.post('/messages', { recipient_id: selected.id, content: text.trim() });
      setText('');
      loadThread(selected.id);
    } catch (err) {
      alert(err.response?.data?.message || 'Send failed.');
    } finally {
      setSending(false);
    }
  };

  const inChat = mobileView === 'chat';

  return (
    <div className="animate-fade-in flex flex-col gap-4">
      {/* Page title — Navbar already shows it on mobile */}
      <div className="hidden sm:block">
        <h1 className="page-header">Messages</h1>
        <p className="page-subtitle">Chat with your doctors</p>
      </div>

      {/* Chat shell — fills viewport below navbar on mobile */}
      <div className="card overflow-hidden flex h-[calc(100dvh-72px)] sm:h-[calc(100dvh-90px)] md:h-[70vh]">

        {/* ── Contact list ──────────────────────────── */}
        <div className={`
          ${inChat ? 'hidden' : 'flex'} md:flex
          w-full md:w-72 border-r border-slate-100 flex-col flex-shrink-0
        `}>
          <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Your Doctors</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {contacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                <MessageIcon className="w-10 h-10 text-slate-200 mb-3" />
                <p className="text-sm font-medium text-slate-500">No contacts yet</p>
                <p className="text-xs text-slate-400 mt-1">Book an appointment to message a doctor</p>
              </div>
            ) : (
              contacts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => selectContact(c)}
                  className={`w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-slate-50 active:bg-slate-100 transition-colors border-b border-slate-50 ${
                    selected?.id === c.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="w-11 h-11 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center font-bold text-emerald-700 text-sm flex-shrink-0">
                    {c.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{c.name}</p>
                    <p className="text-xs text-slate-400 capitalize mt-0.5">{c.role}</p>
                  </div>
                  <svg className="w-4 h-4 text-slate-300 md:hidden flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Chat area ──────────────────────────────── */}
        <div className={`
          ${inChat ? 'flex' : 'hidden'} md:flex
          flex-1 flex-col min-w-0
        `}>
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageIcon className="w-14 h-14 text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium">Select a doctor to start chatting</p>
              <p className="text-slate-400 text-sm mt-1">Your conversation will appear here</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-3 sm:px-4 py-3 border-b border-slate-100 flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setMobileView('contacts')}
                  className="md:hidden p-2 -ml-1 rounded-xl text-slate-500 hover:bg-slate-100 active:bg-slate-200 transition-colors flex-shrink-0"
                  aria-label="Back to contacts"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center font-bold text-emerald-700 text-sm flex-shrink-0">
                  {selected.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 text-sm truncate">{selected.name}</p>
                  <p className="text-xs text-slate-400">Doctor</p>
                </div>
              </div>

              {/* Messages scroll area */}
              <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-3">
                {thread.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-400 text-sm">No messages yet. Say hello!</p>
                  </div>
                ) : (
                  thread.map((m) => {
                    const isMe = m.sender_id === user?.id;
                    return (
                      <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[78%] sm:max-w-sm lg:max-w-md px-3 sm:px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-slate-100 text-slate-900 rounded-bl-sm'
                        }`}>
                          <p className="leading-relaxed break-words">{m.content}</p>
                          <p className={`text-[11px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input bar */}
              <form onSubmit={handleSend} className="px-3 sm:px-4 py-3 border-t border-slate-100 flex items-center gap-2 flex-shrink-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message…"
                  className="input flex-1 min-w-0 py-2.5"
                />
                <button
                  type="submit"
                  disabled={sending || !text.trim()}
                  className="btn-primary flex-shrink-0 w-10 h-10 sm:w-auto sm:px-4 p-0 sm:p-0 flex items-center justify-center gap-1.5 disabled:opacity-50 rounded-xl"
                >
                  {sending ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                      <span className="hidden sm:inline text-sm">Send</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
