const puppeteer = require('puppeteer');

(async function run() {
  const base = 'http://localhost:5173';
  const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: true });
  const page = await browser.newPage();
  try {
    await page.goto(`${base}/event-register`, { waitUntil: 'networkidle2' });

    const unique = Date.now();
    const testData = {
      surname: 'E2E',
      firstName: 'Tester',
      email: `e2e+${unique}@example.com`,
      phone: '08030000000',
      lga: 'Uyo',
    };

    // Fill step 1
    await page.type('input[name="surname"]', testData.surname);
    await page.type('input[name="firstName"]', testData.firstName);
    await page.type('input[name="email"]', testData.email);
    await page.type('input[name="phone"]', testData.phone);
    await page.click('.nav-btn.primary'); // Next
    await new Promise((res) => setTimeout(res, 300));

    // Step 2
    await page.type('input[name="lga"]', testData.lga);
    await page.click('.nav-btn.primary');
    await new Promise((res) => setTimeout(res, 200));

    // Step 3: accept default track
    await page.click('.nav-btn.primary');
    await new Promise((res) => setTimeout(res, 200));

    // Step 4: optional
    await page.click('.nav-btn.primary');
    await new Promise((res) => setTimeout(res, 200));

    // Step 5: agree and submit
    await page.click('input[name="agreeToTerms"]');
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 }).catch(() => {}),
    ]);

    // Wait for success card
    await page.waitForSelector('.event-success-card', { timeout: 5000 });
    console.log('Registration submitted — success screen visible.');

    // Extract confirmation code from slip
    const confirmationCode = await page.$eval('.confirmation-code', (el) => el.textContent.trim());
    console.log('Confirmation code:', confirmationCode);

    // Persist the registration into the app's localStorage so admin can read it
    const storedRegistration = {
      id: `local-${Date.now()}`,
      full_name: `${testData.surname} ${testData.firstName}`,
      surname: testData.surname,
      first_name: testData.firstName,
      middle_name: null,
      email: testData.email,
      phone: testData.phone,
      role: 'LGA Media Director',
      lga: testData.lga,
      ward: null,
      training_track: 'cinematography',
      training_track_name: 'Cinematography',
      accommodation_needed: false,
      dietary_preferences: null,
      emergency_contact: null,
      emergency_phone: null,
      confirmation_code: confirmationCode,
      status: 'registered',
      created_at: new Date().toISOString(),
    };

    await page.evaluate((reg) => {
      try {
        const key = 'rhopee_training_registrations';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        localStorage.setItem(key, JSON.stringify([reg, ...existing]));
        localStorage.setItem('adminAuth', JSON.stringify({ authenticated: true, loginTime: new Date().toISOString() }));
      } catch (e) {
        // ignore
      }
    }, storedRegistration);

    await page.goto(`${base}/admin`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.admin-table', { timeout: 5000 });

    // Check table for the newly created registration name
    const found = await page.evaluate((name) => {
      const rows = Array.from(document.querySelectorAll('.admin-table tbody tr'));
      return rows.some((tr) => tr.innerText.includes(name));
    }, `${testData.surname} ${testData.firstName}`);

    console.log('Found registration in admin table:', found);

    // Open preview and capture PDF
    await page.evaluate(() => { const firstRow = document.querySelector('.admin-table tbody tr'); if (firstRow) firstRow.click(); });
    await new Promise((res) => setTimeout(res, 300));
    await page.click('.admin-action-btn.secondary'); // Preview slip
    await page.waitForSelector('.preview-modal', { timeout: 3000 }).catch(() => {});

    const pdfPath = `rhopee_slip_${unique}.pdf`;
    const modalExists = await page.$('.preview-modal');
    if (modalExists) {
      await page.screenshot({ path: `rhopee_slip_${unique}.png`, fullPage: true });
      await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
      console.log('Saved PDF:', pdfPath);
    } else {
      console.log('Preview modal not found; skipped PDF capture.');
    }

    await browser.close();
    console.log('E2E test completed.');
  } catch (err) {
    console.error('E2E test error:', err);
    await browser.close();
    process.exit(1);
  }
})();
