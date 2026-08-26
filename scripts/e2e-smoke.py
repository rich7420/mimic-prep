import asyncio
import os
import re
from pathlib import Path
from playwright.async_api import async_playwright

BASE_URL = os.environ.get('TOEFL_E2E_URL', '').strip()
ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'standalone.html').read_text()
OUT = ROOT / 'qa'
OUT.mkdir(exist_ok=True)

async def new_page(browser, width=1440, height=1000):
    context = await browser.new_context(viewport={"width": width, "height": height}, accept_downloads=True)
    page = await context.new_page()
    page.set_default_timeout(12_000)
    errors = []
    page.on('pageerror', lambda exc: errors.append(f'pageerror: {exc}'))
    page.on('console', lambda msg: errors.append(f'console.{msg.type}: {msg.text}') if msg.type == 'error' else None)
    if BASE_URL:
        await page.goto(BASE_URL, wait_until='networkidle')
    else:
        await page.set_content(HTML, wait_until='load')
    return context, page, errors

async def assert_no_horizontal_overflow(page):
    widths = await page.evaluate('({sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth})')
    assert widths['sw'] <= widths['cw'] + 1, widths

async def click_next_reading(page, times):
    for _ in range(times):
        await page.locator('[data-action="next-reading-page"]').click()

async def main():
    async with async_playwright() as p:
        launch_options = {"headless": True, "args": ['--no-sandbox']}
        chromium_executable = os.environ.get('CHROMIUM_EXECUTABLE', '').strip()
        if chromium_executable:
            launch_options['executable_path'] = chromium_executable
        browser = await p.chromium.launch(**launch_options)

        print('E2E: dashboard and full two-module Reading flow', flush=True)
        context, page, errors = await new_page(browser)
        await page.screenshot(path=str(OUT/'v6-dashboard.png'), full_page=True)
        assert await page.get_by_text('Full Reading Section').count() >= 1
        await page.locator('[data-action="start-reading"]').first.click()
        assert await page.get_by_role('heading', name='Reading Section Directions').is_visible()
        assert await page.locator('#exam-timer').count() == 0
        await page.screenshot(path=str(OUT/'v6-reading-directions.png'), full_page=True)
        await page.locator('[data-action="begin-reading-module"]').click()
        assert await page.locator('[data-ctw-gap]').count() == 10
        timer_text = await page.locator('#exam-timer').inner_text()
        assert re.match(r'20:5\d|21:00', timer_text), timer_text
        assert 'Module 1' in await page.locator('.exam-section').inner_text()
        await page.locator('[data-ctw-gap]').first.fill('x')
        await page.screenshot(path=str(OUT/'v6-reading-module1-ctw.png'), full_page=True)

        # The second CTW page is research, but its status remains hidden during the test.
        await click_next_reading(page, 2)
        assert await page.locator('[data-reading-option]').count() == 4
        assert await page.get_by_text('Read in Daily Life').count() >= 1
        assert await page.get_by_text('Research').count() == 0
        await page.screenshot(path=str(OUT/'v6-reading-daily-life.png'), full_page=True)

        # Router has 17 screens: 2 CTW, 10 Daily Life questions, 5 Academic questions.
        await click_next_reading(page, 10)
        assert await page.get_by_text('Read an Academic Passage').count() >= 1
        await page.screenshot(path=str(OUT/'v6-reading-academic.png'), full_page=True)
        await click_next_reading(page, 4)
        assert await page.locator('[data-action="end-reading-module"]').is_visible()
        await page.locator('[data-action="end-reading-module"]').click()
        assert await page.get_by_role('alertdialog').is_visible()
        await page.get_by_role('button', name='End Module 1').click()
        assert await page.get_by_role('heading', name='Continue to Module 2').is_visible()
        assert await page.locator('#exam-timer').count() == 0
        transition_text = await page.locator('.transition-card').inner_text()
        assert 'Upper' not in transition_text and 'Lower' not in transition_text
        await page.screenshot(path=str(OUT/'v6-reading-transition.png'), full_page=True)

        await page.locator('[data-action="begin-reading-module2"]').click()
        assert await page.locator('[data-ctw-gap]').count() == 10
        timer_text = await page.locator('#exam-timer').inner_text()
        assert re.match(r'8:5\d|9:00', timer_text), timer_text
        assert 'Module 2' in await page.locator('.exam-section').inner_text()
        await click_next_reading(page, 5)
        await page.locator('[data-action="end-reading-module"]').click()
        await page.get_by_role('button', name='Submit Reading').click()
        await page.wait_for_selector('text=READING REVIEW')
        assert await page.get_by_text('Research items disclosed after the test').is_visible()
        assert await page.get_by_text('Lower-difficulty practice route').is_visible()
        await page.screenshot(path=str(OUT/'v6-reading-review.png'), full_page=True)
        assert not errors, errors
        await context.close()

        print('E2E: Content Intelligence registry, coverage matrix, and audit export', flush=True)
        context, page, errors = await new_page(browser)
        await page.locator('.app-nav [data-action="nav"][data-view="content"]').click()
        assert await page.get_by_text('CONTENT INTELLIGENCE').is_visible()
        assert (await page.locator('.content-score-ring strong').inner_text()).strip() == '100'
        assert await page.locator('.source-table tbody tr').count() == 15
        assert await page.get_by_text('14/14').count() >= 1
        assert await page.get_by_text('6/6').count() >= 1
        await page.screenshot(path=str(OUT/'v6-content-intelligence.png'), full_page=True)
        async with page.expect_download() as download_info:
            await page.locator('[data-action="download-content-audit"]').click()
        download = await download_info.value
        audit_path = OUT / 'v6-content-audit-download.json'
        await download.save_as(str(audit_path))
        import json
        audit = json.loads(audit_path.read_text())
        assert audit['releaseGate']['structuralPass'] is True
        assert audit['editorialCoverageScore'] == 100
        assert audit['psychometricCalibration']['status'] == 'not-calibrated'
        assert not errors, errors
        await context.close()

        print('E2E: Focused Daily and Academic guided practice', flush=True)
        context, page, errors = await new_page(browser)
        await page.locator('.app-nav [data-action="nav"][data-view="practice"]').click()
        await page.locator('#focused-daily-select').select_option('focused-daily-music-room-sign')
        await page.locator('[data-action="start-focused"][data-kind="daily"]').click()
        assert await page.get_by_text('GUIDED PRACTICE · NOT A MOCK').is_visible()
        assert await page.locator('.focused-question').count() == 2
        assert await page.locator('.focused-explanation').count() == 0
        await page.locator('input[data-question-id="focused-music-sign-q1"][value="A"]').check()
        await page.locator('input[data-question-id="focused-music-sign-q2"][value="A"]').check()
        await page.locator('[data-action="submit-focused"]').click()
        assert (await page.locator('.focused-actions strong').inner_text()).strip() == '1/2'
        assert await page.locator('.focused-explanation').count() == 2
        await page.screenshot(path=str(OUT/'v6-focused-daily-review.png'), full_page=True)
        await page.locator('[data-action="close-focused"]').click()
        await page.locator('#focused-academic-select').select_option('focused-academic-roadside-inns')
        await page.locator('[data-action="start-focused"][data-kind="academic"]').click()
        assert await page.locator('.focused-question').count() == 5
        for question_id in ['focused-inns-q1','focused-inns-q2','focused-inns-q3','focused-inns-q4','focused-inns-q5']:
            await page.locator(f'input[data-question-id="{question_id}"][value="A"]').check()
        await page.locator('[data-action="submit-focused"]').click()
        assert await page.locator('.focused-explanation').count() == 5
        await page.screenshot(path=str(OUT/'v6-focused-academic-review.png'), full_page=True)
        assert not errors, errors
        await context.close()

        print('E2E: second original Reading form can be selected and started', flush=True)
        context, page, errors = await new_page(browser)
        await page.locator('.app-nav [data-action="nav"][data-view="practice"]').click()
        await page.locator('#reading-form-select').select_option('reading-form-02')
        assert await page.locator('#reading-form-select').input_value() == 'reading-form-02'
        await page.locator('[data-action="start-reading"]').click()
        await page.locator('[data-action="begin-reading-module"]').click()
        assert 'Sleep plays an important role' in await page.locator('.ctw-passage').inner_text()
        assert await page.locator('[data-ctw-gap]').count() == 10
        await page.screenshot(path=str(OUT/'v6-reading-form-02.png'), full_page=True)
        assert not errors, errors
        await context.close()

        print('E2E: Reading autosave, Exit, and Resume within Module 1', flush=True)
        context, page, errors = await new_page(browser)
        await page.locator('[data-action="start-reading"]').first.click()
        await page.locator('[data-action="begin-reading-module"]').click()
        first_gap = page.locator('[data-ctw-gap]').first
        max_length = int(await first_gap.get_attribute('maxlength') or '2')
        draft_value = 'ab'[:max_length]
        await first_gap.fill(draft_value)
        await page.wait_for_timeout(500)
        await page.locator('[data-action="leave-exam"]').click()
        await page.get_by_role('button', name='Save and exit').click()
        assert await page.locator('[data-action="resume-current"]').is_visible()
        await page.locator('[data-action="resume-current"]').click()
        assert await page.locator('[data-ctw-gap]').first.input_value() == draft_value
        assert 'Module 1' in await page.locator('.exam-section').inner_text()
        await page.locator('[data-action="leave-exam"]').click()
        await page.get_by_role('button', name='Save and exit').click()
        await page.locator('[data-action="discard-current"]').click()
        await page.get_by_role('button', name='Discard attempt').click()
        assert not errors, errors
        await context.close()

        print('E2E: targeted CTW incomplete submit and paused confirmation', flush=True)
        context, page, errors = await new_page(browser)
        await page.locator('[data-action="start-ctw"]').first.click()
        gaps = page.locator('[data-ctw-gap]')
        assert await gaps.count() == 10
        for i in range(3):
            await gaps.nth(i).fill('x')
        await page.locator('[data-action="submit-ctw"]').click()
        assert await page.get_by_role('alertdialog').is_visible()
        modal_value = await page.locator('#exam-timer').inner_text()
        await page.wait_for_timeout(1100)
        assert await page.locator('#exam-timer').inner_text() == modal_value
        await page.get_by_role('button', name='Submit anyway').click()
        await page.wait_for_selector('text=READING REVIEW')
        assert not errors, errors
        await context.close()

        print('E2E: formal Writing directions and locked task transitions', flush=True)
        context, page, errors = await new_page(browser)
        await page.locator('[data-action="start-writing"]').first.click()
        assert await page.get_by_role('heading', name='Writing Section Directions').is_visible()
        assert await page.locator('#exam-timer').count() == 0
        await page.screenshot(path=str(OUT/'v6-writing-directions.png'), full_page=True)
        await page.locator('[data-action="begin-writing-section"]').click()

        first_tile = page.locator('[data-action="select-tile"]:not([disabled])').first
        tile_text = (await first_tile.inner_text()).strip()
        await first_tile.focus()
        await page.keyboard.press('Space')
        first_slot = page.locator('[data-action="clear-slot"]').first
        await first_slot.focus()
        await page.keyboard.press('Space')
        assert 'filled' in (await first_slot.get_attribute('class') or '')
        assert tile_text in (await first_slot.inner_text())
        await page.screenshot(path=str(OUT/'v6-writing-build.png'), full_page=True)

        await page.locator('[data-action="go-build-item"][data-index="9"]').click()
        await page.locator('[data-action="advance-email"]').click()
        await page.get_by_role('alertdialog').get_by_role('button', name='Continue').click()
        assert await page.get_by_role('heading', name='Write an Email').is_visible()
        assert await page.locator('textarea[data-writing-field="email"]').count() == 0
        await page.locator('[data-action="begin-writing-task"]').click()
        email = page.locator('textarea[data-writing-field="email"]')
        assert await email.is_visible()
        await page.locator('.exam-tools [data-action="toggle-help"]').click()
        assert await page.locator('.help-modal').evaluate('(el) => document.activeElement === el')
        await page.keyboard.press('Escape')
        email_text = 'Dear Coordinator,\n\nI am writing about the room problem. Could you please confirm the reservation and suggest an alternative room if needed?\n\nBest,\nAlex'
        await email.fill(email_text)
        await page.locator('[data-action="advance-discussion"]').click()
        await page.get_by_role('alertdialog').get_by_role('button', name='Continue').click()
        assert await page.get_by_role('heading', name='Academic Discussion').is_visible()
        assert await page.locator('textarea[data-writing-field="discussion"]').count() == 0
        await page.locator('[data-action="begin-writing-task"]').click()
        discussion = page.locator('textarea[data-writing-field="discussion"]')
        assert await discussion.is_visible()
        await page.locator('[data-action="submit-writing"]').click()
        assert await page.get_by_role('alertdialog').is_visible()
        await page.get_by_role('button', name='Cancel').click()
        discussion_text = ('I believe universities should make the change gradually because students need reliable alternatives. '
                           'For example, the university could improve buses and bicycle storage before reducing parking. '
                           'This approach would lower traffic while still respecting commuters who have work, family, or mobility responsibilities. '
                           'It also gives administrators time to measure whether the new services are sufficient. '
                           'Therefore, a phased policy is more practical than an immediate ban, and it can produce environmental benefits without creating unnecessary hardship.')
        await discussion.fill(discussion_text)
        await page.locator('[data-action="submit-writing"]').click()
        await page.wait_for_selector('text=WRITING REVIEW')
        assert await page.get_by_text('Unscored').count() == 2
        await page.screenshot(path=str(OUT/'v6-writing-review.png'), full_page=True)
        assert not errors, errors
        await context.close()

        print('E2E: mobile Reading and Email layouts avoid horizontal overflow', flush=True)
        context, page, errors = await new_page(browser, 390, 844)
        await page.locator('[data-action="start-reading"]').first.click()
        await page.locator('[data-action="begin-reading-module"]').click()
        await click_next_reading(page, 2)
        await assert_no_horizontal_overflow(page)
        await page.screenshot(path=str(OUT/'v6-reading-mobile.png'), full_page=True)
        assert not errors, errors
        await context.close()

        context, page, errors = await new_page(browser, 390, 844)
        await page.locator('[data-action="start-writing"]').first.click()
        await page.locator('[data-action="begin-writing-section"]').click()
        await page.locator('[data-action="go-build-item"][data-index="9"]').click()
        await page.locator('[data-action="advance-email"]').click()
        await page.get_by_role('alertdialog').get_by_role('button', name='Continue').click()
        await page.locator('[data-action="begin-writing-task"]').click()
        await assert_no_horizontal_overflow(page)
        await page.screenshot(path=str(OUT/'v6-email-mobile.png'), full_page=True)
        assert not errors, errors
        await context.close()

        await browser.close()
        print('E2E_SMOKE_OK')

asyncio.run(main())
