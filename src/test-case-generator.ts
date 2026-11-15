
import { generateWithOllama } from "./services/ollamaService";
import { exportTestCasesToExcel } from "./services/excelService";
import type { TestCase } from "./testCaseReader";

interface GeneratedTestCase {
  testCaseId: string;
  scenario: string;
  preconditions: string;
  testSteps: string[];
  testData: string;
  expectedResult: string;
  priority: string;
}

export async function generateTestCases(
  requirement: string
): Promise<TestCase[]> {

  const prompt = `
You are an experienced QA automation engineer.

Requirement:
${requirement}

Generate positive and negative test cases.

Return ONLY valid JSON in this structure:

{
  "testCases": [
    {
      "testCaseId": "TC_001",
      "scenario": "Login with valid credentials",
      "preconditions": "User is registered",
      "testSteps": [
        "Open login page",
        "Enter valid username",
        "Enter valid password",
        "Click login"
      ],
      "testData": "Valid username and password",
      "expectedResult": "User should successfully log in",
      "priority": "High"
    }
  ]
}

Do not include markdown or explanations outside JSON.
`;

  console.log("Generating test cases using AI...");

  const result = await generateWithOllama(prompt);

  const cleanedResult = result
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const parsedResult = JSON.parse(cleanedResult);

  if (!Array.isArray(parsedResult.testCases)) {
    throw new Error("Invalid AI test case response");
  }

  const generatedCases: GeneratedTestCase[] =
    parsedResult.testCases;

  if (generatedCases.length === 0) {
    throw new Error("AI did not generate any test cases");
  }

  // Convert AI response into the format expected by Playwright generator
  const testCases: TestCase[] = generatedCases.map((tc) => ({
    testCaseId: tc.testCaseId,
    testScenario: tc.scenario,
    preconditions: tc.preconditions,
    testSteps: tc.testSteps.join("\n"),
    testData: tc.testData,
    expectedResult: tc.expectedResult,
    priority: tc.priority
  }));

  console.log("Total Test Cases:", testCases.length);

  // Preserve existing Excel export functionality
  exportTestCasesToExcel(
    generatedCases
  );

  return testCases;
}

