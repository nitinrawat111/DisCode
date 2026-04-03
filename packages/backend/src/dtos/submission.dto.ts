import { z } from "zod";
import { Language, SubmissionStatus } from "../models/submission.model";
import { UserIdDto } from "./user.dto";

////////////////////////////////////////////
// Common Dtos
////////////////////////////////////////////
export const SubmissionIdDto = z.number().int().positive();
export const ProblemIdDto = z.string().uuid();
export const LanguageDto = z.enum(Language);
export const SubmissionStatusDto = z.enum(SubmissionStatus);
export const SubmissionKeyDto = z.string().min(1);

////////////////////////////////////////////
// Create Submission Request Dto
////////////////////////////////////////////
export const CreateSubmissionRequestDto = z.object({
  problem_id: ProblemIdDto,
  language: LanguageDto,
  submission_key: SubmissionKeyDto,
});
export type CreateSubmissionRequest = z.infer<
  typeof CreateSubmissionRequestDto
>;

////////////////////////////////////////////
// Update Submission Request Dto
// Called by the code execution worker after running the submission
////////////////////////////////////////////
export const UpdateSubmissionRequestDto = z.object({
  submission_id: SubmissionIdDto,
  status: SubmissionStatusDto,
  runtime: z.number().nonnegative().nullish(),
  memory_used: z.number().nonnegative().nullish(),
  test_cases_passed: z.number().int().nonnegative().nullish(),
  total_test_cases: z.number().int().nonnegative().nullish(),
  error_message: z.string().nullish(),
  executed_at: z.string().datetime().nullish(),
});
export type UpdateSubmissionRequest = z.infer<
  typeof UpdateSubmissionRequestDto
>;

////////////////////////////////////////////
// Get Submissions Query Dto
////////////////////////////////////////////
export const GetSubmissionsQueryDto = z.object({
  user_id: UserIdDto.nullish(),
  problem_id: ProblemIdDto.nullish(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});
export type GetSubmissionsQuery = z.infer<typeof GetSubmissionsQueryDto>;
