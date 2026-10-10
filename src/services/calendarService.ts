import { google } from 'googleapis';
import dotenv from 'dotenv';
import { AppointmentRecord, PrefTime } from '../types';

dotenv.config();

const PREF_TIME_LABELS: Record<PrefTime, string> = {
  manana: 'Mañana',
  tarde: 'Tarde',
  noche: 'Noche',
};

// Hora de inicio aproximada de cada bloque (la clinica confirma la hora exacta por telefono)
const PREF_TIME_START_HOUR: Record<PrefTime, number> = {
  manana: 10,
  tarde: 13,
  noche: 17,
};

function getOAuthClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
  return oauth2Client;
}

/**
 * Crea un evento en el Google Calendar configurado y regresa el link del evento creado.
 */
export async function createCalendarEvent(appointment: AppointmentRecord): Promise<string | null> {
  const auth = getOAuthClient();
  const calendar = google.calendar({ version: 'v3', auth });

  const [year, month, day] = appointment.prefDate.split('-').map(Number);
  const startHour = PREF_TIME_START_HOUR[appointment.prefTime];

  // Formato ISO local (sin conversion UTC), con zona horaria explicita.
  const pad = (n: number) => String(n).padStart(2, '0');
  const startDateTime = `${year}-${pad(month)}-${pad(day)}T${pad(startHour)}:00:00`;
  const endDateTime = `${year}-${pad(month)}-${pad(day)}T${pad(startHour + 1)}:00:00`;

  const event = {
    summary: `Cita veterinaria (por confirmar) - ${appointment.ownerName}`,
    description:
      `Solicitud de cita recibida desde el sitio web.\n` +
      `Dueño/a: ${appointment.ownerName}\n` +
      `Teléfono: ${appointment.ownerPhone}\n` +
      `Mascota: ${appointment.petInfo}\n` +
      `Servicio: ${appointment.serviceType}\n` +
      `Horario preferido: ${PREF_TIME_LABELS[appointment.prefTime]}\n\n` +
      `Hora tentativa. Confirmar con el cliente antes de agendar en definitiva.`,
    location: 'C. Cipriano Campos Alatorre 1208, Jardines del Nilo, 44860 Guadalajara, Jal.',
    start: {
      dateTime: startDateTime,
      timeZone: 'America/Mexico_City',
    },
    end: {
      dateTime: endDateTime,
      timeZone: 'America/Mexico_City',
    },
    status: 'tentative',
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  });

  return response.data.htmlLink || null;
}
