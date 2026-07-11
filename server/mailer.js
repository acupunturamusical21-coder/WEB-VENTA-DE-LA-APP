// Envío de correos — código de verificación desde atencion@acupunturamusical.com
//
// Necesita variables de entorno con las credenciales SMTP reales de esa cuenta:
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
// (Si usan Gmail/Google Workspace para atencion@acupunturamusical.com: SMTP_HOST=smtp.gmail.com,
//  SMTP_PORT=465, y SMTP_PASS debe ser una "contraseña de aplicación", no la contraseña normal.)
//
// Mientras esas variables no estén configuradas, los correos se imprimen en
// la consola del servidor en vez de enviarse de verdad — así se puede probar
// todo el flujo sin credenciales reales.
const nodemailer = require('nodemailer');

const FROM_ADDRESS = 'atencion@acupunturamusical.com';

function buildTransport() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendVerificationCode(toEmail, code) {
  const transport = buildTransport();
  const subject = 'Tu código de verificación — ESSAM / Acupuntura Musical';
  const text = `Tu código de verificación es: ${code}\n\nEste código expira en 15 minutos.\n\nSi tú no pediste esto, ignora este correo.`;
  const html = `
    <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;">
      <h2 style="color:#5C21B6;">ESSAM — Verifica tu cuenta</h2>
      <p>Tu código de verificación es:</p>
      <p style="font-size:2rem;font-weight:bold;letter-spacing:0.2em;color:#5C21B6;">${code}</p>
      <p>Este código expira en 15 minutos.</p>
      <p style="color:#888;font-size:0.85rem;">Si tú no pediste esto, ignora este correo.</p>
    </div>`;

  if (!transport) {
    console.log(`\n[MAILER] SMTP no configurado — mostrando el correo en consola en vez de enviarlo:`);
    console.log(`  Para: ${toEmail}`);
    console.log(`  Asunto: ${subject}`);
    console.log(`  Código: ${code}\n`);
    return { simulated: true };
  }

  return transport.sendMail({
    from: `"ESSAM - Acupuntura Musical" <${FROM_ADDRESS}>`,
    to: toEmail,
    subject,
    text,
    html,
  });
}

module.exports = { sendVerificationCode };
