
import { generateWithOllama } from "./services/ollamaService";

async function testOllama() {
  const prompt = `
You are a QA automation engineer.

Analyze this requirement:

A user should be able to log in using a valid username and password.

Identify:
1. Functional scenarios
2. Positive test scenarios
3. Negative test scenarios
`;

  console.log("Sending requirement to local AI...");

  const result = await generateWithOllama(prompt);

  console.log("\nAI Generated QA Analysis:\n");
  console.log(result);
}

testOllama();
