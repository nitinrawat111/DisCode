import { sql } from "kysely";
import { DB } from "../db/db";
import {
  CreateSubmissionRequest,
  GetSubmissionsFilterQuery,
  GetSubmissionsResponse,
} from "../dtos/submission.dto";
import { Submission, SubmissionStatus } from "../models/submission.model";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { Logger } from "../utils/logger";
import { QueueServiceInstance } from "./queue.service";

export class SubmissionService {
  async createSubmission(
    createSubmissionRequest: CreateSubmissionRequest,
    userId: User["user_id"],
  ): Promise<Submission> {
    const result = await DB.transaction().execute(async (trx) => {
      const matchedProblem = await trx
        .selectFrom("problems")
        .select("problem_id")
        .where("problem_id", "=", createSubmissionRequest.problem_id)
        .executeTakeFirst();

      if (matchedProblem === undefined) {
        throw new ApiError(404, "Problem not found");
      }

      const insertedSubmission = await trx
        .insertInto("submissions")
        .values({
          user_id: userId,
          problem_id: createSubmissionRequest.problem_id,
          language: createSubmissionRequest.language,
          submission_key: createSubmissionRequest.submission_key,
          status: SubmissionStatus.Queued,
        })
        .returningAll()
        .executeTakeFirst();

      if (insertedSubmission === undefined) {
        throw new ApiError(500, "Failed to create submission");
      }

      try {
        await QueueServiceInstance.pushSubmissionToQueue(insertedSubmission);
      } catch (err: unknown) {
        Logger.error(err);

        const failedSubmission = await trx
          .updateTable("submissions")
          .set({
            status: SubmissionStatus.ServerError,
            updated_at: sql`CURRENT_TIMESTAMP`,
          })
          .where("submission_id", "=", insertedSubmission.submission_id)
          .returningAll()
          .executeTakeFirst();

        if (failedSubmission === undefined) {
          throw new ApiError(500, "Failed to mark submission as server error");
        }

        throw new ApiError(
          503,
          "Submission queue is temporarily unavailable. Please retry",
        );
      }

      return insertedSubmission;
    });

    return result;
  }

  async getSubmissions(
    query: GetSubmissionsFilterQuery,
  ): Promise<GetSubmissionsResponse> {
    let baseQuery = DB.selectFrom("submissions").selectAll();

    if (typeof query.problemId === "string") {
      baseQuery = baseQuery.where("problem_id", "=", query.problemId);
    }

    if (typeof query.userId === "number") {
      baseQuery = baseQuery.where("user_id", "=", query.userId);
    }

    if (typeof query.status === "string") {
      baseQuery = baseQuery.where("status", "=", query.status);
    }

    if (typeof query.language === "string") {
      baseQuery = baseQuery.where("language", "=", query.language);
    }

    const countQuery = baseQuery
      .select(sql<number>`COUNT(*)::int`.as("total"))
      .executeTakeFirstOrThrow();

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
}

export const SubmissionServiceInstance = new SubmissionService();
