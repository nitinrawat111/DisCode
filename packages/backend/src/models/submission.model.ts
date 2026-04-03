import {
  ColumnType,
  Generated,
  Insertable,
  Selectable,
  Updateable,
} from "kysely";
import { UserTable } from "./user.model";

////////////////////////////////////////////
// Submission Status
////////////////////////////////////////////
export const SubmissionStatus = {
  Queued: "Queued",
  CompileError: "Compile Error",
  RuntimeError: "Runtime Error",
  TimeLimitError: "Time Limit Error",
  WrongAnswer: "Wrong Answer",
  Successful: "Successful",
  ServerError: "Server Error",
} as const;
export type SubmissionStatus =
  (typeof SubmissionStatus)[keyof typeof SubmissionStatus];

////////////////////////////////////////////
// Programming Languages
////////////////////////////////////////////
export const Language = {
  Python: "Python",
  Cpp: "Cpp",
} as const;
export type Language = (typeof Language)[keyof typeof Language];

////////////////////////////////////////////
// Submission Table Definition
////////////////////////////////////////////
export interface SubmissionTable {
  submission_id: Generated<number>;
  user_id: UserTable["user_id"];
  /**
   * UUID of the problem being submitted
   */
  problem_id: string;
  language: Language;
  status: ColumnType<
    SubmissionStatus,
    SubmissionStatus | undefined,
    SubmissionStatus
  >;
  runtime: number | null;
  memory_used: number | null;
  test_cases_passed: number | null;
  total_test_cases: number | null;
  error_message: string | null;
  /**
   * Azure Blob Storage key for the submitted code file
   */
  submission_key: string;
  created_at: ColumnType<Date, never, never>;
  executed_at: ColumnType<
    Date | null,
    string | null | undefined,
    string | null | undefined
  >;
}

export type Submission = Selectable<SubmissionTable>;
export type NewSubmission = Insertable<SubmissionTable>;
export type SubmissionUpdate = Updateable<SubmissionTable>;
