import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

if (existsSync('.env.local')) {
  const lines = readFileSync('.env.local', 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      continue;
    }
    const [key, ...valueParts] = trimmed.split('=');
    process.env[key.trim()] ||= valueParts.join('=').trim().replace(/^["']|["']$/g, '');
  }
}

const supabaseUrl =
  process.env.NG_APP_SUPABASE_URL || process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey =
  process.env.NG_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'your-anon-key';

mkdirSync('src/environments', { recursive: true });
writeFileSync(
  'src/environments/environment.ts',
  `export const environment = {
  production: true,
  supabaseUrl: '${supabaseUrl}',
  supabaseAnonKey: '${supabaseAnonKey}'
};
`
);
