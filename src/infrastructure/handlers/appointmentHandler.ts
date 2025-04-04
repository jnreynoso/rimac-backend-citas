import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoAppointmentRepository } from "../repositories/DynamoAppointmentRepository";
import { AppointmentService } from "../../application/services/AppointmentService";
import { v4 as uuidv4 } from 'uuid';

const repository = new DynamoAppointmentRepository();
const service = new AppointmentService(repository);

export const main: APIGatewayProxyHandler = async (event) => {
  if (event.httpMethod === "POST") {
    const body = JSON.parse(event.body!);
    await service.createAppointment({
      insuredId: body.insuredId,
      scheduleId: body.scheduleId,
      countryISO: body.countryISO,
      status: "pending",
    });
    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Appointment created successfully" }),
    };
  }

  if (event.httpMethod === "GET") {
    const insuredId = event.pathParameters?.insuredId;
    if (!insuredId) {
      return { statusCode: 400, body: "Missing insuredId" };
    }
    const appointments = await service.getAppointments(insuredId);
    return {
      statusCode: 200,
      body: JSON.stringify(appointments),
    };
  }

  return { statusCode: 405, body: "Method Not Allowed" };
};

