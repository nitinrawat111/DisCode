import zod from 'zod';
import { problemIdDto, languageDto, submissionKeyDto } from './submission.dto';
import { userIdDto } from './user.dto';

// DTO for creating a submission
export const createSubmissionDto = zod.object({
  problemId: problemIdDto,
  language: languageDto,
  submissionKey: submissionKeyDto,
});