import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import appointmentsRouter from './routes/appointments';
import { testConnection } from './db/connection';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Orígenes permitidos: el de producción (.env) y los de desarrollo local de Vite.
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Sin "origin" (ej. Postman, curl) se permite; si viene un origin, debe estar en la lista.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origen no permitido por CORS: ${origin}`));
      }
    },
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'API de Veterinaria Jardines funcionando.' });
});

app.use('/api/appointments', appointmentsRouter);

app.listen(PORT, async () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  try {
    await testConnection();
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
});
