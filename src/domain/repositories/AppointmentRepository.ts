import { Appointment } from "../entities/Appointment";

export interface AppointmentRepository {
  createAppointment(appointment: Appointment): Promise<void>;
  getAppointmentsByInsuredId(insuredId: string): Promise<Appointment[]>;
  updateAppointmentStatus(insuredId: string, scheduleId: number, status: string): Promise<void>;
}

