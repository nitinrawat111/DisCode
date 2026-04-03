import { sql } from "kysely";
import { DB } from "../db/db";
import { Submission } from "../models/submission.model";
import { User } from "../models/user.model";
import {
  CreateSubmissionRequest,
  GetSubmissionsQuery,
  UpdateSubmissionRequest,
} from "../dtos/submission.dto";
import { ApiError } from "../utils/ApiError";
import { CodeExecutionQueueServiceInstance } from "./code-execution-queue.service";

export class SubmissionService {
  async createSubmission(
    submissionRequest: CreateSubmissionRequest,
    userId: User["user_id"],
  ): Promise<Submission> {
    const inserted = await DB.insertInto("submissions")
      .values({
        user_id: userId,
        problem_id: submissionRequest.problem_id,
        language: submissionRequest.language,
        submission_key: submissionRequest.submission_key,
      })
      .returningAll()
      .executeTakeFirst();

    if (inserted === undefined) {
      throw new ApiError(500, "Failed to create submission");
    }

    // After creating submission in DB, queue it for execution
    await CodeExecutionQueueServiceInstance.queueSubmissionForExecution({
      submission_id: inserted.submission_id,
      problem_id: inserted.problem_id,
      language: inserted.language,
      submission_key: inserted.submission_key,
    });

    return inserted;
  }

  async getSubmissionById(
    submissionId: Submission["submission_id"],
  ): Promise<Submission> {
    const submission = await DB.selectFrom("submissions")
      .selectAll()
      .where("submission_id", "=", submissionId)
      .executeTakeFirst();

    if (submission === undefined) {
      throw new ApiError(404, "Submission not found");
    }

    return submission;
  }

  async getSubmissions(query: GetSubmissionsQuery): Promise<{
    submissions: Submission[];
    totalSubmissions: number;
    totalPages: number;
    currentPage: number;
  }> {
    let baseQuery = DB.selectFrom("submissions").selectAll();

    if (typeof query.user_id === "number") {
      baseQuery = baseQuery.where("user_id", "=", query.user_id);
    }

    if (typeof query.problem_id === "string") {
      baseQuery = baseQuery.where("problem_id", "=", query.problem_id);
    }

    // Get total count for pagination
    const countQuery = baseQuery
      .select(sql<number>`COUNT(*)::int`.as("total"))
      .executeTakeFirstOrThrow();

    // Apply pagination and ordering
    const offset = (query.page - 1) * query.limit;
    const submissionsQuery = baseQuery
      .orderBy("created_at", "desc")
      .limit(query.limit)
      .offset(offset)
      .execute();

    const [countResult, submissions] = await Promise.all([
      countQuery,
      submissionsQuery,
    ]);

    const totalSubmissions = countResult.total;
    const totalPages = Math.ceil(totalSubmissions / query.limit);

    return {
      submissions,
      totalSubmissions,
      totalPages,
      currentPage: query.page,
    };
  }

  async updateSubmission(updates: UpdateSubmissionRequest): Promise<void> {
    const result = await DB.updateTable("submissions")
      .set({
        status: updates.status,
        runtime: updates.runtime ?? undefined,
        memory_used: updates.memory_used ?? undefined,
        test_cases_passed: updates.test_cases_passed ?? undefined,
        total_test_cases: updates.total_test_cases ?? undefined,
        error_message: updates.error_message ?? undefined,
        executed_at: updates.executed_at ?? undefined,
      })
      .where("submission_id", "=", updates.submission_id)
      .executeTakeFirst();

    if (result.numUpdatedRows === 0n) {
      throw new ApiError(404, "Submission not found");
    }
  }
}

export const SubmissionServiceInstance = new SubmissionService();
