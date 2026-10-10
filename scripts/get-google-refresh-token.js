/**
 * Script de un solo uso para obtener el "refresh token" de Google Calendar.
 * Ejecutar con: npm run get-refresh-token
 */
require('dotenv').config();
const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Faltan GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET en el archivo .env');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline', // necesario para que Google regrese un refresh_token
  prompt: 'consent',      // fuerza a que SIEMPRE regrese un refresh_token (si no, solo lo da la primera vez)
  scope: ['https://www.googleapis.com/auth/calendar.events'],
});

console.log('\n==============================================================');
console.log('1) Abre esta URL en tu navegador (con la cuenta de Google que');
console.log('   quieres usar para el calendario) e inicia sesión:\n');
console.log(authUrl);
console.log('\n2) Da clic en "Permitir" / "Allow".');
console.log('3) El navegador intentará ir a http://localhost?code=XXXXX');
console.log('   y probablemente te muestre un error de "no se puede');
console.log('   acceder a este sitio" — eso es normal y esperado.');
console.log('4) Copia SOLO el valor que aparece después de "code=" en la');
console.log('   barra de direcciones (y antes de cualquier "&" si hay más texto),');
console.log('   y pégalo abajo.');
console.log('==============================================================\n');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Pega aquí el código: ', async (code) => {
  rl.close();
  try {
    const { tokens } = await oauth2Client.getToken(code.trim());
    console.log('\n¡Listo! Estos son tus tokens:\n');
    console.log(tokens);
    console.log('\n>>> Copia el valor de "refresh_token" y pégalo en tu .env como:');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
  } catch (err) {
    console.error('\nError al obtener el token:', err.message);
  }
});
