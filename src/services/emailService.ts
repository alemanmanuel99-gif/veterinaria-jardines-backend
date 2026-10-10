import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { AppointmentRecord, PrefTime } from '../types';

dotenv.config();

const PREF_TIME_LABELS: Record<PrefTime, string> = {
  manana: 'Mañana',
  tarde: 'Tarde',
  noche: 'Noche',
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Envia un correo simple de notificacion. El evento de calendario ya se crea
 * aparte con calendarService.ts (Google Calendar API), asi que aqui solo
 * avisamos por correo y, si se pudo crear, incluimos el link al evento.
 */
export async function sendAppointmentNotification(
  appointment: AppointmentRecord,
  calendarEventLink?: string | null
): Promise<void> {
  const calendarLine = calendarEventLink
    ? `\nYa se agregó automáticamente a tu Google Calendar: ${calendarEventLink}\n`
    : '';

  await transporter.sendMail({
    from: `"Sitio Web Veterinaria Jardines" <${process.env.SMTP_USER}>`,
    to: process.env.NOTIFICATION_EMAIL,
    subject: `Nueva solicitud de cita - ${appointment.ownerName}`,
    text:
      `Se recibió una nueva solicitud de cita desde el sitio web:\n\n` +
      `Dueño/a: ${appointment.ownerName}\n` +
      `Teléfono: ${appointment.ownerPhone}\n` +
      `Mascota: ${appointment.petInfo}\n` +
      `Servicio solicitado: ${appointment.serviceType}\n` +
      `Fecha preferida: ${appointment.prefDate}\n` +
      `Horario preferido: ${PREF_TIME_LABELS[appointment.prefTime]}\n` +
      calendarLine +
      `\nConfirma la hora exacta con el cliente por teléfono o WhatsApp.`,
  });
}
