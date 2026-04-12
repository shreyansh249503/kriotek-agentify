const MODELS_URL = process.env.MODELS_API_URL ?? "http://localhost:8000";

export async function POST(req: Request) {
  const form = await req.formData();

  const res = await fetch(`${MODELS_URL}/tts/generate`, {
    method: "POST",
    body: form,
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
