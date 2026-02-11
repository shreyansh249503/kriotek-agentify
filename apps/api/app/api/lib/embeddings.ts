export async function createEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "models/gemini-embedding-001",
        content: {
          parts: [{ text }],
        },
        outputDimensionality: 768,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Full error response:", JSON.stringify(data, null, 2));
    throw new Error(
      `Google Embedding API error: ${data.error?.message || JSON.stringify(data)}`,
    );
  }

  return data.embedding.values;
}
