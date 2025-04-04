import { AppointmentRepository } from "../../domain/repositories/AppointmentRepository";
import { Appointment } from "../../domain/entities/Appointment";

export class AppointmentService {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async createAppointment(appointment: Appointment): Promise<void> {
    await this.appointmentRepository.createAppointment(appointment);
  }

  async getAppointments(insuredId: string): Promise<Appointment[]> {
    return await this.appointmentRepository.getAppointmentsByInsuredId(insuredId);
  }

  async completeAppointment(insuredId: string, scheduleId: number): Promise<void> {
    await this.appointmentRepository.updateAppointmentStatus(insuredId, scheduleId, 'completed');
  }
}

