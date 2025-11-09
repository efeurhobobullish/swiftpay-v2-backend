export const register = (name, email, code) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Welcome to Questpay</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #f7f8fa;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .container {
          width: min(600px, 90%);
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .header {
          background: #6951f2;
          text-align: center;
          padding: 30px;
        }
        .header img {
          height: 40px;
        }
        .content {
          padding: 40px 30px;
          color: #1e293b;
        }
        .content h2 {
          margin-top: 0;
          color: #444;
          font-size: 20px;
        }
        .content p {
          line-height: 1.6;
          font-size: 16px;
          color: #475569;
        }
        .cta {
          text-align: center;
          margin: 30px 0;
        }
        .cta a {
          background-color: #6951f2;
          color: #ffffff;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 10px;
          font-weight: bold;
          display: inline-block;
          font-size: 14px;
        }
        .footer {
          text-align: center;
          background-color: #f1f5f9;
          padding: 20px;
          font-size: 13px;
          color: #64748b;
        }
        .username {
          font-weight: bold;
          color: #1e293b;
        }
       .code{
          font-size: 2em;
          }
      </style>
    </head>
    <body>
  
      <div class="container">
        <!-- Header with Logo -->
        <div class="header">
          <img src="https://i.ibb.co/pjkSwKQK/full-logo-white.png" height="200" width="200" alt="Questpay Logo" />
        </div>
  
        <!-- Body Content -->
        <div class="content">
          <h2>Welcome, ${name}!</h2>
  
          <p>Thanks for joining <strong>Questpay</strong> — a reliable way to manage your bills with ease.</p>
  
          <p>Questpay is a VTU platform that helps you handle payments for electricity, cable subscriptions, airtime, and data — all at discounted rates.</p>
          <p>Verify your email to continue.</p>
          <p>Your one-time code (OTP) is: <strong class="code">${code}</strong></p>
          <p>Please use this code on the verification page to confirm your registration.</p>
  
          <div class="cta">
            <a href="https://questpay.ng/verify?email=${email}">Verify Your Email</a>
          </div>
  
          <p>If you didn’t create this account, you can safely ignore this message or <a href="mailto:support@questpay.ng">contact our support team</a>.</p>
        </div>
  
        <!-- Footer -->
        <div class="footer">
          &copy; 2025 Questpay. All rights reserved. <br />
          <a href="https://questpay.ng" style="color:#6951f2; font-weight: bold; text-decoration: none;">questpay.ng</a>
        </div>
      </div>
  
    </body>
    </html>
    `;
  };
  