require('dotenv').config();
const app = require('./app');
const pool = require('./config/db');

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required to sign authentication tokens.');
}

const PORT = process.env.PORT || 4000;

async function start() {
  await pool.schemaReady;
  app.listen(PORT, () => {
    console.log(`IMS backend running on http://localhost:${PORT}`);
  });
}

start().catch(error => {
  console.error('Failed to start backend:', error.message);
  process.exit(1);
});
