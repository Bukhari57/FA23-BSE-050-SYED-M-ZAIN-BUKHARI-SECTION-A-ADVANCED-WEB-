import { resolveApiBaseUrl } from '../app/core/config/runtime-config';

export const environment = {
  production: false,
  apiBaseUrl: resolveApiBaseUrl(),
  appName: 'Committee Manager Plus',
  supabaseUrl: 'https://wtmdxcpnjuapwmtjuezb.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0bWR4Y3BuanVhcHdtdGp1ZXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1OTg4MjEsImV4cCI6MjA5NDE3NDgyMX0.ao0VUIk-BkBmgCBMpK9GGhY4COZvc8FrUFjKishAFiA',
  supabaseProfileBucket: 'member-profiles',
};
