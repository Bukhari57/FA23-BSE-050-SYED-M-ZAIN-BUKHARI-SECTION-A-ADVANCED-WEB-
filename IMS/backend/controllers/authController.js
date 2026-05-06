const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
}

async function findUserByEmail(email) {
  let rows = [];
  try {
    [rows] = await pool.query('SELECT id, name, email, password, role FROM users WHERE email = ?', [email]);
  } catch (error) {
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      [rows] = await pool.query('SELECT id, name, email, password FROM users WHERE email = ?', [email]);
    } else {
      throw error;
    }
  }

  const user = rows[0] || null;
  if (user && !user.role) {
    user.role = 'user';
  }
  return user;
}

async function createUser(name, email, passwordHash, role = 'user') {
  try {
    await pool.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, passwordHash, role]);
  } catch (error) {
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, passwordHash]);
    } else {
      throw error;
    }
  }
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role || 'user' }, 
    getJwtSecret(),
    { expiresIn: '8h' }
  );
}

async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await createUser(name, email, hashedPassword);

    res.status(201).json({ success: true, message: 'Account created successfully' });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role || 'user' },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { signup, login };
