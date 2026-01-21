export function generateEmbedScript(publicKey: string) {
  return `<script
  bot-id="${publicKey}"
  src="http://localhost:3000/widget.js">
</script>`;
}
