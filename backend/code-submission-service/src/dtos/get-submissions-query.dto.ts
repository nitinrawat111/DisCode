import zod from 'zod';
import { problemIdDto } from './submission.dto';
import { userIdDto } from './user.dto';

export const getSubmissionsQueryDto = zod.object({
  userId: userIdDto.optional(),
  problemId: problemIdDto.optional(),
  page: zod.number().int().positive().default(1),
  limit: zod.number().int().positive().max(50).default(10),
});