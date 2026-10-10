import { Request, Response } from 'express';
import { saveAppointment } from '../services/appointmentService';
import { sendAppointmentNotification } from '../services/emailService';
import { createCalendarEvent } from '../services/calendarService';
import { AppointmentInput, PrefTime } from '../types';

const VALID_PREF_TIMES: PrefTime[] = ['manana', 'tarde', 'noche'];

function isValidAppointmentInput(body: any): body is AppointmentInput {
  if (!body) return false;
  const { ownerName, ownerPhone, petInfo, serviceType, prefDate, prefTime } = body;

  if (typeof ownerName !== 'string' || ownerName.trim().length === 0) return false;
  if (typeof ownerPhone !== 'string' || ownerPhone.trim().length === 0) return false;
  if (typeof petInfo !== 'string' || petInfo.trim().length === 0) return false;
  if (typeof serviceType !== 'string' || serviceType.trim().length === 0) return false;
  if (typeof prefDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(prefDate)) return false;
  if (!VALID_PREF_TIMES.includes(prefTime)) return false;

  return true;
}

export async function createAppointment(req: Request, res: Response): Promise<void> {
  try {
    if (!isValidAppointmentInput(req.body)) {
      res.status(400).json({
        ok: false,
        message: 'Datos incompletos o inválidos. Verifica todos los campos del formulario.',
      });
      return;
    }

    // No se permiten citas en domingo (mismo criterio que el frontend)
    const [year, month, day] = req.body.prefDate.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    if (selectedDate.getDay() === 0) {
      res.status(400).json({
        ok: false,
        message: 'No se agendan citas en domingo.',
      });
      return;
    }

    const appointment = await saveAppointment(req.body);

    // La cita ya quedó guardada en la base de datos aunque fallen estos pasos.
    let calendarEventLink: string | null = null;
    try {
      calendarEventLink = await createCalendarEvent(appointment);
    } catch (calendarError) {
      console.error('La cita se guardó, pero no se pudo crear el evento de calendario:', calendarError);
    }

    try {
      await sendAppointmentNotification(appointment, calendarEventLink);
    } catch (emailError) {
      console.error('La cita se guardó, pero el correo no pudo enviarse:', emailError);
    }

    res.status(201).json({
      ok: true,
      message: 'Cita registrada correctamente.',
      appointment,
    });
  } catch (error) {
    console.error('Error al crear la cita:', error);
    res.status(500).json({
      ok: false,
      message: 'Ocurrió un error en el servidor al registrar la cita.',
    });
  }
}
