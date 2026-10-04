import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('PR Visual Capture', () => {
  test('capture index page and interactive elements', async ({ page }) => {
    // Navigate to the base URL
    await page.goto('/');

    // Wait for the main page elements to load
    // Assuming Mantine or Next.js layout, we just wait for network idle to ensure everything is rendered
    await page.waitForLoadState('networkidle');

    // Take a full-page screenshot of the home page
    const screenshotDir = path.join(process.cwd(), '.pr-visuals');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    await page.screenshot({ path: path.join(screenshotDir, 'home-page.png'), fullPage: true });

    // Perform a basic interaction to demonstrate behavior in the video (e.g. clicking a link or button if available)
    // Here we'll scroll down to show the layout in the video
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });

    // Wait briefly to capture the scrolled state in the video
    await page.waitForTimeout(1000);

    // Return to top
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });

    await page.waitForTimeout(1000);

    // If there's a theme toggle (common in Mantine templates), we can toggle it and capture
    const colorSchemeToggle = await page.$(
      'button[title="Toggle color scheme"], button[aria-label="Toggle color scheme"], button:has(svg)'
    );
    if (colorSchemeToggle) {
      await colorSchemeToggle.click();
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(screenshotDir, 'home-page-dark-mode.png'),
        fullPage: true,
      });
    }
  });
});
