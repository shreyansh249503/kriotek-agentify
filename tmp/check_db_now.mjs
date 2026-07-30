import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bhyrxyzokssibgeznojo.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoeXJ4eXpva3NzaWJnZXpub2pvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQ2NDY4NSwiZXhwIjoyMDg0MDQwNjg1fQ.LvlZyZfUu02x9gnjwaXNJMwOlyU_DTc1dphgr2iZOx0";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNow() {
  const { data: stores, error } = await supabase.from("shopify_stores").select("*");
  console.log("=== CURRENT SHOPIFY_STORES IN SUPABASE ===");
  console.log(JSON.stringify(stores, null, 2));
  console.log("Error:", error);
}

checkNow();
