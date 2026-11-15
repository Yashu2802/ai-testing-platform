import { test, expect } from '@playwright/test';

test('TC_007 - Login with incorrect login attempt (too many failed attempts)', async ({ page }) => {
  // Open login page
  await page.goto('https://www.saucedemo.com/');

  // Enter valid username and incorrect password (too many times)
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'wrong_password');
  await page.click('#login-button');

  // Verify user cannot log in with too many failed attempts
  await expect(page.locator('[data-test="error"]')).toContainText('Epic fail: Username and password do not match');
});