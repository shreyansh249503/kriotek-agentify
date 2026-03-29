import { setupCollection } from "../lib/vector-db-setup";

export async function POST(req: Request) {
  await setupCollection();
}
