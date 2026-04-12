const MODELS_URL = process.env.MODELS_API_URL ?? "http://localhost:8000";

export async function POST(req: Request) {
  const body = await req.json();

  const res = await fetch(`${MODELS_URL}/image/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
