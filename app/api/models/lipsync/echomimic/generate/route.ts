const ECHOMIMIC_URL = process.env.ECHOMIMIC_API_URL ?? "http://localhost:8001";

export async function POST(req: Request) {
  const form = await req.formData();

  const res = await fetch(`${ECHOMIMIC_URL}/lipsync/generate`, {
    method: "POST",
    body: form,
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
