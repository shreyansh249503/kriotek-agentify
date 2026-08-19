import { crawlWebsite } from "./app/api/lib/crawler";

async function main() {
  const url = "https://veirdo.in/products/crocodilian-swanwhite-oversized-puff-printed-exclusive-t-shirt-copy?pr_prod_strat=e5_desc&pr_rec_id=d7bec394e&pr_rec_pid=7342061355063&pr_ref_pid=7422388207671&pr_seq=uniform";

  const result = await crawlWebsite(url, "test_pub_key", 1, true);

  console.log("\n=== REAL EXTRACTED CROCODILIAN PRODUCT ===");
  console.log(JSON.stringify(result.products, null, 2));
}

main().catch(console.error);
