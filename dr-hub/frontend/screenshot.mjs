import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 800 });

// 1. Login page
await page.goto('http://localhost:5173/login');
await page.waitForLoadState('networkidle');
await page.screenshot({ path: '/tmp/ss_login.png' });

// 2. Log in as patient
await page.fill('input[type="email"]', 'patient@doctorhub.com');
await page.fill('input[type="password"]', 'patient123');
await page.click('button[type="submit"]');
await page.waitForURL('**/patient/dashboard', { timeout: 5000 });
await page.screenshot({ path: '/tmp/ss_patient_dashboard.png' });

// 3. Doctor search
await page.goto('http://localhost:5173/patient/doctors');
await page.waitForLoadState('networkidle');
await page.screenshot({ path: '/tmp/ss_doctor_search.png' });

// 4. Log out, log in as admin
await page.evaluate(() => { localStorage.clear(); });
await page.goto('http://localhost:5173/login');
await page.fill('input[type="email"]', 'admin@doctorhub.com');
await page.fill('input[type="password"]', 'admin123');
await page.click('button[type="submit"]');
await page.waitForURL('**/admin/dashboard', { timeout: 5000 });
await page.screenshot({ path: '/tmp/ss_admin_dashboard.png' });

// 5. Admin users page
await page.goto('http://localhost:5173/admin/users');
await page.waitForLoadState('networkidle');
await page.screenshot({ path: '/tmp/ss_admin_users.png' });

await browser.close();
console.log('Screenshots done');
