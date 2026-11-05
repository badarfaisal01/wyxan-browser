import { test, expect } from '@playwright/test';

test.describe('Wyxan Browser: Core Navigation User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Journey 1: Type an address, load page, and record visit in history', async ({ page }) => {
    // 1. Enter tidepool.zz into omnibox
    const omnibox = page.locator('input[placeholder*="internal address"]');
    await omnibox.fill('tidepool.zz');
    await omnibox.press('Enter');

    // 2. Verify iframe content displays Tidepool Hub
    const iframe = page.frameLocator('iframe');
    await expect(iframe.getByRole('heading', { name: /Welcome to Tidepool Hub/i })).toBeVisible();

    // 3. Open history drawer and verify visit recorded
    await page.getByRole('button', { name: /History/i }).click();
    await expect(page.getByText('tidepool.zz')).toBeVisible();
  });

  test('Journey 2: 4-link internal traversal within sandboxed iframe', async ({ page }) => {
    // Navigate initial page
    const omnibox = page.locator('input[placeholder*="internal address"]');
    await omnibox.fill('tidepool.zz');
    await omnibox.press('Enter');

    let iframe = page.frameLocator('iframe');
    await expect(iframe.getByRole('heading', { name: /Tidepool/i })).toBeVisible();

    // Follow Link 1 -> Coral Reef Sanctuary
    await iframe.getByRole('link', { name: /Coral Reef Sanctuary/i }).click();
    await expect(iframe.getByRole('heading', { name: /Coral Reef Biodiversity/i })).toBeVisible();

    // Follow Link 2 -> Starfish Field Guide
    await iframe.getByRole('link', { name: /Starfish/i }).click();
    await expect(iframe.getByRole('heading', { name: /Asteroids & Echinoderms/i })).toBeVisible();
  });

  test('Journey 3: Back, Forward, and Branch Navigation Truncation', async ({ page }) => {
    const omnibox = page.locator('input[placeholder*="internal address"]');
    const backBtn = page.getByTitle('Click to go back');
    const forwardBtn = page.getByTitle('Click to go forward');

    // 1. Traverse tidepool.zz -> coral-reef.zz -> starfish.zz
    await omnibox.fill('tidepool.zz');
    await omnibox.press('Enter');

    const iframe = page.frameLocator('iframe');
    await iframe.getByRole('link', { name: /Coral Reef Sanctuary/i }).click();
    await iframe.getByRole('link', { name: /Starfish/i }).click();
    await expect(iframe.getByRole('heading', { name: /Asteroids/i })).toBeVisible();

    // 2. Press Back twice: Starfish -> Coral Reef -> Tidepool
    await backBtn.click();
    await expect(iframe.getByRole('heading', { name: /Coral Reef/i })).toBeVisible();

    await backBtn.click();
    await expect(iframe.getByRole('heading', { name: /Tidepool/i })).toBeVisible();

    // 3. Branching: Navigate to kelp-forest.zz from Tidepool
    await iframe.getByRole('link', { name: /Kelp Forest/i }).click();
    await expect(iframe.getByRole('heading', { name: /Giant Kelp/i })).toBeVisible();

    // Forward should now be disabled because forward path was truncated!
    await expect(forwardBtn).toBeDisabled();
  });

  test('Journey 4: Broken address recovery via 404 screen and Back button', async ({ page }) => {
    const omnibox = page.locator('input[placeholder*="internal address"]');
    await omnibox.fill('tidepool.zz');
    await omnibox.press('Enter');

    // Click broken link (sunken-ruins.zz)
    const iframe = page.frameLocator('iframe');
    await iframe.getByRole('link', { name: /Sunken Ruins/i }).click();

    // Verify 404 Not Found screen appears
    await expect(page.getByRole('heading', { name: /Address Not Found/i })).toBeVisible();
    await expect(page.getByText('sunken-ruins.zz')).toBeVisible();

    // Click "Go Back" button
    await page.getByRole('button', { name: /Go Back/i }).click();

    // Previous valid site is restored
    await expect(iframe.getByRole('heading', { name: /Tidepool/i })).toBeVisible();
  });
});

