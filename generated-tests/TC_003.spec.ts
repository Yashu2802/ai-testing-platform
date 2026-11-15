import { test, expect } from '@playwright/test';

test('TC_003 - Login with invalid password', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');

  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'wrong_password');
  await page.click('#login-button');

  await expect(page.locator('[data-test="error"]')).toContainText('Username and password do not match');
  await expect(page).toHaveURL(/\/\#/);
});