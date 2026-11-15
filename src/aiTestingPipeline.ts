
import { generateWithOllama } from './services/ollamaService';
import { generateTestCases } from './test-case-generator';
import { generateAutomationScript } from './automationGenerator';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

interface ExecutionResult {
    testCaseId: string;
    testName: string;
    status: string;
    error: string | null;
    executionTime: number;
    retryCount: number;
    diagnosis: string | null;
    finalStatus: string;
}

interface ExecutionAnalysis {
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    compilationErrors: any[];
    results: ExecutionResult[];
}

// STEP 1: Clean AI-generated Playwright scripts
function cleanGeneratedScript(script: string): string {
    let cleaned = script.trim();

    const openingFence = cleaned.match(
        /^```(?:typescript|ts|javascript|js)?[ \t]*\r?\n/i
    );

    if (openingFence) {
        cleaned = cleaned.slice(openingFence[0].length);

        const closingFence = cleaned.search(
            /(?:^|\r?\n)```[ \t]*(?:\r?\n|$)/
        );

        if (closingFence !== -1) {
            cleaned = cleaned.slice(0, closingFence);
        }
    }

    return cleaned.trim();
}

// STEP 2: Extract execution results
function extractExecutionResults(report: any): ExecutionResult[] {
    const results: ExecutionResult[] = [];

    function processSuites(suites: any[]) {
        for (const suite of suites ?? []) {

            for (const spec of suite.specs ?? []) {
                for (const test of spec.tests ?? []) {

                    const attempts = test.results ?? [];
                    const lastAttempt = attempts[attempts.length - 1];

                    const testName = spec.title ?? 'Unknown test';

                    const idMatch = testName.match(/TC_\d+/i);

                    results.push({
                        testCaseId: idMatch?.[0] ?? testName,
                        testName,

                        status: test.status === 'expected'
                            ? 'passed'
                            : lastAttempt?.status ?? 'unknown',

                        error:
                            lastAttempt?.error?.message ??
                            lastAttempt?.errors?.[0]?.message ??
                            null,

                        executionTime: attempts.reduce(
                            (total: number, attempt: any) =>
                                total + (attempt.duration ?? 0),
                            0
                        ),

                        retryCount: Math.max(0, attempts.length - 1),

                        diagnosis: null,

                        finalStatus: test.status === 'expected'
                            ? 'passed'
                            : lastAttempt?.status ?? 'unknown'
                    });
                }
            }

            processSuites(suite.suites ?? []);
        }
    }

    processSuites(report.suites ?? []);

    return results;
}

async function diagnoseFailedTests(
    results: ExecutionResult[]
): Promise<void> {

    const failedTests = results.filter(result =>
        ['failed', 'timedOut', 'interrupted'].includes(result.status)
    );

    if (failedTests.length === 0) {
        console.log('\nNo failed tests found. AI diagnosis not required.');
        return;
    }

    console.log(`\n===== AI FAILURE DIAGNOSIS STARTED =====`);
    console.log(`Failed tests to analyse: ${failedTests.length}`);

    for (const test of failedTests) {

        console.log(`\nAnalysing: ${test.testCaseId}`);

        const prompt = `
You are an expert Playwright automation test failure analyst.

Analyse the following failed test.

Test ID: ${test.testCaseId}
Test Name: ${test.testName}
Execution Status: ${test.status}
Error Message: ${test.error ?? 'No error message available'}

Identify the most likely reason for the failure.

Return ONLY valid JSON using this exact structure:

{
  "category": "application_failure",
  "rootCause": "Explain the likely root cause",
  "evidence": "Evidence from the error message",
  "recommendedFix": "Explain how to fix the issue",
  "confidence": "high"
}

Allowed categories:
- application_failure
- automation_failure
- assertion_failure
- environment_failure
- script_generation_error
- unknown

Allowed confidence values:
- high
- medium
- low

Do not invent evidence.
If the error does not provide enough information, use unknown.
`;

        try {
            const aiResponse = await generateWithOllama(prompt);

            const diagnosis = JSON.parse(aiResponse);

            test.diagnosis = JSON.stringify(diagnosis);

            console.log('\nAI DIAGNOSIS:');
            console.log(JSON.stringify(diagnosis, null, 2));

        } catch (error) {

            console.error(
                `AI diagnosis failed for ${test.testCaseId}:`,
                error
            );

            test.diagnosis = JSON.stringify({
                category: 'unknown',
                rootCause: 'AI diagnosis could not be completed.',
                evidence: test.error,
                recommendedFix: 'Review the Playwright error manually.',
                confidence: 'low'
            });
        }
    }

    console.log('\n===== AI FAILURE DIAGNOSIS COMPLETED =====');
}


// STEP 3: Save execution analysis
function saveExecutionAnalysis(
    results: ExecutionResult[],
    compilationErrors: any[],
    outputFile: string
): ExecutionAnalysis {

    const summary: ExecutionAnalysis = {
        totalTests: results.length,

        passed: results.filter(
            r => r.status === 'passed'
        ).length,

        failed: results.filter(
            r => ['failed', 'timedOut', 'interrupted'].includes(r.status)
        ).length,

        skipped: results.filter(
            r => r.status === 'skipped'
        ).length,

        compilationErrors,

        results
    };

    fs.writeFileSync(
        outputFile,
        JSON.stringify(summary, null, 2),
        'utf-8'
    );

    console.log('\n===== EXECUTION ANALYSIS =====');
    console.log('Total:', summary.totalTests);
    console.log('Passed:', summary.passed);
    console.log('Failed:', summary.failed);
    console.log('Skipped:', summary.skipped);
    console.log('Compilation Errors:', summary.compilationErrors.length);
    console.log('Analysis saved:', outputFile);

    return summary;
}

// MAIN AI TESTING PIPELINE
export async function runAITestingPipeline(requirement: string) {

    console.log('\n===== AI TESTING PIPELINE STARTED =====');

    // STEP 1: Generate test cases
    const testCases = await generateTestCases(requirement);

    console.log('\nTest cases generated:', testCases.length);

    // STEP 2: Create output folder
    const outputDir = path.join(
        process.cwd(),
        'generated-tests'
    );

    fs.mkdirSync(outputDir, { recursive: true });

    const generatedFiles: string[] = [];

    // STEP 3: Generate and save Playwright scripts
    for (const testCase of testCases) {

        console.log(
            '\nGenerating automation for:',
            testCase.testScenario
        );

        const script = await generateAutomationScript(testCase);

        const cleanScript = cleanGeneratedScript(script);

        // STEP 4: Basic script validation
        if (
            !cleanScript.includes('test(') ||
            !cleanScript.includes("from '@playwright/test'")
        ) {
            throw new Error(
                `Invalid Playwright script: ${testCase.testCaseId}`
            );
        }

        // STEP 5: Save generated script
        const safeId = testCase.testCaseId.replace(
            /[^a-zA-Z0-9_-]/g,
            '_'
        );

        const outputFile = path.join(
            outputDir,
            `${safeId}.spec.ts`
        );

        fs.writeFileSync(
            outputFile,
            cleanScript,
            'utf-8'
        );

        generatedFiles.push(
            path.relative(process.cwd(), outputFile).replace(/\\/g, '/')
        );

        console.log('Script saved successfully:', outputFile);
    }

    // STEP 6: Prepare Playwright execution
    console.log('\n===== PLAYWRIGHT EXECUTION STARTED =====');

    const testResultsDir = path.join(
        process.cwd(),
        'test-results'
    );

    fs.mkdirSync(testResultsDir, { recursive: true });

    const jsonReportFile = path.join(
        testResultsDir,
        'playwright-report.json'
    );

    const analysisFile = path.join(
        testResultsDir,
        'execution-analysis.json'
    );

    if (fs.existsSync(jsonReportFile)) {
        fs.unlinkSync(jsonReportFile);
    }

    const playwrightCli = path.join(
        process.cwd(),
        'node_modules',
        '@playwright',
        'test',
        'cli.js'
    );

    if (!fs.existsSync(playwrightCli)) {
        throw new Error('Playwright CLI not found');
    }

    // STEP 7: Execute generated scripts
    const execution = spawnSync(
        process.execPath,
        [
            playwrightCli,
            'test',
            ...generatedFiles,
            '--project=chromium',
            '--reporter=json,html'
        ],
        {
            encoding: 'utf-8',
            cwd: process.cwd(),

            env: {
                ...process.env,
                PLAYWRIGHT_JSON_OUTPUT_NAME: jsonReportFile,
                PLAYWRIGHT_HTML_OPEN: 'never'
            }
        }
    );

    if (execution.error) {
        throw execution.error;
    }

    console.log('\n===== PLAYWRIGHT EXECUTION FINISHED =====');

    console.log('Exit code:', execution.status);

    console.log('\n===== PLAYWRIGHT STDOUT =====');
    console.log(execution.stdout);

    console.log('\n===== PLAYWRIGHT STDERR =====');
    console.log(execution.stderr);

    // STEP 8: Read JSON report
    if (!fs.existsSync(jsonReportFile)) {
        throw new Error(
            'Playwright JSON report was not generated.'
        );
    }

    const report = JSON.parse(
        fs.readFileSync(jsonReportFile, 'utf-8')
    );

    // STEP 9: Extract test results and compilation errors
    const executionResults = extractExecutionResults(report);

    const compilationErrors = report.errors ?? [];
    // STEP 10: AI-based failure diagnosis
    await diagnoseFailedTests(executionResults);

    // STEP 10: Generate execution analysis
    const summary = saveExecutionAnalysis(
        executionResults,
        compilationErrors,
        analysisFile
    );

    if (execution.status !== 0) {
        console.log(
            '\nSome tests failed or execution was unsuccessful.'
        );

        console.log(
            'Execution results are available for AI diagnosis.'
        );
    }

    console.log('\n===== AI TESTING PIPELINE COMPLETED =====');

    return summary;
}
