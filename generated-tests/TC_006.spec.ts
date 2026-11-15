import { test, expect } from '@playwright/test';

test('TC_006 - Login with invalid credentials (invalid username and password combination)', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');

  await page.fill('#user-name', 'invalid_username');
  await page.fill('#password', 'wrong_password');
  await page.click('#login-button');

  await expect(page.locator('[data-test="error"]')).toContainText('Username and password do not match');
});