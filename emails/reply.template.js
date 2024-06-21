const ReplyTemplate = (name, message) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #fff;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #4CAF50;
      color: white;
      padding: 10px 0;
      text-align: center;
    }
    .content {
      margin: 20px 0;
    }
    .footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Merci de m'avoir contactée, ${name}!</h1>
    </div>
    <div class="content">
      <p>Bonjour ${name},</p>
      <p>Merci pour votre message. J'ai bien reçu votre demande et j'y répondrai dans les plus brefs délais.</p>
      <p>Voici une copie de votre message:</p>
      <blockquote>${message}</blockquote>
    </div>
    <div class="footer">
      <p>Cordialement,</p>
      <p>Hanh NGUYEN, Dev Web</p>
    </div>
  </div>
</body>
</html>
`;

module.exports = ReplyTemplate;
