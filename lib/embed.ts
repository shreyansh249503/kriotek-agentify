export function generateEmbedScript(publicKey: string) {
  return `<script
   bot-id="${publicKey}"
  src="${process.env.NEXT_PUBLIC_API_URL}/widget.js">
</script>`;
}

export function generateReactEmbedScript(publicKey: string) {
  return `import Script from "next/script";

<body>
  <Script
    bot-id="${publicKey}"
    src="${process.env.NEXT_PUBLIC_API_URL}/widget.js"
  />
</body>`;
}
