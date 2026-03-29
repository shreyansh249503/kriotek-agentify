export function generateUserConfirmationTemplate({
  userName,
  companyName,
  companyDescription,
  customMessage,
  userEmail,
  userPhone,
}: {
  userName: string;
  companyName: string;
  companyDescription: string;
  customMessage?: string;
  userEmail: string;
  userPhone: string;
}) {
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
      line-height: 1.6;
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
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 28px;
    }
    .header p {
      margin: 10px 0 0 0;
      color: #ffffff;
      opacity: 0.9;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 18px;
      color: #333;
      margin-bottom: 20px;
    }
    .message-box {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-section {
      background-color: #fff8e1;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
      border: 1px solid #ffd54f;
    }
    .info-section h3 {
      margin: 0 0 10px 0;
      color: #f57c00;
      font-size: 16px;
    }
    .contact-details {
      margin: 10px 0;
    }
    .contact-row {
      margin: 8px 0;
      color: #555;
    }
    .contact-row strong {
      color: #333;
    }
    .checkmark {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: #28a745;
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30px;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #e0e0e0;
    }
    .footer p {
      margin: 5px 0;
    }
    .btn {
      display: inline-block;
      padding: 12px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <div class="greeting">
        Hello ${userName},
      </div>
      
      <p>
        Thank you for reaching out to <strong>${companyName}</strong>! 
        We're excited to connect with you.
      </p>
      
      ${customMessage ? `<div class="message-box">${customMessage}</div>` : ""}
      
      <p>
        Our team will review your inquiry and get back to you as soon as possible, 
        typically within <strong>24 hours</strong>.
      </p>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        If you have any urgent questions, feel free to reply to this email.
      </p>
    </div>
    
    <div class="footer">
      <p><strong>${companyName}</strong></p>
      <p>${companyDescription}</p>
      <p style="margin-top: 15px; opacity: 0.7;">
        This is an automated message from our AI chatbot assistant
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
