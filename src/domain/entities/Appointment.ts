export interface Appointment {
  insuredId: string;
  scheduleId: number;
  countryISO: string;
  status: string; // pending | completed
}
