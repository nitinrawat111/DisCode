import { z } from "zod";
import {
  ProgrammingLanguages,
  Submission,
  SubmissionStatus,
} from "../models/submission.model";

////////////////////////////////////////////
// Common Dtos
////////////////////////////////////////////
export const SubmissionIdDto = z.string().min(1);
export const SubmissionLanguageDto = z.enum(ProgrammingLanguages);
export const SubmissionStatusDto = z.enum(SubmissionStatus);
export const SubmissionKeyDto = z.string().min(1);

////////////////////////////////////////////
// Create Submission Request Dto
////////////////////////////////////////////
export const CreateSubmissionRequestDto = z.object({
  problem_id: z.string().min(1),
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
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  problemId: z.string().min(1).nullish(),
  userId: z.coerce.number().int().positive().nullish(),
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
