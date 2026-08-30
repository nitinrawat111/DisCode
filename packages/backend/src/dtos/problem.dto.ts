import { z } from "zod";
import { ProblemDifficulty, ProblemWithCreator } from "../models/problem.model";
import { UserIdDto } from "./user.dto";

////////////////////////////////////////////
// Common Dtos
////////////////////////////////////////////
const S3KeyDto = z.string().min(1).openapi({
  description: "S3 key for file storage",
  example: "markdown/problem-123.md",
});
export const ProblemTitleDto = z.string().min(1).max(200).openapi({
  description: "Problem title (max 200 characters)",
  example: "Two Sum",
});
export const MarkdownKeyDto = S3KeyDto.openapi({
  description: "S3 key for problem statement markdown",
  example: "markdown/two-sum.md",
});
export const TestKeysDto = z
  .array(S3KeyDto)
  .min(1) // At least one test case
  .openapi({
    description: "Array of S3 keys for test cases",
    example: ["tests/two-sum-1.json"],
  });
export const ProblemDifficultyDto = z.enum(ProblemDifficulty).openapi({
  description: "Problem difficulty level",
  example: ProblemDifficulty.Easy,
});
export const ProblemTagsDto = z.array(z.string().min(1)).openapi({
  description: "Problem tags",
  example: ["array", "hash-table"],
}); // Tags cannot be empty strings

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
  page: z.coerce.number().int().positive().default(1).openapi({
    description: "Page number for pagination",
    example: 1,
  }),
  limit: z.coerce.number().int().positive().max(50).default(10).openapi({
    description: "Number of problems per page",
    example: 10,
  }),
  difficulty: ProblemDifficultyDto.nullish().openapi({
    description: "Filter by difficulty",
  }),
  tags: ProblemTagsDto.nullish().openapi({
    description: "Comma-separated list of tags to filter by",
  }),
  search: z.string().nullish().openapi({
    description: "Search in problem titles",
    example: "sum",
  }),
  created_by: UserIdDto.nullish().openapi({
    description: "Filter by creator user ID",
  }),
});
export type GetProblemsQuery = z.infer<typeof GetProblemsQueryDto>;

////////////////////////////////////////////
// Get Problems Response Dto
////////////////////////////////////////////
export interface GetProblemsResponse {
  problems: ProblemWithCreator[];
  totalProblems: number;
  totalPages: number;
  currentPage: number;
}
