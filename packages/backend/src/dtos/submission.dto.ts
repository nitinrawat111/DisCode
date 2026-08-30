import { z } from "zod";
import {
  ProgrammingLanguages,
  Submission,
  SubmissionStatus,
} from "../models/submission.model";

////////////////////////////////////////////
// Common Dtos
////////////////////////////////////////////
export const SubmissionIdDto = z.string().min(1).openapi({
  description: "Submission ID",
  example: "1",
});
export const SubmissionLanguageDto = z.enum(ProgrammingLanguages).openapi({
  description: "Programming language",
  example: ProgrammingLanguages.CPP,
});
export const SubmissionStatusDto = z.enum(SubmissionStatus).openapi({
  description: "Submission status",
  example: SubmissionStatus.Queued,
});
export const SubmissionKeyDto = z.string().min(1).openapi({
  description: "Blob/object storage key of submitted code",
  example: "submissions/code-123.cpp",
});

////////////////////////////////////////////
// Create Submission Request Dto
////////////////////////////////////////////
export const CreateSubmissionRequestDto = z.object({
  problem_id: z.string().min(1).openapi({ description: "Target problem ID" }),
  language: SubmissionLanguageDto,
  submission_key: SubmissionKeyDto,
});
export type CreateSubmissionRequest = z.infer<
  typeof CreateSubmissionRequestDto
>;

////////////////////////////////////////////
// Get Submissions Filter Query Dto
////////////////////////////////////////////
export const GetSubmissionsFilterQueryDto = z.object({
  page: z.coerce.number().int().positive().default(1).openapi({ example: 1 }),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(50)
    .default(10)
    .openapi({ example: 10 }),
  problemId: z.string().min(1).nullish().openapi({
    description: "Filter by problem ID (provide problemId or userId)",
  }),
  userId: z.coerce.number().int().positive().nullish().openapi({
    description: "Filter by user ID (provide problemId or userId)",
  }),
  status: SubmissionStatusDto.nullish(),
  language: SubmissionLanguageDto.nullish(),
});
export type GetSubmissionsFilterQuery = z.infer<
  typeof GetSubmissionsFilterQueryDto
>;

////////////////////////////////////////////
// Get Submissions Response Dto
////////////////////////////////////////////
export interface GetSubmissionsResponse {
  submissions: Submission[];
  totalSubmissions: number;
  totalPages: number;
  currentPage: number;
}
