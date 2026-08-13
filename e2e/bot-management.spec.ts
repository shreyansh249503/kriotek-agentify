import { test, expect } from '@playwright/test';
import { CreateBotInput, UpdateBotInput } from '@/types/bot';
import { mockSupabaseAuth } from './auth-helpers';
import { mockBotAPIs, MOCK_BOT, setSessionViaInitScript } from './bot-helpers';

test.describe('Bot Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setSessionViaInitScript(page);
    await mockSupabaseAuth(page);
  });

  test.describe('E2E-2.1: Bot Creation Wizard (/admin/new)', () => {
    test('should configure bot details, enable contact collection, add ecommerce products, and create bot', async ({
      page,
    }) => {
      let createdPayload: Partial<CreateBotInput> | null = null;
      await mockBotAPIs(page, {
        onCreateSuccess: (data) => {
          createdPayload = data as Partial<CreateBotInput>;
        },
      });

      await page.goto('/admin/new', { waitUntil: 'domcontentloaded' });

      const nameInput = page.getByPlaceholder('e.g. Support Assistant');
      await expect(nameInput).toBeVisible({ timeout: 15000 });
      await expect(nameInput).toBeEditable({ timeout: 15000 });
      await nameInput.fill('Agentify AI Support');

      const descInput = page.getByPlaceholder('Describe what this bot does...');
      await descInput.fill('Automated customer service and sales assistant');

      const toneSelectBtn = page.getByRole('button', { name: /Friendly & Casual|Select an option/i });
      await toneSelectBtn.click();
      const profOption = page.getByText('Professional & Formal');
      await expect(profOption).toBeVisible();
      await profOption.click();

      const colorSwatch = page.locator('div[style*="rgb(123, 97, 255)"], div[style*="#7B61FF"]').or(
        page.locator('div').filter({ has: page.locator('button:text("Reset color")') }).locator('div[color], div').nth(5)
      ).first();
      if (await colorSwatch.isVisible()) {
        await colorSwatch.click();
      }

      const contactToggle = page.getByText('Enable Lead Collection').locator('..').locator('div').first();
      await expect(contactToggle).toBeVisible();
      await contactToggle.click();

      const emailInput = page.getByPlaceholder('email@example.com');
      await expect(emailInput).toBeVisible({ timeout: 5000 });
      await emailInput.fill('support@example.com');

      const contactPrompt = page.getByPlaceholder('Would you like us to contact you?');
      await contactPrompt.fill('Can we have your email to follow up?');

      const confirmMsg = page.getByPlaceholder('Thanks for reaching out! Our team will contact you shortly.');
      await confirmMsg.fill('Thank you! Our support team will get in touch with you.');

      const ecommerceToggle = page.getByText('Enable E-Commerce Mode').locator('..').locator('div').first();
      await expect(ecommerceToggle).toBeVisible();
      await ecommerceToggle.click();

      const addProductBtn = page.getByRole('button', { name: '+ Add Product' });
      await expect(addProductBtn).toBeVisible({ timeout: 5000 });
      await addProductBtn.click();

      const prodNameInput = page.getByPlaceholder('e.g. Myaxyl Balm');
      await expect(prodNameInput).toBeVisible({ timeout: 5000 });
      await prodNameInput.fill('Smart Earbuds Pro');

      const prodPriceInput = page.getByPlaceholder('e.g. 60.00 INR');
      await prodPriceInput.fill('$149.00');

      const prodLinkInput = page.getByPlaceholder('https://example.com/product');
      await prodLinkInput.fill('https://example.com/products/earbuds-pro');

      const prodFileInput = page.locator('input[id^="product-image-"]');
      await prodFileInput.setInputFiles({
        name: 'earbuds.png',
        mimeType: 'image/png',
        buffer: Buffer.from('mock-product-image-binary-data'),
      });

      const saveProductBtn = page.getByRole('button', { name: 'Save Details' });
      await expect(saveProductBtn).toBeEnabled();
      await saveProductBtn.click();

      await expect(page.getByText('Smart Earbuds Pro')).toBeVisible();
      await expect(page.getByText('$149.00')).toBeVisible();
      await expect(page.getByText('https://example.com/products/earbuds-pro')).toBeVisible();

      const salesInstructions = page.getByPlaceholder(/Provide details about any specific convincing strategies/i);
      await salesInstructions.fill('Highlight our 30-day money back guarantee.');

      const createBotBtn = page.getByRole('button', { name: 'Create Bot' });
      await createBotBtn.click();

      await expect(page).toHaveURL(/\/admin\/bots\/pk_newly_created_bot\/ingest/, { timeout: 10000 });
      expect(createdPayload).not.toBeNull();
      const created = createdPayload as unknown as Partial<CreateBotInput>;
      expect(created?.name).toBe('Agentify AI Support');
      expect(created?.contactEnabled).toBe(true);
      expect(created?.ecommerceEnabled).toBe(true);
    });
  });

  test.describe('E2E-2.2: Website Ingestion (/admin/bots/[publicKey]/ingest)', () => {
    test('should enter website URL for crawling, execute ingestion, and verify status indicator transitions to complete', async ({
      page,
    }) => {
      await mockBotAPIs(page);

      await page.goto(`/admin/bots/${MOCK_BOT.public_key}/ingest`, { waitUntil: 'domcontentloaded' });

      await expect(page.getByRole('heading', { name: 'Ingest Website URL' })).toBeVisible({ timeout: 10000 });

      const urlInput = page.getByPlaceholder('https://example.com');
      await urlInput.fill('https://example.com/docs');

      const extractToggle = page.getByText('Extract products from website during crawl').locator('..').locator('..').locator('div').first();
      await extractToggle.click();

      const ingestBtn = page.getByRole('button', { name: 'Ingest All Selected Sources' });
      await ingestBtn.click();

      const progressBox = page.locator('div').filter({ hasText: /%/ }).first();
      await expect(progressBox).toBeVisible();

      await expect(page.getByText('Ingestion Results')).toBeVisible({ timeout: 15000 });
      await expect(
        page.getByText(/URL Crawl:\s*Learned from 12 chunks,\s*extracted 4 products and enabled Sales mode/i)
      ).toBeVisible();

      await expect(page.getByText('Your chatbot is ready!')).toBeVisible();
      await expect(page.getByText('Bot Public Key:')).toBeVisible();
    });
  });

  test.describe('E2E-2.3: PDF Ingestion', () => {
    test('should upload sample documentation PDF file and verify progress and chunking acknowledgment', async ({
      page,
    }) => {
      await mockBotAPIs(page);

      await page.goto(`/admin/bots/${MOCK_BOT.public_key}/ingest`, { waitUntil: 'domcontentloaded' });

      await expect(page.getByRole('heading', { name: 'Ingest PDF Document' })).toBeVisible({ timeout: 10000 });

      const pdfInput = page.locator('input[accept="application/pdf"]');
      await pdfInput.setInputFiles({
        name: 'user-guide.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4 Mock PDF Knowledge Document'),
      });

      await expect(page.getByText('user-guide.pdf')).toBeVisible();

      const ingestBtn = page.getByRole('button', { name: 'Ingest All Selected Sources' });
      await ingestBtn.click();

      await expect(page.getByText('Ingestion Results')).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('PDF Upload: Processed into 18 chunks')).toBeVisible();
    });
  });

  test.describe('E2E-2.4: Bot Configuration Updates (/admin/bot/[id]/edit-bot)', () => {
    test('should modify bot instructions, tone, and logo, save changes, and verify persistence', async ({
      page,
    }) => {
      let updatedPayload: Partial<UpdateBotInput> | null = null;
      await mockBotAPIs(page, {
        bot: {
          id: 'b1111111-2222-3333-4444-555555555555',
          name: 'Support Assistant',
          description: 'Original description of the assistant.',
          tone: 'friendly',
          logo_url: '',
        },
        onUpdateSuccess: (data) => {
          updatedPayload = data as Partial<UpdateBotInput>;
        },
      });

      await page.goto('/admin/bot/b1111111-2222-3333-4444-555555555555/edit-bot', { waitUntil: 'domcontentloaded' });

      const descInput = page.getByPlaceholder('Describe what this bot does...');
      await expect(descInput).toBeVisible({ timeout: 10000 });
      await expect(descInput).toHaveValue('Original description of the assistant.');

      await descInput.fill('Updated enterprise assistant with multi-language support.');

      const toneSelectBtn = page.getByRole('button', { name: /Friendly & Casual|Professional & Formal/i });
      await toneSelectBtn.click();
      const profOption = page.getByText('Professional & Formal');
      await profOption.click();

      const logoFileInput = page.locator('input[type="file"][accept="image/*"]').first();
      await logoFileInput.setInputFiles({
        name: 'new-logo.png',
        mimeType: 'image/png',
        buffer: Buffer.from('mock-avatar-image-data'),
      });

      await expect(page.getByRole('button', { name: 'Remove' })).toBeVisible({ timeout: 10000 });

      const saveBtn = page.getByRole('button', { name: /Update Bot|Save Changes/i });
      await expect(saveBtn).toBeEnabled();
      await saveBtn.click();

      await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
      await expect.poll(() => updatedPayload, { timeout: 10000 }).not.toBeNull();
      const updated = updatedPayload as unknown as Partial<UpdateBotInput>;
      expect(updated?.description).toBe('Updated enterprise assistant with multi-language support.');
      expect(updated?.tone).toBe('professional');
      expect(updated?.logoUrl).toContain('mock-uploaded-logo.png');
    });
  });
});
