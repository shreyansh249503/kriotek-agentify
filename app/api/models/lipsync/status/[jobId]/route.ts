const MODELS_URL = process.env.MODELS_API_URL ?? "http://localhost:8000";

export async function GET(_req: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const res = await fetch(`${MODELS_URL}/lipsync/status/${jobId}`);
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
