const WEBHOOK_TOPICS = [
  "products/create",
  "products/update",
  "products/delete",
  "app/uninstalled",
];

export async function registerWebhooks(
  shop: string,
  accessToken: string
) {
  const webhookUrl = `${process.env.SHOPIFY_APP_URL}/api/shopify/webhooks`;

  for (const topic of WEBHOOK_TOPICS) {
    try {
      const res = await fetch(`https://${shop}/admin/api/2024-01/webhooks.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({
          webhook: {
            topic,
            address: webhookUrl,
            format: "json",
          },
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error(`Failed to register webhook ${topic} for ${shop}:`, res.status, errText);
      } else {
        console.log(`Successfully registered webhook ${topic} for ${shop}`);
      }
    } catch (e) {
      console.error(`Error registering webhook ${topic} for ${shop}:`, e);
    }
  }
}
