import { test, expect } from '@playwright/test';

test('TC_001 - Login with valid credentials', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');

  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');

  await expect(page).toHaveTitle('Swag Labs');
  await expect(page).toHaveURL(/inventory.html/);
  await expect(page.locator('.title')).toHaveText('Products');
});

test('TC_002 - Login with invalid username', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');

  await page.fill('#user-name', 'invalid_username');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');

  await expect(page).toHaveURL(/login.html/);
  await expect(page.locator('[data-test="error"]')).toContainText('Username and password do not match');
});

test('TC_003 - Login with invalid password', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');

  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'wrong_password');
  await page.click('#login-button');

  await expect(page).toHaveURL(/login.html/);
  await expect(page.locator('[data-test="error"]')).toContainText('Username and password do not match');
});

test('TC_004 - Login with locked user', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');

  await page.fill('#user-name', 'locked_out_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');

  await expect(page).toHaveURL(/login.html/);
  await expect(page.locator('[data-test="error"]')).toContainText('Sorry, try again later');
});