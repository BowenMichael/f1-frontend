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

    // Switch to 2D Track Replay Tab to capture replay smoothing and car positions
    const replayTab = await page.getByRole('tab', { name: /2D Track Replay/i });
    if (await replayTab.isVisible()) {
      await replayTab.click();
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: path.join(screenshotDir, 'replay-tab.png'),
        fullPage: true,
      });

      // Click play to demonstrate track replay movement in video
      const playBtn = page.getByRole('button', { name: 'Play', exact: true });
      if (await playBtn.isVisible()) {
        await playBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({
          path: path.join(screenshotDir, 'replay-playing.png'),
          fullPage: true,
        });
      }
    }
  });
});
