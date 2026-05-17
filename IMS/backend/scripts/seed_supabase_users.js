require('dotenv').config();
const bcrypt = require('bcrypt');
const supabase = require('../config/supabase');

async function seed() {
  const users = [
    { name: 'Admin demo', email: 'admin@example.com', password: 'Admin@123', role: 'admin' },
    { name: 'User demo', email: 'tester@example.com', password: 'password123', role: 'user' },
  ];

  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 10);
    const payload = { name: u.name, email: u.email, password: hashed, role: u.role };
    const { data, error } = await supabase
      .from('users')
      .upsert([payload], { onConflict: 'email' })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Failed to seed', u.email, error.message || error);
    } else {
      console.log('Seeded', u.email, 'id=', data && data.id);
    }
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
