import { setupCollection } from "../lib/qdrant-setup";

export async function POST(req: Request) {
  await setupCollection();
}
