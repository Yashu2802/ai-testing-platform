

import { readTestCases } from './testCaseReader';
import { generateAutomationScript } from './automationGenerator';
import fs from 'node:fs';
import path from 'node:path';

async function main() {
    const filePath =
        'C:/Users/HP/ai-testing-platform/AI_Generated_TestCases.xlsx';

    const testCases = readTestCases(filePath);
    const selectedTestCase = testCases[0];

    console.log('Generating automation for:',
        selectedTestCase.testScenario);

    const script = await generateAutomationScript(selectedTestCase);

    // Remove Markdown code fences if the AI returns them
    const cleanScript = script
        .replace(/^```(?:typescript|ts)?\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();

    const outputDir = path.join(process.cwd(), 'generated-tests');

    fs.mkdirSync(outputDir, { recursive: true });

    const outputFile = path.join(
        outputDir,
        `${selectedTestCase.testCaseId}.spec.ts`
    );

    fs.writeFileSync(outputFile, cleanScript, 'utf-8');

    console.log('\nAutomation script saved successfully!');
    console.log(`Location: ${outputFile}`);
}

main().catch(console.error);
