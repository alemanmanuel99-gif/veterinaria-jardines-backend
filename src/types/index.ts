export type PrefTime = 'manana' | 'tarde' | 'noche';

export interface AppointmentInput {
  ownerName: string;
  ownerPhone: string;
  petInfo: string;
  serviceType: string;
  prefDate: string; // formato "YYYY-MM-DD"
  prefTime: PrefTime;
}

export interface AppointmentRecord extends AppointmentInput {
  id: number;
  status: 'pendiente' | 'confirmada' | 'cancelada';
  createdAt: string;
}
