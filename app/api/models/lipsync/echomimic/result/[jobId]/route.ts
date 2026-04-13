const ECHOMIMIC_URL = process.env.ECHOMIMIC_API_URL ?? "http://localhost:8001";

export async function GET(_req: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const res = await fetch(`${ECHOMIMIC_URL}/lipsync/result/${jobId}`);
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
