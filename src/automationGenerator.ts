
import { TestCase } from './testCaseReader';

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL_NAME = 'qwen2.5:3b';

export async function generateAutomationScript(
    testCase: TestCase
): Promise<string> {

    const prompt = `
You are an expert Playwright Test Automation Engineer.

Convert the following manual test case into an executable
Playwright TypeScript test.

APPLICATION DETAILS:
Application: SauceDemo
Base URL: https://www.saucedemo.com/

LOGIN LOCATORS:
Username: #user-name
Password: #password
Login button: #login-button
Error message: [data-test="error"]
Products page heading: .title

TEST CREDENTIALS:
Valid username: standard_user
Valid password: secret_sauce
Invalid username: invalid_username
Invalid password: wrong_password
Locked user: locked_out_user

TEST CASE:
ID: ${testCase.testCaseId}
Scenario: ${testCase.testScenario}
Preconditions: ${testCase.preconditions}
Steps: ${testCase.testSteps}
Test Data: ${testCase.testData}
Expected Result: ${testCase.expectedResult}

MANDATORY INSTRUCTIONS:

1. Use ONLY @playwright/test.
2. Import exactly:
   import { test, expect } from '@playwright/test';
3. Wrap the test inside:
   test('test name', async ({ page }) => { });
4. Do NOT use chromium.launch().
5. Do NOT use browser.newContext().
6. Do NOT create standalone async functions.
7. Do NOT use playwright-chromium.
8. Use the actual SauceDemo URL and locators provided above.
9. Use page.goto(), page.fill(), and page.click() where applicable.
10. Include meaningful assertions based on the expected result.
11. Do not use undefined variables.
12. Do not generate placeholders.
13. Do not include Markdown code fences.
14. Do not include explanations.
15. Return ONLY complete executable TypeScript code.

ASSERTION RULES:

16. NEVER use expect(page).toHaveText().
17. For text assertions, ALWAYS use expect(page.locator('selector')).
18. For successful SauceDemo login, use:
    await expect(page).toHaveTitle('Swag Labs');
    await expect(page).toHaveURL(/inventory.html/);
    await expect(page.locator('.title')).toHaveText('Products');

19. Never assume the browser title is the same as the page heading.

20. For unsuccessful login, verify that the URL remains:
    https://www.saucedemo.com/

21. For invalid username or password, verify the error using:
    await expect(page.locator('[data-test="error"]'))
      .toContainText('Username and password do not match');

22. For blank credentials, verify the appropriate validation message
    using the error locator:
    [data-test="error"]

23. For locked user login, verify the appropriate locked-out error
    using the error locator:
    [data-test="error"]

24. Do not use Products page assertions for unsuccessful login.

25. Do not invent browser titles, error messages, selectors, or expected results.

26. Use assertions that match the specific test scenario.
    Do not apply successful-login assertions to negative scenarios.

27. Use only the test data supplied above or the known SauceDemo
    credentials listed in this prompt.

IMPORTANT:
The generated script must be directly executable using:
npx playwright test

Generate the test now.
`;

    const response = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: MODEL_NAME,
            prompt,
            stream: false,
            options: {
                temperature: 0.1
            }
        })
    });

    if (!response.ok) {
        throw new Error(
            `Ollama request failed: ${response.status}`
        );
    }

    const result = await response.json();

    return result.response.trim();
}
