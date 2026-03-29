export function chunkText(text: string, chunkSize = 800): string[] {
  if (!text || text.length < 200) return [];
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    chunks.push(text.slice(start, start + chunkSize));
    start += chunkSize;
  }

  return chunks;
}
