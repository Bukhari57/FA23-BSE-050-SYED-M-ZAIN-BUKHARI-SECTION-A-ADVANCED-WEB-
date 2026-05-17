const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
}

async function findUserByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, password, role')
    .eq('email', email)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  const user = data || null;
  if (user && !user.role) user.role = 'user';
  return user;
}

async function createUser(name, email, passwordHash, role = 'user') {
  const insert = { name, email, password: passwordHash };
  if (role) insert.role = role;

  const { data, error } = await supabase.from('users').insert([insert]).select('id').maybeSingle();
  if (error) throw error;
  return data;
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
