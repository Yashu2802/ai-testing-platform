import { test, expect } from '@playwright/test';

test('TC_002 - Login with invalid username', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');

  // Enter invalid username
  await page.fill('#user-name', 'invalid_username');
  // Enter valid password
  await page.fill('#password', 'secret_sauce');
  // Click login button
  await page.click('#login-button');

  // Verify error message is displayed
  await expect(page.locator('[data-test="error"]')).toContainText('Username and password do not match');

  // Verify the URL remains the login page
  await expect(page).toHaveURL(/\/login\?error/);
});