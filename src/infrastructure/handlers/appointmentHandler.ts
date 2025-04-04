import { APIGatewayProxyHandler, SQSEvent } from "aws-lambda";
import { DynamoAppointmentRepository } from "../repositories/DynamoAppointmentRepository";
import { AppointmentService } from "../../application/services/AppointmentService";
import { SNS } from "aws-sdk";

const repository = new DynamoAppointmentRepository();
const service = new AppointmentService(repository);
const sns = new SNS();

const snsTopicArn = process.env.SNS_TOPIC_ARN!;

export const main: APIGatewayProxyHandler = async (event) => {
  if (event.httpMethod === "POST") {
    const body = JSON.parse(event.body!);

    // 1. Guardar en DynamoDB
    await service.createAppointment({
      insuredId: body.insuredId,
      scheduleId: body.scheduleId,
      countryISO: body.countryISO,
      status: "pending",
    });

    // 2. Publicar al SNS
    await sns.publish({
      TopicArn: snsTopicArn,
      Message: JSON.stringify({
        insuredId: body.insuredId,
        scheduleId: body.scheduleId,
        countryISO: body.countryISO,
      }),
      MessageAttributes: {
        countryISO: {
          DataType: "String",
          StringValue: body.countryISO
        }
      }
    }).promise();

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Appointment created and published to SNS successfully" }),
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
