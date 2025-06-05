import * as amqp from 'amqplib';
import zod from "zod";
import { createSubmissionDto } from '../dtos/create-submission.dto';

export class CodeExecutionQueueService {
  private initPromise: Promise<void>;
  private connection: amqp.ChannelModel;
  private channel: amqp.Channel;
  private exchangeName = 'code-execution';
  private queueName = 'code-execution-queue';
  private routingKey = 'code-execution';

  constructor() {
    this.initPromise = this.init();
  }

  private async init() {
    this.connection = await amqp.connect(process.env.RABBITMQ_HOST);
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(this.exchangeName, 'direct', { durable: true });
    await this.channel.assertQueue(this.queueName, { durable: true });
    await this.channel.bindQueue(this.queueName, this.exchangeName, this.routingKey);

    // Clear the promise once init is successful
    this.initPromise = null;
  }

  async waitForInit() {
    return this.initPromise;
  }

  private async sendMessage(payload: any) {
    const message = JSON.stringify(payload);
    this.channel.sendToQueue(this.queueName, Buffer.from(message));
  };

  async queueSubmissionForExecution(newSubmission: zod.infer<typeof createSubmissionDto>) {
    return this.sendMessage(newSubmission);
  } 
}

export const codeExecutionQueueServiceInstance = new CodeExecutionQueueService();