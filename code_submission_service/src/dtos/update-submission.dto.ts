import zod from 'zod';
import { submissionIdDto, statusDto, runtimeDto, memoryUsedDto, testCasesPassedDto, totalTestCasesDto, errorMessageDto, executedAtDto } from './submission.dto';

export const updateSubmissionDto = zod.object({
  submissionId: submissionIdDto,
  status: statusDto,
  runtime: runtimeDto.optional(),
  memoryUsed: memoryUsedDto.optional(),
  testCasesPassed: testCasesPassedDto.optional(),
  totalTestCases: totalTestCasesDto.optional(),
  errorMessage: errorMessageDto.optional(),
  executedAt: executedAtDto.optional(),
});
