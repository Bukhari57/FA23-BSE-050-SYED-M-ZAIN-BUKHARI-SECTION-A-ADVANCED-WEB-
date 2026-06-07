import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 800 });

// Login as patient
await page.goto('http://localhost:5173/login');
await page.fill('input[type="email"]', 'patient@doctorhub.com');
await page.fill('input[type="password"]', 'patient123');
await page.click('button[type="submit"]');
await page.waitForURL('**/patient/dashboard');

// Navigate to doctor search and click Book Appointment
await page.goto('http://localhost:5173/patient/doctors');
await page.waitForSelector('text=Book Appointment', { timeout: 8000 });
await page.click('text=Book Appointment');

// Wait for BookAppointment page to load (doctor profile loads async)
await page.waitForSelector('text=Select Clinic', { timeout: 8000 });
await page.screenshot({ path: '/tmp/ss_book1_loaded.png' });

// Select clinic — get first non-empty value and select it
await page.waitForTimeout(1000);
await page.screenshot({ path: '/tmp/ss_book2_clinic.png' });
// Pick "City Heart Clinic" — has schedules
const clinicValue = await page.$eval(
  'select option[value]:not([value=""])',
  (el, selector) => {
    const all = document.querySelectorAll(selector);
    for (const opt of all) {
      if (opt.textContent.includes('City Heart')) return opt.value;
    }
    return all[0]?.value;
  },
  'select option[value]:not([value=""])'
);
console.log('Selecting clinic value:', clinicValue);
await page.selectOption('select', clinicValue);

// Pick Friday 2026-06-12 — use evaluate to trigger React onChange
await page.evaluate(() => {
  const input = document.querySelector('input[type="date"]');
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  nativeInputValueSetter.call(input, '2026-06-12');
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
});
await page.waitForTimeout(2000);
await page.screenshot({ path: '/tmp/ss_book3_afterdate.png' });

// Wait for slots to appear
await page.waitForSelector('text=Available Slots', { timeout: 8000 });
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/ss_book3_slots.png' });

// Click first enabled slot button (time format HH:MM)
const allBtns = await page.locator('button[type="button"]:not([disabled])').all();
console.log(`Found ${allBtns.length} enabled buttons`);
if (allBtns.length > 0) {
  await allBtns[0].click();
  console.log('Clicked slot');
}
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/ss_book4_slot_selected.png' });

// Click Confirm Booking
await page.waitForSelector('button[type="submit"]:not([disabled])', { timeout: 3000 });
await page.click('button[type="submit"]');
await page.waitForTimeout(2500);
await page.screenshot({ path: '/tmp/ss_book5_result.png' });
console.log('Final URL:', page.url());

await browser.close();
console.log('done');
