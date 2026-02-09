const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function runTest() {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: 'C:\\Users\\h\\AppData\\Local\\ms-playwright\\chromium-1208\\chrome-win64\\chrome.exe'
    });
    const page = await browser.newPage();

    // Set viewport to a reasonable size
    await page.setViewport({ width: 1280, height: 800 });

    const baseUrl = 'http://localhost:3001';
    const screenshotsDir = 'test-screenshots';

    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir);
    }

    console.log('Starting visual test...');

    try {
        // 1. Visit Role Selection Page
        console.log('Navigating to login selection page...');
        await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle0' });

        // 2. Click Admin Login
        console.log('Clicking Admin Login option...');
        try {
            await page.waitForSelector('a[href="/login/admin"]', { timeout: 5000 });
            await Promise.all([
                page.click('a[href="/login/admin"]'),
                page.waitForNavigation({ waitUntil: 'networkidle0' }),
            ]);
        } catch (e) {
            console.error('Admin login link not found or clickable, navigating directly...');
            await page.goto(`${baseUrl}/login/admin`, { waitUntil: 'networkidle0' });
        }

        await page.screenshot({ path: `${screenshotsDir}/admin-login-form.png` });

        // 3. Fill Admin Credentials
        console.log('Attempting Admin Login...');
        await page.waitForSelector('input#email', { timeout: 5000 });
        await page.type('input#email', 'admin@harmoni.com');
        await page.type('input#password', 'harmoni123');

        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
        ]);

        await page.screenshot({ path: `${screenshotsDir}/admin-dashboard.png` });
        console.log('Captured admin-dashboard.png');

        // Verify Admin Dashboard Elements
        const dashboardTitle = await page.$eval('h1', el => el.innerText).catch(() => 'Title not found');
        console.log(`Admin Dashboard Title: ${dashboardTitle}`);

        // --- ADMIN PAGES WALKTHROUGH ---
        console.log('\n--- Starting Admin Walkthrough ---');

        const adminRoutes = [
            { path: '/admin/users', name: 'Users' },
            { path: '/admin/students', name: 'Students' },
            { path: '/admin/classes', name: 'Classes' },
            { path: '/admin/activities', name: 'Activities' },
            { path: '/admin/assessments', name: 'Assessments' },
            { path: '/admin/audit', name: 'Audit' },
            { path: '/admin/notifications/send', name: 'Notifications' },
            { path: '/admin/cron', name: 'Cron' },
            { path: '/admin/settings', name: 'Settings' }
        ];

        for (const route of adminRoutes) {
            console.log(`\nTesting ${route.name} (${route.path})...`);
            try {
                await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle0' });
                await page.screenshot({ path: `${screenshotsDir}/admin-${route.name.toLowerCase()}.png` });

                // Basic validation
                const title = await page.$eval('h1, h2, h3', el => el.innerText).catch(() => 'No Heading Found');
                console.log(`  - Page Loaded. Heading: "${title}"`);
                console.log(`  - Captured admin-${route.name.toLowerCase()}.png`);
            } catch (err) {
                console.error(`  - FAILED to load ${route.name}:`, err.message);
                await page.screenshot({ path: `${screenshotsDir}/admin-${route.name.toLowerCase()}-error.png` });
            }
        }

        console.log('\n--- Admin Walkthrough Complete ---');

        // Logout
        await page.goto(`${baseUrl}/api/auth/signout`, { waitUntil: 'networkidle0' });

    } catch (error) {
        console.error('Test failed:', error);
        await page.screenshot({ path: `${screenshotsDir}/error-state.png` });
    } finally {
        await browser.close();
        console.log('Test complete. Check test-screenshots directory.');
    }
}

runTest();
