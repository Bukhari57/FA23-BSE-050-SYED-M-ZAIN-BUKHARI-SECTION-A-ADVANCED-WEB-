const Groq = require('groq-sdk');
const pool = require('../config/db');

const SYSTEM_PROMPT = `You are Doctor Hub AI — a friendly, warm, and knowledgeable health assistant for the Doctor Hub platform. You help users with everything related to Doctor Hub AND general health questions, while also responding naturally to casual conversation.

## DOCTOR HUB — COMPLETE PLATFORM GUIDE

Doctor Hub is a comprehensive healthcare management platform in Pakistan with the following features:

**For Patients:**
- **Find Doctors**: Search verified doctors by name, specialization, city, disease, or treatment type (allopathic/homeopathic/herbal)
- **Book Appointments**: Select a doctor → choose a clinic → pick a date & time slot → confirm booking
- **Upload Payment**: After booking, go to My Appointments → Upload Payment screenshot (bank transfer, JazzCash, or EasyPaisa)
- **Track Appointments**: View all appointments with status (Pending Payment → Payment Uploaded → Payment Verified → Confirmed → Completed)
- **Medical History**: View diagnoses and treatment records added by your doctors
- **Prescriptions**: View digital prescriptions issued by your doctors with medicines and notes
- **My Reports**: Upload and store lab reports, X-rays, scans, and other medical documents
- **Messages**: Chat directly with your doctor or their assistant
- **AI Assistant**: That's me! I'm here to help 24/7

**For Doctors:**
- Manage appointment schedule and availability
- View patient appointments and mark them completed
- Write prescriptions and view patient medical history
- Set up clinic locations, timings, and consultation fee
- Upload profile picture and bank/payment details
- Chat with patients via Messages

**For Assistants:**
- Verify patient payment screenshots
- Manage doctor's appointment workflow
- Communicate with patients on behalf of the doctor

**Payment Methods Accepted:**
- Bank transfer (account details shown on My Appointments page)
- JazzCash mobile wallet
- EasyPaisa mobile wallet
- QR code scan to pay

**How to Book an Appointment (Step by Step):**
1. Go to "Find Doctors" in the sidebar
2. Search by name, specialization, or disease
3. Click "Book Appointment" on the doctor card
4. Select a clinic, date, and available time slot
5. Add any notes for the doctor (optional)
6. Confirm the booking
7. You'll see the doctor's payment details — send the fee
8. Upload your payment screenshot on the My Appointments page
9. Wait for the assistant to verify → appointment confirmed!

## CASUAL CONVERSATION — ALWAYS RESPOND, NEVER REFUSE
You MUST respond naturally and warmly to ALL of these — never say "I'm here specifically for...":
- ANY greeting: "hi", "hello", "hey", "salam", "assalam o alaikum", "good morning", "kee ho", "kesy ho", "kaise ho", "theek ho", "kya haal hai", "kya haal", "what's up", "sup"
- Wellbeing questions: "how are you", "ap kaise hain", "theek hain", "kaisa chal raha hai"
- Expressions: "ok", "thanks", "shukriya", "theek hai", "acha", "wah", "nice"

For greetings → reply warmly (1–2 sentences) in the same language/style, then offer to help.
Example: User says "kesy ho" → "Theek hain, shukriya! Ap batao, kya main ap ki kuch madad kar sakta hoon — doctor dhundna hai ya appointment book karni hai?"

## HEALTH GUIDANCE
- Give helpful general health information and symptom guidance
- Always recommend consulting a real doctor for diagnosis or treatment
- Suggest booking on Doctor Hub when relevant
- NEVER prescribe specific medicines or dosages
- NEVER officially diagnose a condition

## EMERGENCY — ABSOLUTE PRIORITY
If the user mentions chest pain, difficulty breathing, stroke, severe bleeding, unconsciousness, seizures, or suicidal thoughts, IMMEDIATELY reply:
"⚠️ This sounds like a medical emergency. Call Rescue 1122 or Edhi 115 immediately, or go to the nearest emergency room. Do not wait."

## HARD LIMITS (only for completely off-topic requests)
If asked about coding, programming, politics, religion, entertainment, sports, or other unrelated topics, say:
"I'm here specifically for health and Doctor Hub help. For that topic, a general assistant would be better. Is there anything about your health or appointments I can help with?"

## LANGUAGE RULES — STRICTLY FOLLOW
- Detect the user's writing style FIRST.
- Urdu script (ا ب پ ت): reply 100% in Urdu Arabic script. FORBIDDEN: Devanagari/Hindi characters (क ख ग) — these are Hindi, NOT Urdu. FORBIDDEN: Roman letters.
- Roman Urdu (e.g. "ap kaise hain", "doctor dhundna hai"): reply in Roman Urdu ONLY — spell Urdu words in English letters exactly as the user does. Do NOT switch to Urdu script.
- English: reply in English only.
- Mirror the user's style exactly. Never mix scripts.

## RESPONSE RULES
- Be warm, friendly, and conversational — not robotic
- Keep replies concise (2–4 sentences for simple questions, more for platform guides)
- Format lists clearly when showing platform data
- When [PLATFORM DATA] is provided, present it clearly and helpfully`;

// ── Intent detection ─────────────────────────────────────────────────────────
const detectIntent = (text) => {
  const t = text.toLowerCase();

  if (/(list|show|all|available|find|search|dhundna|dikhao|batao|naam|کون سے|فہرست|دکھاؤ|دکھائیں|ڈاکٹر).*(doctor|dr\b|ڈاکٹر|specialist|معالج|physician)|(doctor|dr\b|ڈاکٹر).*(list|show|all|naam|کون|فہرست|دکھ|dhundna|dikhao|batao)/.test(t))
    return 'list_doctors';

  if (/(my|mera|meri|میری|میرے).*(appointment|ایپوائنٹمنٹ)|appointment.*(my|mera|meri|میری|list|show|دکھ|فہرست|dikhao|batao)/.test(t))
    return 'my_appointments';

  if (/(my|mera|meri|میری|میرے).*(prescription|nuskha|دوا|نسخہ|دوائی)|prescription.*(show|list|دکھ|dikhao)/.test(t))
    return 'my_prescriptions';

  if (/(my|mera|meri|میری|میرے).*(report|رپورٹ)|report.*(show|list|دکھ|dikhao)/.test(t))
    return 'my_reports';

  if (/(payment|ادائیگی|پیمنٹ).*(history|status|list|show|دکھ|حالت|dikhao)|(my|mera|meri|میری).*(payment|ادائیگی)/.test(t))
    return 'my_payments';

  if (/(clinic|کلینک).*(list|show|all|فہرست|دکھ|dikhao|batao)|available.*(clinic|کلینک)/.test(t))
    return 'list_clinics';

  return null;
};

// ── Fetch platform data ───────────────────────────────────────────────────────
const fetchPlatformData = async (intent, user) => {
  try {
    if (intent === 'list_doctors') {
      const { rows } = await pool.query(`
        SELECT u.name, d.specialization, d.treatment_type, d.consultation_fee, d.diseases
        FROM doctors d
        JOIN users u ON u.id = d.user_id
        WHERE d.is_verified = true
        ORDER BY u.name
        LIMIT 20
      `);
      if (!rows.length) return 'No verified doctors found on the platform yet.';
      return 'Available doctors on Doctor Hub:\n' +
        rows.map((d, i) =>
          `${i + 1}. Dr. ${d.name}` +
          (d.specialization ? ` — ${d.specialization}` : '') +
          (d.consultation_fee ? ` — Fee: Rs. ${d.consultation_fee}` : '') +
          (d.treatment_type ? ` (${d.treatment_type})` : '')
        ).join('\n');
    }

    if (intent === 'my_appointments' && user) {
      const { rows } = await pool.query(`
        SELECT a.appointment_date, a.appointment_time, a.status,
               ud.name AS doctor_name, d.specialization, c.name AS clinic_name
        FROM appointments a
        JOIN doctors d ON d.id = a.doctor_id
        JOIN users ud ON ud.id = d.user_id
        JOIN patients pt ON pt.id = a.patient_id
        JOIN users up ON up.id = pt.user_id
        JOIN clinics c ON c.id = a.clinic_id
        WHERE up.id = $1
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
        LIMIT 10
      `, [user.id]);
      if (!rows.length) return 'You have no appointments yet.';
      return 'Your appointments:\n' +
        rows.map((a, i) =>
          `${i + 1}. Dr. ${a.doctor_name} (${a.specialization || 'General'}) — ${a.appointment_date} at ${a.appointment_time?.slice(0,5)} — ${a.clinic_name} — Status: ${a.status.replace(/_/g, ' ')}`
        ).join('\n');
    }

    if (intent === 'my_prescriptions' && user) {
      const { rows } = await pool.query(`
        SELECT p.created_at, ud.name AS doctor_name, p.medicines, p.notes
        FROM prescriptions p
        JOIN patients pt ON pt.id = p.patient_id
        JOIN users up ON up.id = pt.user_id
        JOIN doctors d ON d.id = p.doctor_id
        JOIN users ud ON ud.id = d.user_id
        WHERE up.id = $1
        ORDER BY p.created_at DESC
        LIMIT 5
      `, [user.id]);
      if (!rows.length) return 'You have no prescriptions yet.';
      return 'Your recent prescriptions:\n' +
        rows.map((p, i) => {
          const meds = Array.isArray(p.medicines) ? p.medicines.map(m => m.name || m).join(', ') : '';
          return `${i + 1}. From Dr. ${p.doctor_name} on ${new Date(p.created_at).toLocaleDateString()}${meds ? ' — Medicines: ' + meds : ''}${p.notes ? ' — Note: ' + p.notes : ''}`;
        }).join('\n');
    }

    if (intent === 'my_reports' && user) {
      const { rows } = await pool.query(`
        SELECT r.title, r.category, r.created_at, r.notes
        FROM patient_reports r
        JOIN patients pt ON pt.id = r.patient_id
        JOIN users u ON u.id = pt.user_id
        WHERE u.id = $1
        ORDER BY r.created_at DESC
        LIMIT 10
      `, [user.id]);
      if (!rows.length) return 'You have no medical reports uploaded yet.';
      return 'Your medical reports:\n' +
        rows.map((r, i) =>
          `${i + 1}. ${r.title} (${r.category}) — ${new Date(r.created_at).toLocaleDateString()}${r.notes ? ' — ' + r.notes : ''}`
        ).join('\n');
    }

    if (intent === 'my_payments' && user) {
      const { rows } = await pool.query(`
        SELECT pay.amount, pay.status, pay.created_at, ud.name AS doctor_name
        FROM payments pay
        JOIN appointments a ON a.id = pay.appointment_id
        JOIN doctors d ON d.id = a.doctor_id
        JOIN users ud ON ud.id = d.user_id
        JOIN patients pt ON pt.id = a.patient_id
        JOIN users up ON up.id = pt.user_id
        WHERE up.id = $1
        ORDER BY pay.created_at DESC
        LIMIT 10
      `, [user.id]);
      if (!rows.length) return 'You have no payment records yet.';
      return 'Your payment history:\n' +
        rows.map((p, i) =>
          `${i + 1}. Rs. ${p.amount} — Dr. ${p.doctor_name} — Status: ${p.status} — ${new Date(p.created_at).toLocaleDateString()}`
        ).join('\n');
    }

    if (intent === 'list_clinics') {
      const { rows } = await pool.query(`SELECT name, address, city FROM clinics ORDER BY name LIMIT 20`);
      if (!rows.length) return 'No clinics found on the platform yet.';
      return 'Available clinics on Doctor Hub:\n' +
        rows.map((c, i) => `${i + 1}. ${c.name}${c.city ? ' — ' + c.city : ''}${c.address ? ' — ' + c.address : ''}`).join('\n');
    }
  } catch (err) {
    console.error('fetchPlatformData error:', err.message);
  }
  return null;
};

// ── Handler ───────────────────────────────────────────────────────────────────
const sendMessage = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }
    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({ success: false, message: 'AI service not configured.' });
    }

    const userText = message.trim();
    const hasUrduScript  = /[؀-ۿ]/.test(userText);
    const hasRomanUrdu   = !hasUrduScript && /\b(ap|aap|kya|kia|hai|hain|ho|kesy|kee|mujhe|kaise|chahiye|chahte|batao|bata|naam|nahi|nhi|theek|mera|meri|wala|wali|dhundna|dikhao|karo|yahan|wahan|kitna|kab|kyun|kuch|sab|hoga|raha|rahi|rhe|kal|aaj|abhi|zaroor|shukriya|meherbani|janab|bhai|plz|thx|bohat|bohot|bilkul|zarur|pata|samajh|samjhe|lagta|lagti|doctor|dr|appointment|clinic|karo|kerna|karna|karun|karein|karain|dekhna|milna|book|fee|slot|available|zyada|kam|band|waqt|tarikh|ghanta|minute|salam|assalam|walaikum|theek|accha|acha|wah|bhai|yaar|dost|haan|nahi|chalo|phir|dobara|abhi|pehle|baad|sath|bina|liye|ko|se|mein|per|tak|tha|thi|the|ho|hain|hoon)\b/i.test(userText);

    const langInstruction = hasUrduScript
      ? `CRITICAL LANGUAGE RULE: Reply in Pakistani Urdu script ONLY.
- Use ONLY Arabic/Urdu Nastaleeq script (ا ب پ ت ث ج چ etc.)
- STRICTLY FORBIDDEN: Devanagari (Hindi) characters like (क ख ग घ प) — Hindi, NOT Urdu
- STRICTLY FORBIDDEN: Roman/English letters in your reply
- Write foreign words in Urdu script: "ڈاکٹر", "پلیٹ فارم", "ایپوائنٹمنٹ"`
      : hasRomanUrdu
      ? `CRITICAL LANGUAGE RULE: The user is writing in Roman Urdu (Urdu words spelled in English letters).
YOU MUST reply in Roman Urdu ONLY — every single word must be in Roman Urdu.
- Write ALL words in English/Latin letters just like the user: e.g. "Theek hai, ap ka appointment book ho gaya. Doctor dhundne ke liye Find Doctors mein jayen."
- FORBIDDEN: ANY Urdu/Arabic script characters (ا ب پ etc.)
- FORBIDDEN: Devanagari script
- FORBIDDEN: switching to English sentences
- Mirror the user's casual spelling and tone exactly. If they write "kesy ho" reply like "Bilkul theek hoon, shukriya! Ap batao, kya madad kar sakta hoon?"`
      : 'CRITICAL LANGUAGE RULE: Reply in English ONLY. Do not use any Urdu, Arabic, Hindi, or Devanagari characters.';

    // Detect intent and fetch real data
    const intent = detectIntent(userText);
    const platformData = intent ? await fetchPlatformData(intent, req.user) : null;

    const userContent = platformData
      ? `${userText}\n\n[PLATFORM DATA — present this to the user clearly]:\n${platformData}`
      : userText;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const messages = [
      { role: 'system', content: `${SYSTEM_PROMPT}\n\n${langInstruction}` },
      ...history.slice(-10).map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
      { role: 'user', content: userContent },
    ];

    // Try primary model, fall back to faster/higher-limit model on rate limit
    const MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
    let completion;
    for (const model of MODELS) {
      try {
        completion = await groq.chat.completions.create({ model, messages, max_tokens: 1024, temperature: 0.5 });
        break;
      } catch (e) {
        if (e.status === 429 && model !== MODELS[MODELS.length - 1]) continue;
        throw e;
      }
    }

    const reply = completion.choices[0]?.message?.content || 'I apologize, I could not generate a response. Please try again.';
    return res.json({ success: true, data: { reply } });
  } catch (err) {
    if (err.status === 401) return res.status(503).json({ success: false, message: 'Invalid AI API key.' });
    if (err.status === 429) return res.status(503).json({ success: false, message: "The AI assistant has reached its daily usage limit. It will reset in a few hours — please try again later or visit console.groq.com to upgrade." });
    next(err);
  }
};

module.exports = { sendMessage };
