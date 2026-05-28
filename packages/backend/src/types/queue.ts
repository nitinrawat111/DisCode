import { Submission } from "../models/submission.model";

export const QueueMessageTypes = {
  SubmissionCreated: "submission_created",
} as const;
export type QueueMessageType =
  (typeof QueueMessageTypes)[keyof typeof QueueMessageTypes];

// Update this type if you add more message types to the QueueMessageTypes object
// Otherwise a compilation error will occur.
export type QueuePayloadMap = {
  [QueueMessageTypes.SubmissionCreated]: Submission;
};

export type QueueMessage = {
  [K in QueueMessageType]: {
    eventType: K;
    payload: QueuePayloadMap[K];
  };
}[keyof QueuePayloadMap];
