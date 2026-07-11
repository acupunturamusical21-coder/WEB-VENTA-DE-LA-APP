// ═══════════════════════════════════════════════════════════════════
// TRATADO_APP — servidor de cuentas
// Flujo: registro → se manda código al correo
// (atencion@acupunturamusical.com) → el usuario mete el código →
// cuenta activada → máximo 2 dispositivos. Acceso completo: pago
// único (ver PRICE abajo) que marca la cuenta como `unlocked` para
// siempre — sin planes, sin expiración, sin renovación.
// ═══════════════════════════════════════════════════════════════════
require('dotenv').config();
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const users = require('./userStore');
const { sendVerificationCode } = require('./mailer');
const { resolvePricing } = require('./geo-pricing');

const app = express();
const PORT = process.env.PORT || 3000;

// Render (y la mayoría de hostings) ponen la app detrás de un proxy —
// sin esto, req.ip/X-Forwarded-For traen la IP interna del proxy, no la
// del visitante real, y el geo-pricing detectaría siempre el mismo país.
app.set('trust proxy', true);

// ⚠️ Debe venir de una variable de entorno real en producción.
const JWT_SECRET = process.env.JWT_SECRET || 'CAMBIAR_ESTO_EN_PRODUCCION_essam_2026';

// ─────────────────────────────────────────────
// Precio de la versión completa — BASE (fallback si algo falla al
// resolver el país, y fuente de la descripción/label). El precio real
// que se muestra y se cobra sale de geo-pricing.js (resolvePricing),
// ajustado por país — ver /api/price, /api/paypal/create-order.
const PRICE = { amount: '99.00', currency: 'USD', label: 'Versión completa (pago único)' };

// Guarda, por orden de PayPal creada, el precio EXACTO que se le cotizó
// a esa persona (según su país en ese momento) — así, al capturar el
// pago, se valida contra lo que realmente se le ofreció, sin volver a
// adivinar el país (que podría cambiar entre create y capture si viaja
// de red). Vive solo en memoria: son órdenes de vida muy corta (minutos).
const pendingOrders = new Map();

app.use(express.json());
app.use(cookieParser());

// ⚠️ CRÍTICO: bloquear cualquier acceso directo a /server/... ANTES de
// exponer el resto como estático. Sin esto, alguien podría entrar a
// /server/data-protected/chapters.es.js y descargar el contenido premium
// completo sin pagar, sin pasar por la verificación de sesión.
app.use((req, res, next) => {
  if (req.path.startsWith('/server/') || req.path === '/server') {
    return res.status(403).send('Forbidden');
  }
  next();
});

app.use(express.static(path.join(__dirname, '..')));

// ─────────────────────────────────────────────
// Sesión
// ─────────────────────────────────────────────
function setSessionCookie(res, email, deviceId) {
  const token = jwt.sign({ email, deviceId }, JWT_SECRET, { expiresIn: '30d' });
  res.cookie('essam_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

function getSession(req) {
  const token = req.cookies.essam_session;
  if (!token) return null;
  try {
    const { email, deviceId } = jwt.verify(token, JWT_SECRET);
    const user = users.getByEmail(email);
    if (!user) return null;
    return { user, deviceId };
  } catch (e) {
    return null;
  }
}

function generateCode() {
  return String(crypto.randomInt(100000, 999999)); // código de 6 dígitos
}

// ─────────────────────────────────────────────
// PayPal — verificación REAL del pago único contra la API de PayPal.
// ─────────────────────────────────────────────
async function paypalAccessToken() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  const base = process.env.PAYPAL_API_BASE || 'https://api-m.paypal.com';
  const resp = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await resp.json();
  if (!data.access_token) throw new Error('No se pudo autenticar con PayPal: ' + JSON.stringify(data));
  return data.access_token;
}

// ─────────────────────────────────────────────
// 1. Registro — crea la cuenta y manda el código de verificación.
// ─────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password || password.length < 8) {
    return res.status(400).json({ error: 'Correo y contraseña (mínimo 8 caracteres) son requeridos' });
  }
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const code = generateCode();
    const expires = Date.now() + 15 * 60 * 1000;
    users.createPending(email, passwordHash, code, expires);
    await sendVerificationCode(email, code);
    res.json({ ok: true, next: 'verify' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Reenviar código (por si no llegó o expiró)
app.post('/api/auth/resend-code', async (req, res) => {
  const { email } = req.body || {};
  const user = users.getByEmail(email || '');
  if (!user) return res.status(404).json({ error: 'Cuenta no encontrada' });
  const code = generateCode();
  const expires = Date.now() + 15 * 60 * 1000;
  users.setNewVerificationCode(user.email, code, expires);
  await sendVerificationCode(user.email, code);
  res.json({ ok: true });
});

// ─────────────────────────────────────────────
// 3. Verificación del código → activa la cuenta
// ─────────────────────────────────────────────
app.post('/api/auth/verify', (req, res) => {
  const { email, code } = req.body || {};
  if (!email || !code) return res.status(400).json({ error: 'Faltan datos' });
  try {
    users.verifyAccount(email, code);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────
// 4. Login — requiere cuenta verificada y respeta el límite de 2 dispositivos
// ─────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const { email, password, deviceId, deviceLabel } = req.body || {};
  const user = users.getByEmail(email || '');
  if (!user) return res.status(401).json({ error: 'Correo o contraseña incorrectos' });

  const ok = await bcrypt.compare(password || '', user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Correo o contraseña incorrectos' });

  if (!user.verified) {
    return res.status(403).json({ error: 'Cuenta no verificada', next: 'verify' });
  }
  if (!deviceId) return res.status(400).json({ error: 'Falta el identificador de dispositivo' });

  const result = users.authorizeDevice(user.email, deviceId, deviceLabel);
  if (!result.ok && result.reason === 'device_limit') {
    return res.status(403).json({
      error: `Esta cuenta ya está activa en ${users.MAX_DEVICES} dispositivos. Cierra sesión en uno de ellos antes de entrar en uno nuevo.`,
      devices: result.devices,
    });
  }

  setSessionCookie(res, user.email, deviceId);
  res.json({ ok: true });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('essam_session');
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  const session = getSession(req);
  if (!session) return res.json({ loggedIn: false });
  res.json({
    loggedIn: true,
    email: session.user.email,
    verified: session.user.verified,
    premiumActive: users.isPremiumActive(session.user),
    unlockedAt: session.user.unlockedAt || null,
  });
});

// El cliente pide aquí el precio en vez de tenerlo escrito por su cuenta —
// así solo hay un lugar (geo-pricing.js) donde cambiarlo, y el navegador
// nunca decide el monto real a cobrar. Ajustado por país (ver geo-pricing.js);
// también va el Client ID de PayPal (es público por diseño — lo necesita
// el SDK del botón en el navegador; el secreto real, PAYPAL_SECRET, nunca
// sale del servidor).
app.get('/api/price', (req, res) => {
  const pricing = resolvePricing(req);
  res.json({ ...pricing, label: PRICE.label, clientId: process.env.PAYPAL_CLIENT_ID || '' });
});

// ─────────────────────────────────────────────
// Iteración 8 — crear la orden de pago único. El monto SIEMPRE sale de
// resolvePricing() (geo-pricing.js) según el país detectado de la IP;
// el cliente nunca lo manda, así que no hay forma de manipular el
// JavaScript del navegador para pagar menos o fingir otro país. Requiere
// sesión activa para saber a quién desbloquear después.
// ─────────────────────────────────────────────
app.post('/api/paypal/create-order', async (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'Debes iniciar sesión antes de comprar' });

  const pricing = resolvePricing(req);
  const amount = pricing.amount.toFixed ? pricing.amount.toFixed(2) : String(pricing.amount);

  try {
    const base = process.env.PAYPAL_API_BASE || 'https://api-m.paypal.com';
    const token = await paypalAccessToken();
    const orderResp = await fetch(`${base}/v2/checkout/orders`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: { currency_code: pricing.currency, value: amount },
          description: PRICE.label,
        }],
      }),
    });
    const orderData = await orderResp.json();
    if (!orderData.id) {
      console.error('[ESSAM] Error creando orden PayPal:', orderData);
      return res.status(500).json({ error: 'No se pudo crear la orden de pago' });
    }

    // Guardar el precio exacto cotizado a esta orden — capture-order lo
    // valida contra esto, no contra un PRICE global fijo.
    pendingOrders.set(orderData.id, {
      email: session.user.email,
      amount,
      currency: pricing.currency,
      createdAt: Date.now(),
    });

    res.json({ id: orderData.id });
  } catch (e) {
    console.error('Error PayPal (create-order):', e);
    res.status(500).json({ error: 'Error creando la orden con PayPal' });
  }
});

// ─────────────────────────────────────────────
// Captura del pago único — requiere sesión activa (nunca se confía en
// un email que mande el cliente en el body; el usuario a desbloquear
// es siempre el de la sesión). El servidor vuelve a preguntarle a
// PayPal cuánto se cobró realmente y lo compara contra PRICE antes de
// desbloquear nada — así, aunque alguien manipule el JavaScript del
// navegador para crear una orden con un monto menor, el servidor la
// rechaza.
// ─────────────────────────────────────────────
app.post('/api/paypal/capture-order', async (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'Debes iniciar sesión antes de comprar' });

  const { orderID } = req.body || {};
  if (!orderID) return res.status(400).json({ error: 'Falta orderID' });

  // La orden tiene que haberse creado con /api/paypal/create-order — ahí
  // es donde se guardó cuánto se le cotizó a esta persona según su país.
  const expected = pendingOrders.get(orderID);
  if (!expected || expected.email !== session.user.email) {
    return res.status(400).json({ error: 'Orden desconocida o no corresponde a esta cuenta' });
  }

  try {
    const base = process.env.PAYPAL_API_BASE || 'https://api-m.paypal.com';
    const token = await paypalAccessToken();
    const captureResp = await fetch(`${base}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const captureData = await captureResp.json();

    if (captureData.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'El pago no se completó', detail: captureData });
    }

    // ⚠️ CRÍTICO: revisar que lo que PayPal realmente cobró coincide
    // exactamente con lo cotizado en create-order (expected). Sin esto,
    // alguien podría manipular el JavaScript del navegador para crear una
    // orden con un monto menor y aun así recibir acceso completo.
    const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0];
    const paidAmount = capture?.amount?.value;
    const paidCurrency = capture?.amount?.currency_code;
    if (paidAmount !== expected.amount || paidCurrency !== expected.currency) {
      console.error(`[ESSAM] Monto no coincide para ${session.user.email}: pagó ${paidAmount} ${paidCurrency}, se esperaba ${expected.amount} ${expected.currency}`);
      return res.status(400).json({ error: 'El monto pagado no coincide con el precio cotizado' });
    }

    // Pago confirmado y monto verificado -> desbloquear para siempre.
    users.activateUnlock(session.user.email);
    pendingOrders.delete(orderID);
    res.json({ ok: true });
  } catch (e) {
    console.error('Error PayPal:', e);
    res.status(500).json({ error: 'Error verificando el pago con PayPal' });
  }
});

// Gestión de dispositivos: ver y quitar uno (para liberar espacio en el límite de 2)
app.get('/api/auth/devices', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'No autenticado' });
  res.json({ devices: session.user.devices, thisDevice: session.deviceId });
});

app.post('/api/auth/devices/remove', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'No autenticado' });
  const { deviceId } = req.body || {};
  const devices = users.removeDevice(session.user.email, deviceId);
  res.json({ ok: true, devices });
});

// ─────────────────────────────────────────────
// Contenido premium — solo con sesión válida, verificada, y dispositivo autorizado
// ─────────────────────────────────────────────
const PROTECTED_DIR = path.join(__dirname, 'data-protected');
const ALLOWED_PROTECTED_FILES = new Set([
  'chapters.es.js', 'chapters.en.js',
  'triadas.es.js', 'triadas.en.js',
  'hexagramas.es.js', 'hexagramas.en.js',
  'mtc-translation-i18n.js',
  // 'appendix-b.js' — YA NO está protegido: ahora vive en js/data/appendix-b.js
  // y se sirve como archivo normal. Es solo el ÍNDICE de qué tríadas/módulos
  // corresponden a cada patología (nombres, no el contenido clínico completo),
  // así que el Buscador puede funcionar gratis como "gancho" hacia el Premium.
]);

app.get('/api/data/:filename', (req, res) => {
  const { filename } = req.params;
  if (!ALLOWED_PROTECTED_FILES.has(filename)) return res.status(404).send('// not found');

  const session = getSession(req);
  const authorized = session && users.isPremiumActive(session.user) &&
    session.user.devices.some(d => d.id === session.deviceId);

  res.type('application/javascript');
  if (!authorized) {
    return res.status(402).send(
      `console.warn('[ESSAM] Contenido premium no disponible: ${filename}');`
    );
  }
  res.sendFile(path.join(PROTECTED_DIR, filename));
});

app.listen(PORT, () => {
  console.log(`ESSAM server corriendo en http://localhost:${PORT}`);
});
