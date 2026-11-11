import { z } from "zod";

/**
 * Validation for bot create (POST /api/bots) and edit (PUT /api/bots/[id]).
 *
 * Text fields end up in the chatbot's system prompt on every chat request, so their length is
 * capped to keep cost and prompt size bounded. The product cap is generous on purpose: Shopify
 * sync stores a store's whole catalog on the bot, and the dashboard's edit form sends the full
 * list back on every save, so a low cap would block large stores from editing their bot.
 */
export const BOT_LIMITS = {
  name: 100,
  description: 4000,
  companyName: 200,
  contactPrompt: 500,
  contactEmailMessage: 1000,
  ecommercePrompt: 4000,
  url: 2048,
  products: 5000,
  productName: 500,
  productDescription: 10_000,
  productImages: 20,
  productVariants: 100,
  /** Serialized size of the whole product list. */
  productsBytes: 3 * 1024 * 1024,
} as const;

const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

const optionalText = (max: number) => z.string().max(max).nullish();

/** Empty, an http(s) URL, or a path on this app. Anything else (javascript:, data:) is rejected. */
const logoUrl = z
  .string()
  .max(BOT_LIMITS.url)
  .refine((value) => value === "" || /^https?:\/\/[^\s]+$/i.test(value) || /^\/(?!\/)\S*$/.test(value), {
    message: "must be an http(s) URL",
  })
  .nullish();

const contactEmail = z
  .union([z.literal(""), z.email().max(254)])
  .nullish();

const lastTrainedAt = z
  .string()
  .max(64)
  .refine((value) => !Number.isNaN(Date.parse(value)), "must be a date")
  .nullish();

// Products come from the form, URL extraction and Shopify sync, with many optional fields; the
// known fields are checked and the rest are kept as they are.
const product = z.looseObject({
  name: z.string().trim().min(1).max(BOT_LIMITS.productName),
  price: z.union([z.number(), z.string().max(50)]),
  url: z.string().max(BOT_LIMITS.url),
  image: z.string().max(BOT_LIMITS.url).optional(),
  description: z.string().max(BOT_LIMITS.productDescription).nullish(),
  images: z.array(z.string().max(BOT_LIMITS.url)).max(BOT_LIMITS.productImages).optional(),
  variants: z.array(z.looseObject({})).max(BOT_LIMITS.productVariants).optional(),
});

const products = z
  .array(product)
  .max(BOT_LIMITS.products)
  .refine((list) => JSON.stringify(list).length <= BOT_LIMITS.productsBytes, {
    message: `product list is too large (over ${BOT_LIMITS.productsBytes / 1024 / 1024} MB)`,
  });

const botFields = {
  name: z.string().trim().min(1, "is required").max(BOT_LIMITS.name),
  description: optionalText(BOT_LIMITS.description),
  tone: z.enum(["friendly", "professional"]),
  primaryColor: z.string().regex(HEX_COLOR, "must be a hex colour like #4f46e5"),
  contactEnabled: z.boolean(),
  contactEmail,
  contactPrompt: optionalText(BOT_LIMITS.contactPrompt),
  contactEmailMessage: optionalText(BOT_LIMITS.contactEmailMessage),
  logoUrl,
  ecommerceEnabled: z.boolean(),
  ecommercePrompt: optionalText(BOT_LIMITS.ecommercePrompt),
  ecommerceProducts: products,
  companyName: optionalText(BOT_LIMITS.companyName),
  lastTrainedAt,
};

/** Create: name is required; everything else has a default. Unknown fields are dropped. */
export const CreateBotSchema = z.object({
  ...botFields,
  tone: botFields.tone.default("friendly"),
  primaryColor: botFields.primaryColor.default("#000000"),
  contactEnabled: botFields.contactEnabled.default(false),
  contactEmail: botFields.contactEmail.default(""),
  contactPrompt: botFields.contactPrompt.default("Would you like us to contact you for more details?"),
  contactEmailMessage: botFields.contactEmailMessage.default(
    "Thanks for reaching out! Our team will contact you shortly.",
  ),
  ecommerceEnabled: botFields.ecommerceEnabled.default(false),
  ecommercePrompt: botFields.ecommercePrompt.default(""),
  ecommerceProducts: botFields.ecommerceProducts.default([]),
});

/** Edit: every field is optional; only the fields sent are updated. */
export const UpdateBotSchema = z.object(botFields).partial();

export type CreateBotData = z.infer<typeof CreateBotSchema>;
export type UpdateBotData = z.infer<typeof UpdateBotSchema>;

/** Column for each editable API field. */
export const BOT_COLUMNS = {
  name: "name",
  description: "description",
  tone: "tone",
  primaryColor: "primary_color",
  contactEnabled: "contact_enabled",
  contactEmail: "contact_email",
  contactPrompt: "contact_prompt",
  contactEmailMessage: "contact_email_message",
  logoUrl: "logo_url",
  ecommerceEnabled: "ecommerce_enabled",
  ecommercePrompt: "ecommerce_prompt",
  ecommerceProducts: "ecommerce_products",
  companyName: "company_name",
  lastTrainedAt: "last_trained_at",
} as const satisfies Record<keyof UpdateBotData, string>;

/** "name: Too big: expected string to have <=100 characters", one line per problem. */
export function describeIssues(error: z.ZodError): string[] {
  return error.issues.slice(0, 20).map((issue) => {
    const field = issue.path.length ? issue.path.join(".") : "body";
    return `${field}: ${issue.message}`;
  });
}

/** Reads a JSON body; null when it isn't JSON. */
export async function readJson(req: Request): Promise<unknown | null> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
