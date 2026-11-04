import { test, expect } from '@playwright/test';

test.describe('Wyxan Browser: Search, Publishing & Persona Journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Journey 5: Search and return with query preservation', async ({ page }) => {
    const omnibox = page.locator('input[placeholder*="internal address"]');
    const backBtn = page.getByTitle('Click to go back');

    // 1. Execute search query for "biodiversity"
    await omnibox.fill('search: biodiversity');
    await omnibox.press('Enter');

    // 2. Verify search results page is rendered
    await expect(page.getByText(/Search Results for “biodiversity”/i)).toBeVisible();
    await expect(page.getByText('coral-reef.zz')).toBeVisible();

    // 3. Click on the search result card
    await page.getByRole('heading', { name: /Coral Reef Biodiversity Reserve/i }).click();

    // 4. Verify site loads
    const iframe = page.frameLocator('iframe');
    await expect(iframe.getByRole('heading', { name: /Coral Reef Biodiversity/i })).toBeVisible();

    // 5. Press Back button: Search destination and query must be preserved!
    await backBtn.click();
    await expect(page.getByText(/Search Results for “biodiversity”/i)).toBeVisible();
    await expect(page.getByText('coral-reef.zz')).toBeVisible();
  });

  test('Journey 6: Publish user HTML and navigate through it', async ({ page }) => {
    // 1. Open publisher modal
    await page.getByRole('button', { name: /Publish/i }).click();
    await expect(page.getByText(/Publish New .zz Web Page/i)).toBeVisible();

    // 2. Fill in form
    const uniqueAddress = `research-station-${Date.now().toString(36)}.zz`;
    await page.locator('input[placeholder*="e.g. marine-biology.zz"]').fill(uniqueAddress);
    await page.locator('input[placeholder*="e.g. Deep Ocean Marine Biology Report"]').fill('Marine Research Station');

    // 3. Submit publication
    await page.getByRole('button', { name: /Publish Page/i }).click();

    // 4. Verify browser navigates to the newly authored page
    const iframe = page.frameLocator('iframe');
    await expect(iframe.getByRole('heading', { name: /My New Web Page/i })).toBeVisible();
  });

  test('Journey 7: Profile switching with independent session isolation', async ({ page }) => {
    const profileSelect = page.locator('select');

    // 1. Confirm default is Alice
    await expect(profileSelect).toHaveValue('663675f3a093a1d9426f0001');

    // 2. Switch to Bob Deepdiver
    await profileSelect.selectOption({ label: 'Bob Deepdiver' });

    // 3. Bob's session should load his deep-sea research stack
    const iframe = page.frameLocator('iframe');
    await expect(iframe.getByRole('heading', { name: /Nautilus|Midnight Zone|Abyss/i })).toBeVisible();

    // 4. Verify independent history
    await page.getByRole('button', { name: /History/i }).click();
    await expect(page.getByText('deep-trench.zz')).toBeVisible();
  });
});
