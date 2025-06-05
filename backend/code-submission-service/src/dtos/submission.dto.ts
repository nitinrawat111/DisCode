import zod from 'zod';

export enum SubmissionStatusEnum {
    Queued = 'Queued',
    CompileError = 'Compile Error',
    RuntimeError = 'Runtime Error',
    TimeLimitError = 'Time Limit Error',
    WrongAnswer = 'Wrong Answer',
    Successful = 'Successful',
    ServerError = 'Server Error'
}

// Enum type is not yet included in database
export enum LanguagesEnum {
    Python = 'Python',
    Cpp = 'Cpp'
}

export const submissionIdDto = zod.number().int().positive();
export const problemIdDto = zod.string().uuid();
export const languageDto = zod.enum(Object.values(LanguagesEnum) as [string, ...string[]]);
export const statusDto = zod.enum(Object.values(SubmissionStatusEnum) as [string, ...string[]]);
export const runtimeDto = zod.number().nonnegative();
export const memoryUsedDto = zod.number().nonnegative();
export const testCasesPassedDto = zod.number().int().nonnegative();
export const totalTestCasesDto = zod.number().int().nonnegative();
export const errorMessageDto = zod.string();
export const submissionKeyDto = zod.string().min(1);
export const executedAtDto = zod.string().datetime();