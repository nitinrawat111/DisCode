import {
  Generated,
  ColumnType,
  Selectable,
  Insertable,
  Updateable,
} from "kysely";
import { ProblemTable } from "./problem.model";
import { UserTable } from "./user.model";

////////////////////////////////////////////
// Submission Status
////////////////////////////////////////////
export const SubmissionStatus = {
  Queued: "queued",
  CompileError: "compile_error",
  RuntimeError: "runtime_error",
  TimeLimitExceeded: "time_limit_exceeded",
  WrongAnswer: "wrong_answer",
  Successful: "successful",
  ServerError: "server_error",
} as const;
export type SubmissionStatus =
  (typeof SubmissionStatus)[keyof typeof SubmissionStatus];

////////////////////////////////////////////
// Programming Languages
////////////////////////////////////////////
export const ProgrammingLanguages = {
  CPP: "cpp",
} as const;
export type ProgrammingLanguage =
  (typeof ProgrammingLanguages)[keyof typeof ProgrammingLanguages];

////////////////////////////////////////////
// Submission Table Definition
// TODO: Add columns for runtime, memory usage, test cases passed, total test cases, error message, etc.
////////////////////////////////////////////
export interface SubmissionTable {
  submission_id: Generated<number>;
  user_id: UserTable["user_id"];
  problem_id: ProblemTable["problem_id"];
  submission_key: string;
  language: ProgrammingLanguage;
  status: SubmissionStatus;
  /** Time at which the submission's execution was started */
  executed_at: ColumnType<Date | null, never, string | null>;
  /** Time at which the submission's execution was finished */
  completed_at: ColumnType<Date | null, never, string | null>;
  created_at: ColumnType<Date, never, never>;
  updated_at: ColumnType<Date, string | undefined, string>;
}

export type Submission = Selectable<SubmissionTable>;
export type NewSubmission = Insertable<SubmissionTable>;
export type SubmissionUpdate = Updateable<SubmissionTable>;
