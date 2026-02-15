import { z } from "zod/v4";
import { ProblemDifficulty } from "../models/problem.model";
import { UserIdDto } from "./user.dto";

////////////////////////////////////////////
// Common Dtos
////////////////////////////////////////////
const S3KeyDto = z.string().min(1);
export const ProblemTitleDto = z.string().min(1).max(200);
export const MarkdownKeyDto = S3KeyDto;
export const TestKeysDto = z.array(S3KeyDto).min(1); // At least one test case
export const ProblemDifficultyDto = z.enum(ProblemDifficulty);
export const ProblemTagsDto = z.array(z.string().min(1)); // Tags cannot be empty strings

////////////////////////////////////////////
// Create Problem Request Dto
////////////////////////////////////////////
export const CreateProblemRequestDto = z.object({
  title: ProblemTitleDto,
  markdown_key: MarkdownKeyDto,
  test_keys: TestKeysDto,
  difficulty: ProblemDifficultyDto,
  tags: ProblemTagsDto.nullish(),
});
export type CreateProblemRequest = z.infer<typeof CreateProblemRequestDto>;

////////////////////////////////////////////
// Update Problem Request Dto
////////////////////////////////////////////
export const UpdateProblemRequestDto = z.object({
  title: ProblemTitleDto.nullish(),
  markdown_key: MarkdownKeyDto.nullish(),
  test_keys: TestKeysDto.nullish(),
  difficulty: ProblemDifficultyDto.nullish(),
  tags: ProblemTagsDto.nullish(),
});
export type UpdateProblemRequest = z.infer<typeof UpdateProblemRequestDto>;

////////////////////////////////////////////
// Get Problems Query Dto
////////////////////////////////////////////
export const GetProblemsQueryDto = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  difficulty: ProblemDifficultyDto.nullish(),
  tags: ProblemTagsDto.nullish(),
  search: z.string().nullish(),
  created_by: UserIdDto.nullish(),
});
export type GetProblemsQuery = z.infer<typeof GetProblemsQueryDto>;
