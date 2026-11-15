
import * as XLSX from "xlsx";

interface TestCase {
  testCaseId: string;
  scenario: string;
  preconditions: string;
  testSteps: string[];
  testData: string;
  expectedResult: string;
  priority: string;
}

export function exportTestCasesToExcel(testCases: TestCase[]) {

  const formattedData = testCases.map((testCase) => ({
    "Test Case ID": testCase.testCaseId,
    "Test Scenario": testCase.scenario,
    "Preconditions": testCase.preconditions,
    "Test Steps": testCase.testSteps.join("\n"),
    "Test Data": testCase.testData,
    "Expected Result": testCase.expectedResult,
    "Priority": testCase.priority,
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Test Cases"
  );

  XLSX.writeFile(workbook, "AI_Generated_TestCases.xlsx");

  console.log("Excel file generated successfully!");
}
