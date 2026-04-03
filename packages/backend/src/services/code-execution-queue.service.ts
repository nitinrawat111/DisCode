import { ServiceBusClient, ServiceBusSender } from "@azure/service-bus";
import { Logger } from "../utils/logger";
import { CreateSubmissionRequest } from "../dtos/submission.dto";

export interface SubmissionQueueMessage extends CreateSubmissionRequest {
  submission_id: number;
}

export class CodeExecutionQueueService {
  private client!: ServiceBusClient;
  private sender!: ServiceBusSender;
  private initPromise: Promise<void> | null;

  constructor() {
    this.initPromise = this.init();
  }

  private async init() {
    const connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
    const queueName = process.env.AZURE_SERVICE_BUS_QUEUE_NAME;

    if (!connectionString) {
      throw new Error(
        "Missing required environment variable: AZURE_SERVICE_BUS_CONNECTION_STRING",
      );
    }
    if (!queueName) {
      throw new Error(
        "Missing required environment variable: AZURE_SERVICE_BUS_QUEUE_NAME",
      );
    }

    this.client = new ServiceBusClient(connectionString);
    this.sender = this.client.createSender(queueName);
    Logger.info("Azure Service Bus queue initialized");
    this.initPromise = null;
  }

  async waitForInit() {
    return this.initPromise;
  }

  async queueSubmissionForExecution(message: SubmissionQueueMessage) {
    await this.waitForInit();
    await this.sender.sendMessages({
      body: message,
      contentType: "application/json",
    });
  }

  async close() {
    await this.sender?.close();
    await this.client?.close();
  }
}

export const CodeExecutionQueueServiceInstance =
  new CodeExecutionQueueService();
