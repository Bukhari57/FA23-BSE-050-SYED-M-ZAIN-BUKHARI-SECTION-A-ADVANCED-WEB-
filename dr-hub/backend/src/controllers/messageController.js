const pool = require('../config/db');
const { success, error } = require('../utils/response');

// ─── POST /api/messages ────────────────────────────────────────────────────────
// Send a message; both patient→doctor and doctor→patient are allowed
const sendMessage = async (req, res, next) => {
  const { recipient_id, appointment_id, content } = req.body;
  if (!content?.trim()) return error(res, 'Message content is required.', 400);

  try {
    // Verify recipient exists
    const { rows: [recipient] } = await pool.query(
      'SELECT id, name FROM users WHERE id=$1 AND is_active=true', [recipient_id]
    );
    if (!recipient) return error(res, 'Recipient not found.', 404);

    // If appointment_id given, verify the sender is involved
    if (appointment_id) {
      const { rows: [appt] } = await pool.query(
        `SELECT a.id FROM appointments a
         JOIN patients pt ON pt.id = a.patient_id
         JOIN doctors  d  ON d.id  = a.doctor_id
         WHERE a.id=$1 AND (pt.user_id=$2 OR d.user_id=$2)`,
        [appointment_id, req.user.id]
      );
      if (!appt) return error(res, 'Appointment not found or access denied.', 403);
    }

    const { rows: [msg] } = await pool.query(
      `INSERT INTO messages (sender_id, recipient_id, appointment_id, content)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.user.id, recipient_id, appointment_id || null, content.trim()]
    );

    // Notify recipient
    const { rows: [sender] } = await pool.query('SELECT name FROM users WHERE id=$1', [req.user.id]);
    await pool.query(
      `INSERT INTO notifications (user_id, title, message)
       VALUES ($1,$2,$3)`,
      [recipient_id, `New message from ${sender.name}`, content.trim().slice(0, 100)]
    ).catch(() => {});

    return success(res, msg, 'Message sent.', 201);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/messages ─────────────────────────────────────────────────────────
// List conversations: returns a unique list of people you've messaged/received from
const getConversations = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT ON (other_user_id)
         other_user_id,
         other_name,
         other_role,
         last_message,
         last_message_at,
         unread_count
       FROM (
         SELECT
           CASE WHEN m.sender_id=$1 THEN m.recipient_id ELSE m.sender_id END AS other_user_id,
           CASE WHEN m.sender_id=$1 THEN ru.name        ELSE su.name        END AS other_name,
           CASE WHEN m.sender_id=$1 THEN ru.role        ELSE su.role        END AS other_role,
           m.content AS last_message,
           m.created_at AS last_message_at,
           (SELECT COUNT(*) FROM messages m2
            WHERE m2.sender_id != $1 AND m2.recipient_id=$1
            AND m2.sender_id = CASE WHEN m.sender_id=$1 THEN m.recipient_id ELSE m.sender_id END
            AND m2.is_read=false) AS unread_count
         FROM messages m
         JOIN users su ON su.id = m.sender_id
         JOIN users ru ON ru.id = m.recipient_id
         WHERE m.sender_id=$1 OR m.recipient_id=$1
         ORDER BY m.created_at DESC
       ) sub
       ORDER BY other_user_id, last_message_at DESC`,
      [req.user.id]
    );

    return success(res, rows);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/messages/:userId ─────────────────────────────────────────────────
// Get message thread between current user and another user
const getThread = async (req, res, next) => {
  const { userId } = req.params;
  try {
    // Mark messages from this user as read
    await pool.query(
      `UPDATE messages SET is_read=true
       WHERE sender_id=$1 AND recipient_id=$2 AND is_read=false`,
      [userId, req.user.id]
    );

    const { rows } = await pool.query(
      `SELECT m.*, su.name AS sender_name, su.role AS sender_role
       FROM messages m
       JOIN users su ON su.id = m.sender_id
       WHERE (m.sender_id=$1 AND m.recipient_id=$2)
          OR (m.sender_id=$2 AND m.recipient_id=$1)
       ORDER BY m.created_at ASC`,
      [req.user.id, userId]
    );

    return success(res, rows);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/messages/contacts ───────────────────────────────────────────────
// Get list of people the current user can message (their appointment counterparts)
const getContacts = async (req, res, next) => {
  try {
    let contacts = [];

    if (req.user.role === 'patient') {
      const { rows: [patient] } = await pool.query(
        'SELECT id FROM patients WHERE user_id=$1', [req.user.id]
      );
      if (patient) {
        const { rows } = await pool.query(
          `SELECT DISTINCT d.user_id AS id, u.name, u.role
           FROM appointments a
           JOIN doctors d ON d.id = a.doctor_id
           JOIN users   u ON u.id = d.user_id
           WHERE a.patient_id=$1 AND a.status NOT IN ('cancelled')`,
          [patient.id]
        );
        contacts = rows;
      }
    } else if (req.user.role === 'doctor') {
      const { rows: [doc] } = await pool.query(
        'SELECT id FROM doctors WHERE user_id=$1', [req.user.id]
      );
      if (doc) {
        const { rows: patients } = await pool.query(
          `SELECT DISTINCT pt.user_id AS id, u.name, u.role
           FROM appointments a
           JOIN patients pt ON pt.id = a.patient_id
           JOIN users    u  ON u.id  = pt.user_id
           WHERE a.doctor_id=$1 AND a.status NOT IN ('cancelled')`,
          [doc.id]
        );
        const { rows: assistants } = await pool.query(
          `SELECT DISTINCT a.user_id AS id, u.name, u.role
           FROM assistants a
           JOIN users u ON u.id = a.user_id
           WHERE a.doctor_id=$1`,
          [doc.id]
        );
        contacts = [...patients, ...assistants];
      }
    } else if (req.user.role === 'assistant') {
      const { rows: [asst] } = await pool.query(
        'SELECT doctor_id FROM assistants WHERE user_id=$1', [req.user.id]
      );
      if (asst) {
        const { rows } = await pool.query(
          `SELECT d.user_id AS id, u.name, u.role
           FROM doctors d
           JOIN users u ON u.id = d.user_id
           WHERE d.id=$1`,
          [asst.doctor_id]
        );
        contacts = rows;
      }
    }

    return success(res, contacts);
  } catch (err) {
    next(err);
  }
};

module.exports = { sendMessage, getConversations, getThread, getContacts };
