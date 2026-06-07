import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { MessageIcon, UserIcon } from '../../components/Icons';

export default function PatientMessages() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [thread, setThread] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

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

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="page-header">Messages</h1>
        <p className="page-subtitle">Chat with your doctors</p>
      </div>

      <div className="card overflow-hidden" style={{ height: '70vh', display: 'flex' }}>
        {/* Contact list */}
        <div className="w-64 border-r border-slate-100 flex flex-col flex-shrink-0">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Your Doctors</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {contacts.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-400 text-sm">
                Book an appointment first to message a doctor
              </div>
            ) : (
              contacts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
                    selected?.id === c.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                  }`}
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center font-bold text-emerald-700 flex-shrink-0">
                    {c.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">Dr. {c.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{c.role}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageIcon className="w-14 h-14 text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium">Select a doctor to start chatting</p>
              <p className="text-slate-400 text-sm mt-1">Your conversation will appear here</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center font-bold text-emerald-700">
                  {selected.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Dr. {selected.name}</p>
                  <p className="text-xs text-slate-400">Doctor</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {thread.length === 0 && (
                  <div className="text-center text-slate-400 text-sm py-8">No messages yet. Say hello!</div>
                )}
                {thread.map((m) => {
                  const isMe = m.sender_id === user?.id;
                  return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs sm:max-w-sm lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-br-md'
                          : 'bg-slate-100 text-slate-900 rounded-bl-md'
                      }`}>
                        <p className="leading-relaxed">{m.content}</p>
                        <p className={`text-[11px] mt-1 ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="px-4 py-3 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message…"
                  className="input flex-1"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={sending || !text.trim()}
                  className="btn-primary px-4 flex-shrink-0 disabled:opacity-50"
                >
                  {sending ? '…' : 'Send'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
