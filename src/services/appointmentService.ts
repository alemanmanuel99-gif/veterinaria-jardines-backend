import { pool } from '../db/connection';
import { AppointmentInput, AppointmentRecord } from '../types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function saveAppointment(data: AppointmentInput): Promise<AppointmentRecord> {
  const { ownerName, ownerPhone, petInfo, serviceType, prefDate, prefTime } = data;

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO appointments (owner_name, owner_phone, pet_info, service_type, pref_date, pref_time)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [ownerName, ownerPhone, petInfo, serviceType, prefDate, prefTime]
  );

  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM appointments WHERE id = ?',
    [result.insertId]
  );

  const row = rows[0];

  return {
    id: row.id,
    ownerName: row.owner_name,
    ownerPhone: row.owner_phone,
    petInfo: row.pet_info,
    serviceType: row.service_type,
    prefDate: row.pref_date,
    prefTime: row.pref_time,
    status: row.status,
    createdAt: row.created_at,
  };
}
