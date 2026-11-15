
const OLLAMA_URL = "http://localhost:11434/api/chat";
const MODEL_NAME = "qwen2.5:3b";

export async function generateWithOllama(
    prompt: string
): Promise<string> {
    const response = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: MODEL_NAME,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            stream: false,
            format: "json"
        })
    });

    if (!response.ok) {
        throw new Error(
            `Ollama API Error: ${response.status}`
        );
    }

    const data = await response.json();

    return data.message.content;
}
