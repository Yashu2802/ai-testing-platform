import { test, expect } from '@playwright/test';

test('TC_004 - Login with blank username', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');

  await page.fill('#user-name', '');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');

  await expect(page.locator('[data-test="error"]')).toContainText('Username is required');
  await expect(page).toHaveURL('https://www.saucedemo.com/');

  await page.fill('#user-name', 'locked_out_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');

  await expect(page.locator('[data-test="error"]')).toContainText('Username and password do not match');
  await expect(page).toHaveURL('https://www.saucedemo.com/');

  await page.fill('#user-name', 'invalid_username');
  await page.fill('#password', 'wrong_password');
  await page.click('#login-button');

  await expect(page.locator('[data-test="error"]')).toContainText('Username and password do not match');
  await expect(page).toHaveURL('https://www.saucedemo.com/');
});