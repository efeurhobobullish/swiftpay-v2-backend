export const data = (name, planName, balance, phoneNumber) => {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Questpay Data</title>
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
      background: linear-gradient(to right, #6951f2, #ff69b4);
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
      line-height: 1.2;
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
    strong {
      color: #6951f2;
      font-size: 16px;
    }
  </style>
</head>
<body>

  <div class="container">
    <!-- Header with Logo -->
    <div class="header">
      <img src="https://i.ibb.co/pjkSwKQK/full-logo-white.png" height="200" width="200" alt="Premium Trades Affiliates Logo" />
    </div>

    <!-- Body Content -->
    <div class="content">
      <h2>Data Purchase Alert! 🚀</h2>
      <p>Hi <span class="username">${name}</span>,</p>

      <p>You have successfully purchased data plan <strong>${planName}</strong> for <strong>${phoneNumber}</strong>.</p>
      <p>Your new wallet balance is <strong>NGN${balance}</strong>.</p>
      <p>You can view the transaction details by clicking the button below.</p>
      <div class="cta">
        <a href="https://questpay.ng/transactions">View Transaction</a>
      </div>

      <p>If this wasn’t you, please ignore this email or contact us immediately for assistance.</p>
    </div>

    <!-- Footer -->
    <div class="footer">
      &copy; 2025 Questpay. All rights reserved. <br />
      <a href="https://questpay.ng" style="color:#6951f2; font-weight: bold; text-decoration: none;">questpay.ng</a>
    </div>
  </div>

</body>
</html>

    `
}