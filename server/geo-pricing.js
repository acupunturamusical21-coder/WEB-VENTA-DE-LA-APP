/**
 * geo-pricing.js
 * -----------------------------------------------------------------------
 * Detección de país por IP + precio ajustado por poder adquisitivo.
 *
 * REGLA DURA (pedida explícitamente): el precio final SIEMPRE debe estar
 * en una moneda que PayPal acepte para pagos (ver PAYPAL_SUPPORTED_CURRENCIES,
 * lista oficial: https://developer.paypal.com/api/nvp-soap/currency-codes/).
 * Si el país cae en un tier/override cuya moneda local NO está en esa
 * lista (ej. Uruguay/UYU, Colombia/COP, Perú/PEN, Paraguay/PYG — ninguna
 * la acepta PayPal), no se inventa nada: se cae automáticamente al precio
 * en USD de su mismo tier. "Ni modo" — así queda, en dólares.
 *
 * Requiere: npm install geoip-lite
 * (geoip-lite es una base de datos offline, sin llamadas a servicios de
 *  pago ni rate limit.)
 * -----------------------------------------------------------------------
 */

const geoip = require('geoip-lite');

// =========================================================================
// 0. MONEDAS QUE PAYPAL ACEPTA PARA PAGOS (lista oficial completa, 2026)
// =========================================================================
const PAYPAL_SUPPORTED_CURRENCIES = new Set([
  'AUD', 'BRL', 'CAD', 'CNY', 'CZK', 'DKK', 'EUR', 'HKD', 'HUF', 'ILS',
  'JPY', 'MYR', 'MXN', 'NOK', 'NZD', 'PHP', 'PLN', 'GBP', 'RUB', 'SGD',
  'SEK', 'CHF', 'TWD', 'THB', 'USD',
]);

// =========================================================================
// 1. MAPA PAÍS -> TIER
// =========================================================================
const COUNTRY_TIER_MAP = {
  // --- Tier A: alto poder adquisitivo ---
  US: 'A',
  DE: 'A', FR: 'A', NL: 'A', AT: 'A', BE: 'A', IE: 'A',
  AU: 'A',
  NZ: 'A',
  JP: 'A',

  // --- Tier B: similar a México ---
  MX: 'B',
  ES: 'B', IT: 'B', PT: 'B',
  BR: 'B',
  UY: 'B', // OJO: UYU no es moneda soportada por PayPal -> cae a USD (ver getPriceForCountry)
  CR: 'B', PA: 'B',

  // --- Tier C: medio-bajo ---
  CO: 'C', // COP no soportada por PayPal -> cae a USD
  PE: 'C', // PEN no soportada por PayPal -> cae a USD
  EC: 'C',
  BO: 'C',
  PY: 'C', // PYG no soportada por PayPal -> cae a USD
  GT: 'C', HN: 'C', SV: 'C', NI: 'C',
  VE: 'C',

  // --- Tier D: EU de menor ingreso relativo ---
  GR: 'D',
  EE: 'D',
  LT: 'D',
};

const DEFAULT_TIER = 'C'; // fallback conservador si no detectamos el país

// =========================================================================
// 2. CONFIGURACIÓN DE PRECIO POR TIER
// =========================================================================
// mode: 'local' -> se muestra y cobra en moneda local
//       'usd'   -> se cobra directo en USD
// usdFallback: precio en USD para este tier si el país cae en una moneda
// que PayPal no acepta (ver PAYPAL_SUPPORTED_CURRENCIES arriba).
const TIER_PRICING = {
  A: { amount: 99, currency: 'USD', mode: 'usd', usdFallback: 99 },
  B: { amount: 1999, currency: 'MXN', mode: 'local', usdFallback: 89 },
  C: { amount: 65, currency: 'USD', mode: 'usd', usdFallback: 65 },
  D: { amount: 75, currency: 'EUR', mode: 'local', usdFallback: 75 },
};

// Overrides específicos por país (moneda local distinta al default del tier).
// Solo países cuya moneda SÍ acepta PayPal llevan moneda local aquí; los
// que no (Uruguay, Colombia, Perú, Paraguay) simplemente no tienen entrada
// y caen al fallback en USD del paso 4 (getPriceForCountry).
const COUNTRY_PRICE_OVERRIDES = {
  DE: { amount: 99, currency: 'EUR', mode: 'local' },
  FR: { amount: 99, currency: 'EUR', mode: 'local' },
  NL: { amount: 99, currency: 'EUR', mode: 'local' },
  AT: { amount: 99, currency: 'EUR', mode: 'local' },
  BE: { amount: 99, currency: 'EUR', mode: 'local' },
  IE: { amount: 99, currency: 'EUR', mode: 'local' },
  AU: { amount: 149, currency: 'AUD', mode: 'local' },
  NZ: { amount: 159, currency: 'NZD', mode: 'local' },
  JP: { amount: 14800, currency: 'JPY', mode: 'local' },

  ES: { amount: 89, currency: 'EUR', mode: 'local' },
  IT: { amount: 89, currency: 'EUR', mode: 'local' },
  PT: { amount: 89, currency: 'EUR', mode: 'local' },
  BR: { amount: 499, currency: 'BRL', mode: 'local' },
  CR: { amount: 85, currency: 'USD', mode: 'usd' },
  PA: { amount: 85, currency: 'USD', mode: 'usd' }, // dolarizado

  GR: { amount: 69, currency: 'EUR', mode: 'local' },

  // Uruguay: UYU no está en PAYPAL_SUPPORTED_CURRENCIES. Sin este override
  // explícito, al no tener entrada propia heredaría el default del tier B
  // (MXN) — que SÍ acepta PayPal, pero no tiene sentido cotizarle a
  // alguien en Uruguay en pesos mexicanos. Se fuerza a USD a propósito.
  UY: { amount: 89, currency: 'USD', mode: 'usd' },

  // --- Excepciones dolarizadas / monedas inestables: SIEMPRE en USD ---
  EC: { amount: 65, currency: 'USD', mode: 'usd' }, // dolarizado
  SV: { amount: 60, currency: 'USD', mode: 'usd' }, // dolarizado
  BO: { amount: 65, currency: 'USD', mode: 'usd' }, // inestable
  VE: { amount: 55, currency: 'USD', mode: 'usd' }, // inestable
  AR: { amount: 65, currency: 'USD', mode: 'usd' }, // inestable

  // CO, PE, PY: sin entrada a propósito — su moneda local (COP, PEN,
  // PYG) no está en PAYPAL_SUPPORTED_CURRENCIES, así que caen solas al
  // fallback en USD del tier (ver getPriceForCountry). Uruguay sí tiene
  // entrada propia arriba porque su tier (B) por default cae en MXN,
  // que sí acepta PayPal pero no tiene sentido para ese país.
};

// =========================================================================
// 3. DETECCIÓN DE PAÍS
// =========================================================================
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || req.ip;
}

function detectCountry(req) {
  // 1) Si el CDN/proxy ya nos dio el país, úsalo directo.
  const cdnCountry = req.headers['cf-ipcountry'] || req.headers['x-vercel-ip-country'];
  if (cdnCountry && cdnCountry !== 'XX') return cdnCountry.toUpperCase();

  // 2) Fallback: resolver con geoip-lite
  const ip = getClientIp(req);
  if (!ip) return null;

  const geo = geoip.lookup(ip);
  return geo?.country || null;
}

// =========================================================================
// 4. RESOLUCIÓN DE PRECIO
// =========================================================================
function getPriceForCountry(countryCode) {
  const tier = (countryCode && COUNTRY_TIER_MAP[countryCode]) || DEFAULT_TIER;
  const tierDefault = TIER_PRICING[tier];

  let result;
  if (countryCode && COUNTRY_PRICE_OVERRIDES[countryCode]) {
    result = { country: countryCode, tier, ...COUNTRY_PRICE_OVERRIDES[countryCode] };
  } else {
    result = { country: countryCode || 'UNKNOWN', tier, amount: tierDefault.amount, currency: tierDefault.currency, mode: tierDefault.mode };
  }

  // ── REGLA DURA: si la moneda resuelta no la acepta PayPal, cae a USD ──
  if (!PAYPAL_SUPPORTED_CURRENCIES.has(result.currency)) {
    return {
      country: result.country,
      tier,
      amount: tierDefault.usdFallback,
      currency: 'USD',
      mode: 'usd',
      note: 'moneda local no soportada por PayPal — precio en USD',
    };
  }

  return result;
}

function resolvePricing(req) {
  const country = detectCountry(req);
  return getPriceForCountry(country);
}

module.exports = {
  PAYPAL_SUPPORTED_CURRENCIES,
  detectCountry,
  getPriceForCountry,
  resolvePricing,
  COUNTRY_TIER_MAP,
  TIER_PRICING,
  COUNTRY_PRICE_OVERRIDES,
};
