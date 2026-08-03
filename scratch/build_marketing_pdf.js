const fs = require('fs');
const path = require('path');

function createMarketingPDF(outputPath) {
  // Simple PDF generator in pure Node.js
  const pdfContent = [];
  let objId = 1;
  const offsets = [];

  function addObj(str) {
    const id = objId++;
    offsets.push(pdfContent.join('').length);
    pdfContent.push(`${id} 0 obj\n${str}\nendobj\n`);
    return id;
  }

  // Header
  pdfContent.push("%PDF-1.4\n%\xC3\xA4\xC3\xBC\xC3\xB6\xC3\x9F\n");

  // Font Objects
  const fontHelvetica = addObj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const fontHelveticaBold = addObj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  // Content Stream for Page 1
  const streamPage1 = [
    "BT",
    "/F2 26 Tf",
    "0.38 0.40 0.94 rg", // Purple header color
    "50 750 Td",
    "(Agentify AI TM - Product Showcase) Tj",
    "ET",
    
    "BT",
    "/F1 12 Tf",
    "0.2 0.2 0.2 rg",
    "50 730 Td",
    "(Autonomous AI Sales, Support & Order Journey Suite for E-Commerce & Shopify) Tj",
    "ET",

    // Horizontal line
    "q 0.38 0.40 0.94 rg 50 715 500 2 re f Q",

    // Section 1: Agentify OmniMind
    "BT /F2 16 Tf 0.1 0.1 0.1 rg 50 680 Td (1. Agentify OmniMind TM - Multi-Agent AI Engine) Tj ET",
    "BT /F1 10 Tf 0.3 0.3 0.3 rg 50 660 Td (- Dual-Agent System: ConverseIQ TM (Receptionist) & LeadCapture Pro TM (Lead Generation)) Tj ET",
    "BT /F1 10 Tf 0.3 0.3 0.3 rg 50 645 Td (- PersonaFlex TM: Instant switching between Warm & Conversational or Corporate Professional) Tj ET",
    "BT /F1 10 Tf 0.3 0.3 0.3 rg 50 630 Td (- RAG Vector Vault TM: 768-dim pgvector embeddings from web crawling & PDF document parsing) Tj ET",

    // Section 2: Shopify Pulse
    "BT /F2 16 Tf 0.1 0.1 0.1 rg 50 590 Td (2. Shopify Pulse TM - E-Commerce & Order Tracking) Tj ET",
    "BT /F1 10 Tf 0.3 0.3 0.3 rg 50 570 Td (- OrderJourney 360 TM: Real-time Shopify order lookup using Order # + Email/Phone verification) Tj ET",
    "BT /F1 10 Tf 0.3 0.3 0.3 rg 50 555 Td (- CatalogSync Engine TM: Automated real-time product inventory sync via Shopify GraphQL API) Tj ET",
    "BT /F1 10 Tf 0.3 0.3 0.3 rg 50 540 Td (- Storefront App Block: Native Liquid theme extension integration for Shopify stores) Tj ET",

    // Section 3: LeadFlow 360
    "BT /F2 16 Tf 0.1 0.1 0.1 rg 50 500 Td (3. LeadFlow 360 TM - Prospect Conversion & Pipeline) Tj ET",
    "BT /F1 10 Tf 0.3 0.3 0.3 rg 50 480 Td (- Real-Time Merchant Alerts: Instant Nodemailer email alerts on high-intent lead capture) Tj ET",
    "BT /F1 10 Tf 0.3 0.3 0.3 rg 50 465 Td (- Automated Customer Confirmation: Instant branded confirmation emails delivered to prospects) Tj ET",
    "BT /F1 10 Tf 0.3 0.3 0.3 rg 50 450 Td (- Lead Command Center: Dedicated admin dashboard (/admin/shopify/leads) to track prospects) Tj ET",

    // Section 4: Agentify Insights
    "BT /F2 16 Tf 0.1 0.1 0.1 rg 50 410 Td (4. Agentify Insights TM - Real-Time Performance Analytics) Tj ET",
    "BT /F1 10 Tf 0.3 0.3 0.3 rg 50 390 Td (- Executive KPI Dashboard: Live tracking of chat volumes, lead conversion rates & sync status) Tj ET",
    "BT /F1 10 Tf 0.3 0.3 0.3 rg 50 375 Td (- Visual Growth Analytics: Recharts interactive trend analytics charting monthly growth) Tj ET",

    // Section 5: Widget Studio Pro
    "BT /F2 16 Tf 0.1 0.1 0.1 rg 50 335 Td (5. Widget Studio Pro TM - Custom Branded Storefront Widget) Tj ET",
    "BT /F1 10 Tf 0.3 0.3 0.3 rg 50 315 Td (- Shadow DOM Isolation: Zero CSS conflicts with existing theme styles) Tj ET",
    "BT /F1 10 Tf 0.3 0.3 0.3 rg 50 300 Td (- Custom Brand Theme Engine: Brand color selection, custom logo upload & welcome prompts) Tj ET",
    "BT /F1 10 Tf 0.3 0.3 0.3 rg 50 285 Td (- Universal Integration: Single script tag deployment for Shopify, WooCommerce, or custom web) Tj ET",

    // Section 6: Human-in-the-Loop Handoff
    "BT /F2 16 Tf 0.1 0.1 0.1 rg 50 245 Td (6. Human-in-the-Loop Handoff TM - Hybrid Support Engine) Tj ET",
    "BT /F1 10 Tf 0.3 0.3 0.3 rg 50 225 Td (- One-Touch Mode Switch: Seamless transition from AI automation to live human agent support) Tj ET",
    "BT /F1 10 Tf 0.3 0.3 0.3 rg 50 210 Td (- Preserved Context: Full chat conversation history preserved for human support team) Tj ET",

    // Footer
    "q 0.8 0.8 0.8 rg 50 100 500 1 re f Q",
    "BT /F1 9 Tf 0.5 0.5 0.5 rg 180 80 Td (Agentify AI TM Product Showcase - Confidential & Proprietary) Tj ET"
  ].join("\n");

  const streamPage1Obj = addObj(`<< /Length ${streamPage1.length} >>\nstream\n${streamPage1}\nendstream`);

  // Page Object
  const page1Obj = addObj(`<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 ${fontHelvetica} 0 R /F2 ${fontHelveticaBold} 0 R >> >> /MediaBox [0 0 595 842] /Contents ${streamPage1Obj} 0 R >>`);

  // Pages Object
  const pagesObj = `2 0 obj\n<< /Type /Pages /Count 1 /Kids [${page1Obj} 0 R] >>\nendobj\n`;
  
  // Insert Pages Object at index 1 offset
  pdfContent.splice(1, 0, pagesObj);

  // Catalog Object
  const catalogObj = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  pdfContent.splice(1, 0, catalogObj);

  // Re-calculate offsets
  const finalPdf = pdfContent.join('');
  fs.writeFileSync(outputPath, finalPdf, 'binary');
  console.log(`PDF successfully created at: ${outputPath}`);
}

const targetPath = path.join(__dirname, '..', 'Agentify_Product_Showcase.pdf');
createMarketingPDF(targetPath);
