import { test, expect } from '@playwright/test';

test('TC_005 - Login with blank password', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');

  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', '');
  await page.click('#login-button');

  await expect(page.locator('[data-test="error"]')).toContainText('Password is required');
  await expect(page).toHaveURL('https://www.saucedemo.com/');

  // Invalid username and password
  await page.fill('#user-name', 'invalid_username');
  await page.fill('#password', 'wrong_password');
  await page.click('#login-button');

  await expect(page.locator('[data-test="error"]')).toContainText('Username and password do not match');
  await expect(page).toHaveURL('https://www.saucedemo.com/');

  // Locked user
  await page.fill('#user-name', 'locked_out_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');

  await expect(page.locator('[data-test="error"]')).toContainText('Epic sadface: Sorry, try again.');
  await expect(page).toHaveURL('https://www.saucedemo.com/');

  // Blank password
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', '');
  await page.click('#login-button');

  await expect(page.locator('[data-test="error"]')).toContainText('Password is required');
  await expect(page).toHaveURL('https://www.saucedemo.com/');
});