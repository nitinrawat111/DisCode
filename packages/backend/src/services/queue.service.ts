import { ServiceBusClient, ServiceBusSender } from "@azure/service-bus";
import { Submission } from "../models/submission.model";
import { QueueMessage, QueueMessageTypes } from "../types/queue";

export class QueueService {
  private readonly client: ServiceBusClient;
  private readonly sender: ServiceBusSender;

  constructor() {
    // Reference: https://www.npmjs.com/package/@azure/service-bus
    this.client = new ServiceBusClient(
      process.env.AZURE_SERVICE_BUS_CONNECTION_STRING,
    );

    this.sender = this.client.createSender(
      process.env.AZURE_SUBMISSIONS_QUEUE_NAME,
    );
  }

  async pushSubmissionToQueue(submission: Submission): Promise<void> {
    const submissionCreatedPayload: QueueMessage = {
      eventType: QueueMessageTypes.SubmissionCreated,
      payload: submission,
    };

    await this.sender.sendMessages({
      body: submissionCreatedPayload,
      contentType: "application/json",
      subject: submissionCreatedPayload.eventType,
    });
  }
}

export const QueueServiceInstance = new QueueService();
