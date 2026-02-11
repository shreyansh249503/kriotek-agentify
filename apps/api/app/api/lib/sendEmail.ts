import nodemailer from "nodemailer";

export async function sendUserEmail({
  to,
  subject,
  body,
  html,
}: {
  to: string;
  subject: string;
  body: string;
  html?: string;
}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Support" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text: body,
    html: html || body,
  });
}

export async function sendOwnerNotification({
  ownerEmail,
  botName,
  leadData,
}: {
  ownerEmail: string;
  botName: string;
  leadData: {
    name: string;
    email: string;
    phone: string;
  };
}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const html = generateOwnerNotificationTemplate(botName, leadData);

  await transporter.sendMail({
    from: `"Agentify" <${process.env.GMAIL_USER}>`,
    to: ownerEmail,
    subject: `New Lead from ${botName} Chatbot`,
    html,
  });
}

function generateOwnerNotificationTemplate(
  botName: string,
  leadData: { name: string; email: string; phone: string },
) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 24px;
    }
    .content {
      padding: 30px 20px;
    }
    .lead-info {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .lead-info h2 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 18px;
    }
    .info-row {
      margin: 10px 0;
      display: flex;
      align-items: center;
    }
    .info-label {
      font-weight: 600;
      color: #555;
      min-width: 100px;
    }
    .info-value {
      color: #333;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .alert-badge {
      display: inline-block;
      background-color: #28a745;
      color: white;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 12px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 New Lead Captured!</h1>
    </div>
    
    <div class="content">
      <div class="alert-badge">NEW SUBMISSION</div>
      <p>You have received a new lead from your <strong>${botName}</strong> chatbot.</p>
      
      <div class="lead-info">
        <h2>Lead Information</h2>
        <div class="info-row">
          <span class="info-label">👤 Name:</span>
          <span class="info-value">${leadData.name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">📧 Email:</span>
          <span class="info-value"><a href="mailto:${leadData.email}">${leadData.email}</a></span>
        </div>
        <div class="info-row">
          <span class="info-label">📞 Phone:</span>
          <span class="info-value"><a href="tel:${leadData.phone}">${leadData.phone}</a></span>
        </div>
      </div>
      
      <p style="color: #666; font-size: 14px; margin-top: 20px;">
        💡 <strong>Tip:</strong> Respond quickly to increase your conversion rate!
      </p>
    </div>
    
    <div class="footer">
      <p>This notification was sent by Agentify</p>
      <p>Powered by AI Chatbot Platform</p>
    </div>
  </div>
</body>
</html>
  `;
}
