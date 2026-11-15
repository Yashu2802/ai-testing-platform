
import * as XLSX from 'xlsx';

export interface TestCase {
    testCaseId: string;
    testScenario: string;
    preconditions: string;
    testSteps: string;
    testData: string;
    expectedResult: string;
    priority: string;
}

export function readTestCases(filePath: string): TestCase[] {

    // Read Excel workbook
    const workbook = XLSX.readFile(filePath);

    // Get first worksheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert Excel rows into JSON
    const rows = XLSX.utils.sheet_to_json<any>(
        worksheet,
        { defval: '' }
    );

    // Map Excel columns to TypeScript objects
    const testCases: TestCase[] = rows.map((row) => ({
        testCaseId: String(row['Test Case ID']).trim(),
        testScenario: String(row['Test Scenario']).trim(),
        preconditions: String(row['Preconditions']).trim(),
        testSteps: String(row['Test Steps']).replace(/<br\s*\/?>/gi, '\n').trim(),
        testData: String(row['Test Data']).trim(),
        expectedResult: String(row['Expected Result']).trim(),
        priority: String(row['Priority']).trim()
    }));

    console.log(`Total Test Cases Read: ${testCases.length}`);

    return testCases;
}
