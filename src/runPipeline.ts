
import { runAITestingPipeline } from './aiTestingPipeline';

async function main() {

    const requirement = `
    A user should be able to log in using
    a valid username and password.
    `;

    await runAITestingPipeline(requirement);
}

main().catch(error => {
    console.error('\nPipeline failed:', error);
    process.exitCode = 1;
});
