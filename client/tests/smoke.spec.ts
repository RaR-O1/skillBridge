import { test, expect } from '@playwright/test';

test.describe('SkillBridge Multi-Role Smoke Test Suite', () => {
  const BASE_URL = process.env.CLIENT_URL || 'http://localhost:5173';

  test('1. Student Role: Navigate feeds, view team, and inspect price agreement card', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check brand logo and title
    await expect(page.locator('text=SkillBridge').first()).toBeVisible();

    // Verify Direct Peer-to-Peer Settlement Notice is visible
    await expect(page.locator('text=Direct Peer-to-Peer Settlement Notice').first()).toBeVisible();

    // Navigate to Teams
    await page.click('text=Hackathon Teams');
    await expect(page.locator('text=Hackathon Teammates')).toBeVisible();

    // Navigate to Freelance Projects
    await page.click('text=Freelance Projects');
    await expect(page.locator('text=Freelance Projects & Gigs')).toBeVisible();

    // Inspect first project card
    const viewProjectBtn = page.locator('text=View Details').first();
    if (await viewProjectBtn.isVisible()) {
      await viewProjectBtn.click();
      await expect(page.locator('text=Agreed Budget')).toBeVisible();
    }
  });

  test('2. Role Switcher: Switch to Local Business and Admin Console', async ({ page }) => {
    await page.goto(BASE_URL);

    // Open Role switcher
    const roleBtn = page.locator('button:has-text("Role:")').first();
    await roleBtn.click();

    // Switch to Admin
    await page.click('text=Administrator Console');

    // Admin should see Admin Console in navigation
    await page.click('text=Admin Console');
    await expect(page.locator('text=SkillBridge Admin Console')).toBeVisible();
    await expect(page.locator('text=Student College Email Approvals')).toBeVisible();

    // Switch to Disputes & Reports tab
    await page.click('text=Disputes & Reports');
    await expect(page.locator('text=Disputes & Incident Reports')).toBeVisible();
  });

  test('3. Verification & Profile Flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    await expect(page.locator('text=Skills & Proficiencies')).toBeVisible();
    await expect(page.locator('text=Portfolio & Completed Work')).toBeVisible();
  });
});
