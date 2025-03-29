import { dbPool } from "../config/db";
import zod from "zod";
import { createSubmissionDto } from "../dtos/create-submission.dto";
import { updateSubmissionDto } from "../dtos/update-submission.dto";
import { submissionIdDto } from "../dtos/submission.dto";
import ApiError from "../utils/ApiError";
import { objKeysToCamelCase } from "../utils/camelCase";
import { getSubmissionsQueryDto } from "../dtos/get-submissions-query.dto";
import { codeExecutionQueueServiceInstance } from "./code-execution-queue.service";
import { userIdDto } from "../dtos/user.dto";

export class SubmissionService {
  async createSubmission(submissionDetails: zod.infer<typeof createSubmissionDto>, userId: zod.infer<typeof userIdDto>) {
    const validatedUserId = userIdDto.parse(userId);
    const validatedSubmission = createSubmissionDto.parse(submissionDetails);
    const queryResult = await dbPool.query(
      `INSERT INTO submissions (user_id, problem_id, language, submission_key) VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        validatedUserId,
        validatedSubmission.problemId,
        validatedSubmission.language,
        validatedSubmission.submissionKey,
      ]
    );

    // After creating submmision in DB, queue it for execution
    codeExecutionQueueServiceInstance.queueSubmissionForExecution(validatedSubmission);
    const createdSubmission = queryResult.rows[0];
    return objKeysToCamelCase(createdSubmission);
  }

  async updateSubmission(submissionDetails: zod.infer<typeof updateSubmissionDto>) {
    const validatedSubmission = updateSubmissionDto.parse(submissionDetails);
    const queryResult = await dbPool.query(
      `UPDATE submissions 
      SET status = COALESCE($1, status), 
        runtime = COALESCE($2, runtime), 
        memory_used = COALESCE($3, memory_used), 
        test_cases_passed = COALESCE($4, test_cases_passed), 
        total_test_cases = COALESCE($5, total_test_cases), 
        error_message = COALESCE($6, error_message), 
        executed_at = COALESCE($7, executed_at)
      WHERE submission_id = $8 RETURNING *`,
      [
        validatedSubmission.status,
        validatedSubmission.runtime,
        validatedSubmission.memoryUsed,
        validatedSubmission.testCasesPassed,
        validatedSubmission.totalTestCases,
        validatedSubmission.errorMessage,
        validatedSubmission.executedAt,
        validatedSubmission.submissionId,
      ]
    );

    if (queryResult.rowCount === 0) {
      throw new ApiError(404, "Submission not found");
    }
  }

  async getSubmissionById(submissionId: zod.infer<typeof submissionIdDto>) {
    const validatedSubmissionId = submissionIdDto.parse(submissionId);
    const queryResult = await dbPool.query(
      `SELECT * FROM submissions WHERE submission_id = $1`,
      [validatedSubmissionId]
    );

    if (queryResult.rowCount === 0) {
      throw new ApiError(404, "Submission not found");
    }

    const submission = queryResult.rows[0];
    return objKeysToCamelCase(submission);
  }

  async getSubmissions(query: zod.infer<typeof getSubmissionsQueryDto>) {
    const validatedQuery = getSubmissionsQueryDto.parse(query);

    // Build WHERE clause dynamically
    const filters: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (validatedQuery.userId) {
      filters.push(`user_id = $${index++}`);
      values.push(validatedQuery.userId);
    }

    if (validatedQuery.problemId) {
      filters.push(`problem_id = $${index++}`);
      values.push(validatedQuery.problemId);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    // Pagination
    const offset = (validatedQuery.page - 1) * validatedQuery.limit;
    values.push(validatedQuery.limit, offset);

    // Queries
    const submissionQuery = dbPool.query(
      `SELECT * FROM submissions ${whereClause} ORDER BY created_at DESC LIMIT $${index++} OFFSET $${index}`,
      values
    );
    const countQuery = dbPool.query(
      `SELECT COUNT(*) AS total FROM submissions ${whereClause}`,
      values.slice(0, index - 2)  // Use only filter values for the count query, not using limit and offset
    );

    const [countResult, submissionsResult] = await Promise.all([countQuery, submissionQuery]);
    const totalSubmissions = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(totalSubmissions / validatedQuery.limit);

    return {
      submissions: objKeysToCamelCase(submissionsResult.rows),
      totalSubmissions,
      totalPages,
      currentPage: validatedQuery.page,
    };
  }
}

export const submissionServiceInstance = new SubmissionService();