import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  // Devuelve las columnas DATE/DATETIME como texto "YYYY-MM-DD" en vez de objetos Date de JS.
  dateStrings: true,
});

export async function testConnection(): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.query('SELECT 1');
    console.log('Conexion a MySQL (Hostinger) exitosa.');
  } finally {
    connection.release();
  }
}
