import { Router } from 'express';
import { createAppointment } from '../controllers/appointmentsController';

const router = Router();

router.post('/', createAppointment);

export default router;
