// Almacén de usuarios — JSON simple.
// Estructura por usuario:
// {
//   email, passwordHash,
//   verified: bool,
//   verificationCode, verificationExpires,   // para activar la cuenta
//   unlocked: bool,           // true = compró la versión completa (pago único, no vence)
//   unlockedAt: string|null,  // ISO date de cuándo se desbloqueó, o null
//   devices: [ { id, label, firstSeen, lastSeen } ]  // máximo 2
// }
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'users.json');
const MAX_DEVICES = 2;

function loadAll() {
  if (!fs.existsSync(DB_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch (e) {
    console.error('users.json corrupto, iniciando vacío:', e.message);
    return {};
  }
}

function saveAll(users) {
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
}

function getByEmail(email) {
  const users = loadAll();
  return users[email.toLowerCase()] || null;
}

function createPending(email, passwordHash, verificationCode, verificationExpires) {
  const users = loadAll();
  const key = email.toLowerCase();
  if (users[key]) throw new Error('Ese correo ya está registrado');
  users[key] = {
    email: key,
    passwordHash,
    verified: false,
    verificationCode,
    verificationExpires,
    unlocked: false,
    unlockedAt: null,
    devices: [],
    createdAt: new Date().toISOString(),
  };
  saveAll(users);
  return users[key];
}

function setNewVerificationCode(email, code, expires) {
  const users = loadAll();
  const key = email.toLowerCase();
  if (!users[key]) throw new Error('Usuario no encontrado');
  users[key].verificationCode = code;
  users[key].verificationExpires = expires;
  saveAll(users);
  return users[key];
}

function verifyAccount(email, code) {
  const users = loadAll();
  const key = email.toLowerCase();
  const user = users[key];
  if (!user) throw new Error('Usuario no encontrado');
  if (user.verified) return user; // ya estaba activada
  if (!user.verificationCode || user.verificationCode !== code) {
    throw new Error('Código incorrecto');
  }
  if (Date.now() > user.verificationExpires) {
    throw new Error('El código expiró, pide uno nuevo');
  }
  user.verified = true;
  user.verificationCode = null;
  user.verificationExpires = null;
  saveAll(users);
  return user;
}

// Intenta autorizar un dispositivo para este usuario.
// Devuelve { ok: true } si el dispositivo ya estaba autorizado o se pudo
// agregar (quedan < MAX_DEVICES). Devuelve { ok: false, reason } si ya
// se alcanzó el límite y este es un dispositivo nuevo.
function authorizeDevice(email, deviceId, label) {
  const users = loadAll();
  const key = email.toLowerCase();
  const user = users[key];
  if (!user) throw new Error('Usuario no encontrado');

  const existing = user.devices.find(d => d.id === deviceId);
  if (existing) {
    existing.lastSeen = new Date().toISOString();
    saveAll(users);
    return { ok: true, devices: user.devices };
  }

  if (user.devices.length >= MAX_DEVICES) {
    return { ok: false, reason: 'device_limit', devices: user.devices };
  }

  user.devices.push({
    id: deviceId,
    label: label || 'Dispositivo sin nombre',
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
  });
  saveAll(users);
  return { ok: true, devices: user.devices };
}

function removeDevice(email, deviceId) {
  const users = loadAll();
  const key = email.toLowerCase();
  const user = users[key];
  if (!user) throw new Error('Usuario no encontrado');
  user.devices = user.devices.filter(d => d.id !== deviceId);
  saveAll(users);
  return user.devices;
}

// Se llama justo después de que PayPal confirma el pago único (ver
// iteración 3, endpoint de captura). Marca la cuenta como desbloqueada
// para siempre — no hay duración ni expiración que revisar.
function activateUnlock(email) {
  const users = loadAll();
  const key = email.toLowerCase();
  const user = users[key];
  if (!user) throw new Error('Usuario no encontrado');
  user.unlocked = true;
  user.unlockedAt = new Date().toISOString();
  saveAll(users);
  return user;
}

// ¿Esta cuenta tiene acceso a la versión completa? Pago único: basta con
// que `unlocked` sea true, no hay fecha que revisar ni renovación.
function isPremiumActive(user) {
  return !!(user && user.verified && user.unlocked);
}

module.exports = {
  MAX_DEVICES,
  getByEmail,
  createPending,
  setNewVerificationCode,
  verifyAccount,
  authorizeDevice,
  removeDevice,
  activateUnlock,
  isPremiumActive,
};
