import { SQSEvent } from "aws-lambda";
import { DynamoAppointmentRepository } from "../repositories/DynamoAppointmentRepository";
import { AppointmentService } from "../../application/services/AppointmentService";

const repository = new DynamoAppointmentRepository();
const service = new AppointmentService(repository);

export const main = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const body = JSON.parse(record.body);
    
    const insuredId = body.detail.insuredId;
    const scheduleId = body.detail.scheduleId;

    if (!insuredId || !scheduleId) {
      console.error("Faltan datos en la confirmación:", body);
      continue;
    }

    await service.completeAppointment(insuredId, scheduleId);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Confirmaciones procesadas correctamente." }),
  };
};
