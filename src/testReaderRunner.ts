
import { readTestCases } from './testCaseReader';

const filePath ='C:/Users/HP/ai-testing-platform/AI_Generated_TestCases.xlsx';

const testCases = readTestCases(filePath);

console.log('\n===== AI GENERATED TEST CASES =====\n');

testCases.forEach((testCase) => {
    console.log(`Test Case ID: ${testCase.testCaseId}`);
    console.log(`Scenario: ${testCase.testScenario}`);
    console.log(`Priority: ${testCase.priority}`);
    console.log(`Expected Result: ${testCase.expectedResult}`);
    console.log('----------------------------------');
});
