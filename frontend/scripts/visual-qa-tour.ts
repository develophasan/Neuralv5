
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

const SCREENSHOT_DIR = path.join(process.cwd(), 'qa-screenshots')
if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR)
}

async function runVisualQA() {
    console.log('🚀 Starting Comprehensive Visual QA Tour...')

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-features=IsolateOrigins,site-per-process']
    })
    const page = await browser.newPage()

    // Set larger viewport for desktop tests
    await page.setViewport({ width: 1280, height: 800 })

    try {
        // 1. Login
        console.log('🔑 Logging in...')
        await page.goto('http://localhost:3000/login/teacher', { waitUntil: 'networkidle0' })
        await page.type('input[type="email"]', 'ogretmen1@harmoni.com')
        await page.type('input[type="password"]', 'harmoni123')

        // Click login button (assuming it's the button in the form)
        console.log('Clicking login button...')
        await page.click('button')

        await page.waitForNavigation({ waitUntil: 'networkidle0' })
        console.log('✅ Logged in.')

        // 2. Dashboard
        console.log('📊 Checking Dashboard...')
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_dashboard.png') })

        // 3. Student List
        console.log('🎓 Checking Student List...')
        await page.goto('http://localhost:3000/teacher/students', { waitUntil: 'networkidle0' })
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_student_list.png') })

        // 4. Student Detail (Access via first student card)
        console.log('👤 Checking Student Detail...')
        try {
            await page.waitForSelector('.grid a', { timeout: 5000 })
            const studentLinks = await page.$$('.grid a')
            if (studentLinks.length > 0) {
                await studentLinks[0].click()
                await page.waitForNavigation({ waitUntil: 'networkidle0' })
                await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_student_profile.png') })
            } else {
                console.warn('⚠️ No student links found.')
            }
        } catch (e) {
            console.warn('⚠️ Failed to click student link', e)
        }

        // 5. Daily Logs
        console.log('📅 Checking Daily Logs...')
        await page.goto('http://localhost:3000/teacher/daily-logs', { waitUntil: 'networkidle0' })

        // Select a class first
        try {
            await page.waitForSelector('select', { timeout: 5000 })
            await page.select('select', await page.$eval('select option:nth-child(2)', (el: any) => el.value))
            // Wait for network requests to finish (fetching students)
            await new Promise(r => setTimeout(r, 2000));
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_daily_logs.png') })
        } catch (e) {
            console.warn('Daily logs select failed', e)
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_daily_logs_error.png') })
        }

        // Check Bulk Log Tab (Click button with text "Toplu Log")
        try {
            const buttons = await page.$$('button')
            for (const btn of buttons) {
                const text = await page.evaluate(el => el.textContent, btn)
                if (text?.includes('Toplu Log')) {
                    await btn.click()
                    break
                }
            }
            await new Promise(r => setTimeout(r, 1000)); // Animation wait
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_daily_logs_bulk.png') })
        } catch (e) {
            console.warn('Failed to switch to bulk log', e)
        }

        // 6. Assessments
        console.log('📝 Checking Assessments...')
        await page.goto('http://localhost:3000/teacher/assessments', { waitUntil: 'networkidle0' })
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_assessments.png') })

        // 7. Mobile Responsiveness
        console.log('📱 Checking Mobile View...')
        await page.setViewport({ width: 375, height: 667, isMobile: true })
        await page.goto('http://localhost:3000/teacher/dashboard', { waitUntil: 'networkidle0' })
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_mobile_dashboard.png') })

        // Open Mobile Menu (Click button inside the mobile header)
        try {
            // The menu button is usually the only icon button in the header if others are hidden or it's the specific menu icon
            // We can search for the SVG with class 'lucide-menu' parent button
            await page.evaluate(() => {
                const menuIcon = document.querySelector('.lucide-menu');
                if (menuIcon && menuIcon.closest('button')) {
                    (menuIcon.closest('button') as HTMLElement).click();
                }
            });
            await new Promise(r => setTimeout(r, 1000)); // Wait for sheet animation
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_mobile_menu.png') })
        } catch (e) {
            console.warn('Failed to open mobile menu', e)
        }

        console.log('✅ QA Tour Completed Successfully!')
        console.log(`📸 Screenshots saved to: ${SCREENSHOT_DIR}`)

    } catch (error) {
        console.error('❌ QA Failed:', error)
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'error_state.png') })
    } finally {
        await browser.close()
    }
}

runVisualQA()
