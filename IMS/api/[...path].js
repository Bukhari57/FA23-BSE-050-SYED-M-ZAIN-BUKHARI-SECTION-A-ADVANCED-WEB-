require('dotenv').config();
const app = require('../backend/app');
const pool = require('../backend/config/db');

module.exports = async (req, res) => {
  try {
    await pool.schemaReady;
    // Ensure Express sees the original `/api` prefixed path when mounted
    // under Vercel's `api/` routing (Vercel may strip the `/api` segment).
    if (!req.url.startsWith('/api')) {
      req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
    }

    // Express apps are callable as functions (req, res)
    return app(req, res);
  } catch (err) {
    console.error('API function error:', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
};
