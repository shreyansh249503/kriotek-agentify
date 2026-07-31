import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bhyrxyzokssibgeznojo.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoeXJ4eXpva3NzaWJnZXpub2pvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQ2NDY4NSwiZXhwIjoyMDg0MDQwNjg1fQ.LvlZyZfUu02x9gnjwaXNJMwOlyU_DTc1dphgr2iZOx0";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: stores, error } = await supabase
    .from("shopify_stores")
    .select("*");

  console.log("Shopify Stores in DB count:", stores?.length, "Error:", error);

  if (!stores || stores.length === 0) return;

  for (const store of stores) {
    console.log(`\n--- Querying store ${store.shop} (bot_id: ${store.bot_id}) ---`);

    const testQueries = [
      `1001`,
      `name:#1001`,
      `name:1001`,
      `name:"#1001"`,
      `name:"1001"`,
      `fanendra.choudhary@kriotek.in`,
      `email:fanendra.choudhary@kriotek.in`,
      null,
    ];

    for (const q of testQueries) {
      const graphqlQuery = {
        query: `
          query searchOrders($query: String) {
            orders(first: 10, query: $query) {
              edges {
                node {
                  id
                  name
                  email
                  createdAt
                  customer {
                    firstName
                    lastName
                    email
                  }
                }
              }
            }
          }
        `,
        variables: { query: q },
      };

      try {
        const res = await fetch(`https://${store.shop}/admin/api/2026-04/graphql.json`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": store.access_token,
          },
          body: JSON.stringify(graphqlQuery),
        });

        const json = await res.json();
        const count = json?.data?.orders?.edges?.length ?? 0;
        console.log(`Query: [${q}] -> Count: ${count}`);
        if (count > 0) {
          console.log("  First Order:", JSON.stringify(json.data.orders.edges[0].node));
        } else if (json.errors) {
          console.log("  GQL Errors:", JSON.stringify(json.errors));
        }
      } catch (err) {
        console.error(`Query: [${q}] -> Error:`, err.message);
      }
    }
  }
}

run();
