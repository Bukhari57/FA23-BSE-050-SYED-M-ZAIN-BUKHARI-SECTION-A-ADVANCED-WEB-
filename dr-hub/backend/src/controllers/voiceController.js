const Groq = require('groq-sdk');
const pool = require('../config/db');

// ─── Tools ─────────────────────────────────────────────────────────────────────
const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_doctors',
      description: 'Search for verified doctors on the platform. Use this when the patient asks to find a doctor, mentions a specialization, or wants to book an appointment.',
      parameters: {
        type: 'object',
        properties: {
          search: { type: 'string', description: 'Doctor name or specialization keyword' },
          treatment_type: { type: 'string', description: 'Treatment type filter: allopathic, homeopathic, or herbal. Leave empty or omit if not specified.' },
          city: { type: 'string', description: 'City name to filter by' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_available_slots',
      description: 'Get available appointment time slots for a specific doctor on a specific date. Use this after the patient picks a doctor and a date.',
      parameters: {
        type: 'object',
        properties: {
          doctor_id: { type: 'string', description: 'The UUID of the doctor' },
          date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
          clinic_id: { type: 'string', description: 'Optional clinic UUID to filter slots' },
        },
        required: ['doctor_id', 'date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'book_appointment',
      description: 'Book an appointment for the currently logged-in patient. Only call this after confirming doctor, clinic, date, and time with the patient.',
      parameters: {
        type: 'object',
        properties: {
          doctor_id: { type: 'string', description: 'UUID of the doctor' },
          clinic_id: { type: 'string', description: 'UUID of the clinic' },
          appointment_date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
          appointment_time: { type: 'string', description: 'Time in HH:MM format (24-hour)' },
          patient_notes: { type: 'string', description: 'Optional notes from the patient about their symptoms' },
        },
        required: ['doctor_id', 'clinic_id', 'appointment_date', 'appointment_time'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_my_appointments',
      description: 'Get the patient\'s upcoming or recent appointments. Use when the patient asks about their appointments or payment status.',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', description: 'Filter by status: pending, confirmed, completed, cancelled' },
        },
        required: [],
      },
    },
  },
];

// ─── Tool execution ─────────────────────────────────────────────────────────────
const execTool = async (name, args, userId) => {
  if (name === 'search_doctors') {
    const conditions = ['d.is_verified = true', 'u.is_active = true'];
    const params = [];

    if (args.search) {
      params.push(`%${args.search}%`);
      conditions.push(`(u.name ILIKE $${params.length} OR d.specialization ILIKE $${params.length})`);
    }
    if (args.treatment_type) {
      params.push(args.treatment_type);
      conditions.push(`d.treatment_type = $${params.length}`);
    }
    if (args.city) {
      params.push(`%${args.city}%`);
      conditions.push(
        `d.id IN (SELECT dc.doctor_id FROM doctor_clinics dc JOIN clinics c ON c.id = dc.clinic_id WHERE c.city ILIKE $${params.length})`
      );
    }

    const where = 'WHERE ' + conditions.join(' AND ');
    const { rows } = await pool.query(
      `SELECT d.id AS doctor_id, u.name, d.specialization, d.treatment_type,
              d.consultation_fee, d.qualification,
              COALESCE(
                json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name, 'city', c.city))
                FILTER (WHERE c.id IS NOT NULL), '[]'
              ) AS clinics
       FROM doctors d
       JOIN users u ON u.id = d.user_id
       LEFT JOIN doctor_clinics dc ON dc.doctor_id = d.id
       LEFT JOIN clinics c ON c.id = dc.clinic_id
       ${where}
       GROUP BY d.id, u.name, d.specialization, d.treatment_type, d.consultation_fee, d.qualification
       ORDER BY u.name LIMIT 10`,
      params
    );

    if (!rows.length) return { found: false, message: 'No doctors found matching your search.' };
    return {
      found: true,
      count: rows.length,
      doctors: rows.map((d) => ({
        doctor_id: d.doctor_id,
        name: d.name,
        specialization: d.specialization,
        treatment_type: d.treatment_type,
        consultation_fee: d.consultation_fee,
        clinics: d.clinics,
      })),
    };
  }

  if (name === 'get_available_slots') {
    const { doctor_id, date, clinic_id } = args;
    const dayName = new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    const schedQ = clinic_id
      ? 'SELECT * FROM doctor_schedules WHERE doctor_id=$1 AND clinic_id=$2 AND day=$3 AND is_available=true'
      : 'SELECT * FROM doctor_schedules WHERE doctor_id=$1 AND day=$2 AND is_available=true';
    const schedP = clinic_id ? [doctor_id, clinic_id, dayName] : [doctor_id, dayName];

    const { rows: schedules } = await pool.query(schedQ, schedP);
    if (!schedules.length) return { available: false, message: `No schedule on ${dayName}s.` };

    const { rows: booked } = await pool.query(
      `SELECT appointment_time FROM appointments WHERE doctor_id=$1 AND appointment_date=$2 AND status NOT IN ('cancelled')`,
      [doctor_id, date]
    );
    const bookedSet = new Set(booked.map((r) => r.appointment_time.slice(0, 5)));

    const slots = [];
    for (const s of schedules) {
      const [sh, sm] = s.start_time.split(':').map(Number);
      const [eh, em] = s.end_time.split(':').map(Number);
      let cur = sh * 60 + sm;
      while (cur + s.slot_duration_mins <= eh * 60 + em) {
        const hh = String(Math.floor(cur / 60)).padStart(2, '0');
        const mm = String(cur % 60).padStart(2, '0');
        const t = `${hh}:${mm}`;
        if (!bookedSet.has(t)) slots.push({ time: t, clinic_id: s.clinic_id });
        cur += s.slot_duration_mins;
      }
    }

    if (!slots.length) return { available: false, message: `All slots on ${date} are booked.` };
    return { available: true, date, slots };
  }

  if (name === 'book_appointment') {
    const { doctor_id, clinic_id, appointment_date, appointment_time, patient_notes } = args;

    const { rows: [pt] } = await pool.query('SELECT id FROM patients WHERE user_id=$1', [userId]);
    if (!pt) throw new Error('Patient profile not found.');

    const { rows: [appt] } = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, clinic_id, appointment_date, appointment_time, patient_notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING id`,
      [pt.id, doctor_id, clinic_id, appointment_date, appointment_time, patient_notes || null]
    );

    return {
      success: true,
      appointment_id: appt.id,
      message: `Appointment booked for ${appointment_date} at ${appointment_time}. Please upload your payment screenshot in My Appointments.`,
    };
  }

  if (name === 'get_my_appointments') {
    const conditions = ['up.id = $1'];
    const params = [userId];
    if (args.status) { params.push(args.status); conditions.push(`a.status = $${params.length}`); }

    const { rows } = await pool.query(
      `SELECT a.id, a.appointment_date, a.appointment_time, a.status,
              ud.name AS doctor_name, d.specialization, c.name AS clinic_name,
              pay.status AS payment_status, pay.amount
       FROM appointments a
       JOIN doctors d ON d.id = a.doctor_id
       JOIN users ud ON ud.id = d.user_id
       JOIN patients pt ON pt.id = a.patient_id
       JOIN users up ON up.id = pt.user_id
       JOIN clinics c ON c.id = a.clinic_id
       LEFT JOIN payments pay ON pay.appointment_id = a.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY a.appointment_date DESC, a.appointment_time DESC
       LIMIT 5`,
      params
    );

    if (!rows.length) return { found: false, message: 'No appointments found.' };
    return {
      found: true,
      appointments: rows.map((a) => ({
        date: a.appointment_date,
        time: a.appointment_time?.slice(0, 5),
        doctor: a.doctor_name,
        specialization: a.specialization,
        clinic: a.clinic_name,
        status: a.status.replace(/_/g, ' '),
        payment: a.payment_status || 'not uploaded',
      })),
    };
  }

  return { error: 'Unknown tool' };
};

// ─── Language detection (mirrors chatController logic) ────────────────────────
const detectLang = (text) => {
  const hasUrduScript = /[؀-ۿ]/.test(text);
  const hasRomanUrdu  = !hasUrduScript && /\b(ap|aap|kya|kia|hai|hain|ho|kesy|kee|mujhe|kaise|chahiye|chahte|batao|bata|naam|nahi|nhi|theek|mera|meri|wala|wali|dhundna|dikhao|karo|yahan|wahan|kitna|kab|kyun|kuch|sab|hoga|raha|rahi|rhe|kal|aaj|abhi|zaroor|shukriya|meherbani|janab|bhai|bohat|bohot|bilkul|zarur|pata|samajh|samjhe|lagta|lagti|doctor|dr|appointment|clinic|karna|kero|dekhna|milna|book|fee|slot|available|karo|kerna|karun|karein|karain|zyada|kam|band|khula|waqt|time|date|tarikh|ghanta|minute)\b/i.test(text);

  if (hasUrduScript) return 'urdu_script';
  if (hasRomanUrdu)  return 'roman_urdu';
  return 'english';
};

const LANG_RULE = {
  urdu_script:  'CRITICAL — LANGUAGE RULE: The user spoke/wrote in Urdu. Reply in Roman Urdu ONLY (Urdu words spelled in English letters like "Doctor Ahmed ko dhundha, woh Lahore mein hain"). NEVER use Urdu Arabic script or Devanagari in your reply.',
  roman_urdu:   'CRITICAL — LANGUAGE RULE: The user is speaking Roman Urdu (Urdu words in English letters). You MUST reply in Roman Urdu ONLY. Write every word in English letters exactly like the user does. Example reply: "Ji zaroor, maine Doctor Ahmed ko dhundha. Woh cardiologist hain aur Lahore mein clinic hai. Kya aap unse appointment lena chahte hain?" NEVER switch to English or Urdu script.',
  english:      'CRITICAL — LANGUAGE RULE: The user is speaking English. Reply in English ONLY.',
};

// ─── Prompts ───────────────────────────────────────────────────────────────────
const buildIntentSystem = (today, ctxStr, langRule) => `You are a Doctor Hub voice assistant intent classifier. Output ONLY valid JSON — no other text.

${ctxStr ? `ACTIVE CONTEXT (use these IDs directly — do NOT search again): ${ctxStr}` : ''}

Output ONE of these shapes:

Call a function (when you need data):
{"call":"function_name","args":{...}}

Reply directly (when no data is needed):
{"reply":"spoken response here"}

AVAILABLE FUNCTIONS:
- search_doctors  args: search (name/spec), city, treatment_type (allopathic|homeopathic|herbal)
- get_available_slots  args: doctor_id (UUID), date (YYYY-MM-DD), clinic_id (UUID)
- book_appointment  args: doctor_id (UUID), clinic_id (UUID), appointment_date (YYYY-MM-DD), appointment_time (HH:MM), patient_notes
- get_my_appointments  args: status (pending|confirmed|completed) — optional

RULES:
- NEVER invent a doctor_id or clinic_id. Only use UUIDs from ACTIVE CONTEXT or history.
- If you need doctor_id but don't have it, call search_doctors first.
- Omit any arg that is empty or unknown — never pass "".
- For "reply" values: 1-3 spoken sentences, no markdown.
- ${langRule}
- Today = ${today}`;

const buildReplySystem = (langRule) => `You are Doctor Hub Voice Assistant — a warm, friendly spoken health assistant for a Pakistani healthcare platform.
Given the conversation and a tool result, speak a natural reply.

${langRule}

CONTENT RULES:
- 1-3 spoken sentences only. No markdown, no asterisks, no bullet points, no numbering.
- Name results naturally: "Maine Doctor Ahmed Ali ko dhundha, woh cardiologist hain aur Lahore mein clinic hai."
- After showing slots, ask which time the patient prefers.
- Before booking, confirm details with the patient first.
- If tool returned an error or empty result, say so naturally.
- Emergency (chest pain / breathing difficulty): "Yeh emergency lag rahi hai. Abhi Rescue 1122 call karein."
- Never diagnose or prescribe.`;

// Strip empty/null values from args
const cleanArgs = (args) => {
  const out = {};
  for (const [k, v] of Object.entries(args || {})) {
    if (v !== '' && v !== null && v !== undefined) out[k] = v;
  }
  return out;
};

// Try primary model, fall back to faster model on rate limit
const MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
const groqCreate = async (groq, opts) => {
  for (const model of MODELS) {
    try {
      return await groq.chat.completions.create({ ...opts, model });
    } catch (e) {
      if (e.status === 429 && model !== MODELS[MODELS.length - 1]) continue;
      throw e;
    }
  }
};

// ─── Handler ──────────────────────────────────────────────────────────────────
const voiceMessage = async (req, res, next) => {
  try {
    const { message, history = [], context = {} } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message is required.' });
    if (!process.env.GROQ_API_KEY) return res.status(503).json({ success: false, message: 'AI service not configured.' });

    const groq    = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const userId  = req.user.id;
    const today   = new Date().toISOString().split('T')[0];
    const lang    = detectLang(message.trim());
    const langRule = LANG_RULE[lang];

    // Conversation history for the LLM (last 8 turns)
    const conv = history.slice(-8).map((m) => ({ role: m.role, content: m.content }));
    conv.push({ role: 'user', content: message.trim() });

    const ctxStr = Object.keys(context).length ? JSON.stringify(context) : '';

    // ── Phase 1: Classify intent via JSON mode ──────────────────────────────
    let parsed = {};
    try {
      const intentResp = await groqCreate(groq, {
        messages: [{ role: 'system', content: buildIntentSystem(today, ctxStr, langRule) }, ...conv],
        response_format: { type: 'json_object' },
        max_tokens: 300,
        temperature: 0.1,
      });
      parsed = JSON.parse(intentResp.choices[0].message.content || '{}');
    } catch {
      const fallback = lang === 'roman_urdu'
        ? "Mujhe samajh nahi aaya. Kya aap dobara bol sakte hain?"
        : "I'm having trouble understanding. Could you rephrase?";
      return res.json({ success: true, data: { reply: fallback, context } });
    }

    // ── Phase 2: Execute function if intent requires data ──────────────────
    const VALID_CALLS = ['search_doctors','get_available_slots','book_appointment','get_my_appointments'];
    if (parsed.call && VALID_CALLS.includes(parsed.call)) {
      const toolName = parsed.call;
      const toolArgs = cleanArgs(parsed.args || {});

      let toolResult;
      try { toolResult = await execTool(toolName, toolArgs, userId); }
      catch (e) { toolResult = { error: e.message }; }

      // Persist context so next turn has doctor_id / clinic_id
      const newCtx = { ...context };
      if (toolName === 'search_doctors' && toolResult.found && toolResult.doctors?.length) {
        const d = toolResult.doctors[0];
        newCtx.doctor_id   = d.doctor_id;
        newCtx.doctor_name = d.name;
        newCtx.clinics     = d.clinics;
        if (d.clinics?.length === 1) {
          newCtx.clinic_id   = d.clinics[0].id;
          newCtx.clinic_city = d.clinics[0].city;
        }
      }
      if (toolName === 'get_available_slots' && toolResult.available) {
        newCtx.slots      = toolResult.slots?.slice(0, 10);
        newCtx.slots_date = toolResult.date;
      }
      if (toolName === 'book_appointment' && toolResult.success) {
        delete newCtx.doctor_id; delete newCtx.clinic_id;
        delete newCtx.slots; delete newCtx.slots_date;
      }

      // ── Phase 3: Generate spoken reply from tool result ──────────────────
      const toolMsg = `Function ${toolName} result: ${JSON.stringify(toolResult)}`;
      let reply = '';
      try {
        const replyResp = await groqCreate(groq, {
          messages: [
            { role: 'system', content: buildReplySystem(langRule) },
            ...conv,
            { role: 'assistant', content: toolMsg },
          ],
          max_tokens: 250,
          temperature: 0.4,
        });
        reply = replyResp.choices[0]?.message?.content || 'Done.';
      } catch {
        reply = toolResult.error ? 'Something went wrong. Please try again.' : 'Done!';
      }

      return res.json({ success: true, data: { reply, context: newCtx } });
    }

    // ── Direct reply (no function call needed) ─────────────────────────────
    // If the model gave a reply in the intent phase, use it.
    // Otherwise generate one with the full reply system.
    let reply = parsed.reply;
    if (!reply) {
      try {
        const directResp = await groqCreate(groq, {
          messages: [
            { role: 'system', content: buildReplySystem(langRule) },
            ...conv,
          ],
          max_tokens: 200,
          temperature: 0.4,
        });
        reply = directResp.choices[0]?.message?.content;
      } catch { /* fall through */ }
    }
    reply = reply || (lang === 'roman_urdu' ? "Mujhe samajh nahi aaya. Dobara poochein." : "Sorry, I didn't understand. Please try again.");
    return res.json({ success: true, data: { reply, context } });

  } catch (err) {
    if (err.status === 429) return res.status(503).json({ success: false, message: 'AI service is busy. Please try again in a moment.' });
    next(err);
  }
};

// ─── Transcribe audio → text (Groq Whisper) ───────────────────────────────────
const transcribeAudio = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Audio file required.' });
    if (!process.env.GROQ_API_KEY) return res.status(503).json({ success: false, message: 'AI service not configured.' });

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const blob = new Blob([req.file.buffer], { type: req.file.mimetype || 'audio/webm' });
    const file = new File([blob], `audio.${req.file.mimetype?.split('/')[1] || 'webm'}`, {
      type: req.file.mimetype || 'audio/webm',
    });

    const result = await groq.audio.transcriptions.create({
      file,
      model: 'whisper-large-v3-turbo',
      response_format: 'verbose_json',
      prompt: 'Doctor Hub Pakistan. Patient asking about: doctor, appointment, booking, clinic, cardiologist, schedule, fee. Common phrases: doctor dhundna, appointment book karna, mera appointment, payment upload karna.',
    });

    const transcript = result.text?.trim();
    if (!transcript) return res.json({ success: true, data: { transcript: '' } });
    return res.json({ success: true, data: { transcript, detected_language: result.language } });
  } catch (err) {
    if (err.status === 429) return res.status(503).json({ success: false, message: 'AI service is busy. Please try again.' });
    next(err);
  }
};

module.exports = { voiceMessage, transcribeAudio };
