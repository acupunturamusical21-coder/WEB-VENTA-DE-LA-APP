# Servidor de cuentas — ESSAM

## Flujo (probado de extremo a extremo, ver abajo)
1. **Registro**: correo + contraseña → cuenta creada, pendiente de pago.
2. **Pago real en PayPal** (Smart Buttons en el navegador). El servidor verifica ese pago directamente contra la API de PayPal (nunca confía en lo que diga el navegador).
3. Al confirmarse el pago, se genera un código de 6 dígitos y se manda por correo desde **atencion@acupunturamusical.com**.
4. El usuario mete el código → cuenta activada.
5. **Login**: cada dispositivo/navegador nuevo que entra se registra automáticamente (hasta 2). Un 3er dispositivo distinto es rechazado con un mensaje claro. Desde "Mi cuenta" se puede ver y quitar dispositivos para liberar espacio.
6. El contenido del Tratado (`server/data-protected/`) solo se sirve si la sesión es válida, la cuenta está verificada, y el dispositivo está autorizado.

## Qué se probó ya (con datos de prueba, sin tocar PayPal real)
- Registro ✅
- Login bloqueado antes de verificar ✅
- Código incorrecto rechazado, código correcto activa la cuenta ✅
- Dispositivo A entra ✅, dispositivo B entra ✅ (van 2), dispositivo C **rechazado** ✅
- Dispositivo ya autorizado (A) puede volver a entrar sin problema ✅
- Listado de dispositivos con sus nombres ✅

**Lo único que no se pudo probar aquí** es la llamada real a la API de PayPal (este entorno no tiene salida de red hacia paypal.com) — pero el código sigue el patrón estándar de PayPal (crear orden en el frontend → capturar y verificar en el backend), y usa tus credenciales Live vía variables de entorno, nunca hardcodeadas.

## Cómo correrlo
```bash
cd server
npm install
cp .env.example .env
```
Edita `.env` y llena:
- `JWT_SECRET`: cualquier cadena larga y aleatoria
- `PAYPAL_CLIENT_ID` / `PAYPAL_SECRET`: los que ya me diste (Live) — desde Apps & Credentials en developer.paypal.com
- `PAYPAL_API_BASE`: déjalo en `https://api-m.paypal.com` (ya es Live)
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`: credenciales de correo de atencion@acupunturamusical.com (si no las llenas, el código se imprime en la consola del servidor en vez de mandarse — útil para seguir probando sin correo real)

```bash
node server.js
```
Abre `http://localhost:3000` (ya no `index.html` directo con doble clic — necesita el servidor corriendo).

## Seguridad
- `.env` está en `.gitignore` — nunca se sube a ningún lado. Las credenciales de PayPal viven SOLO ahí.
- El Client ID de PayPal SÍ está embebido en `index.html` (línea del SDK) — eso es correcto y seguro, el Client ID es público por diseño; lo que nunca debe exponerse es el Secret, y ese vive solo en `.env` en el servidor.
- `users.json` (la base de usuarios) también está en `.gitignore`.
- Los 8 archivos con el contenido real del Tratado viven en `server/data-protected/`, fuera de cualquier carpeta pública — nunca los subas a un hosting estático.

## Configurar el correo con atencion@acupunturamusical.com
Depende de dónde esté alojado ese correo:
- **Google Workspace**: `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`. La contraseña (`SMTP_PASS`) debe ser una "contraseña de aplicación" (se genera en la configuración de seguridad de la cuenta de Google), no la contraseña normal del correo.
- **Otro proveedor** (cPanel, Zoho, etc.): te dan un host/puerto SMTP específico en su panel de correo — dime cuál usas y ajusto los valores.
