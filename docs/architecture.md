
# System Architecture

## Workflow

1. User provides application requirements.
2. Ollama processes requirements using Qwen.
3. AI generates structured test cases.
4. Test cases are exported to Excel.
5. TypeScript reads generated test cases.
6. AI generates Playwright automation scripts.
7. Playwright executes the scripts.
8. Execution reports are generated.
