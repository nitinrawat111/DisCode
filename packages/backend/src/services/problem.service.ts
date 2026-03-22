import { DB } from "../db/db";
import {
  CreateProblemRequest,
  GetProblemsQuery,
  GetProblemsResponse,
  UpdateProblemRequest,
} from "../dtos/problem.dto";
import { Problem, ProblemWithCreator } from "../models/problem.model";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { sql } from "kysely";

export class ProblemService {
  async createProblem(
    createProblemRequest: CreateProblemRequest,
    creatorId: User["user_id"],
  ): Promise<Problem> {
    const insertedProblem = await DB.insertInto("problems")
      .values({
        title: createProblemRequest.title,
        markdown_key: createProblemRequest.markdown_key,
        test_keys: createProblemRequest.test_keys,
        difficulty: createProblemRequest.difficulty,
        tags: createProblemRequest.tags ?? [],
        created_by: creatorId,
      })
      .returningAll()
      .executeTakeFirst();

    if (insertedProblem === undefined) {
      throw new ApiError(500, "Failed to create problem");
    }

    return insertedProblem;
  }

  async getProblemById(
    problemId: Problem["problem_id"],
  ): Promise<ProblemWithCreator> {
    const matchedProblem = await DB.selectFrom("problems")
      .innerJoin("users", "problems.created_by", "users.user_id")
      .select([
        "problems.problem_id",
        "problems.title",
        "problems.markdown_key",
        "problems.test_keys",
        "problems.difficulty",
        "problems.tags",
        "problems.created_by",
        "problems.created_at",
        "problems.updated_at",
        "users.username as creator_username",
      ])
      .where("problems.problem_id", "=", problemId)
      .executeTakeFirst();

    if (matchedProblem === undefined) {
      throw new ApiError(404, "Problem not found");
    }

    return matchedProblem;
  }

  async getProblems(query: GetProblemsQuery): Promise<GetProblemsResponse> {
    let baseQuery = DB.selectFrom("problems")
      .innerJoin("users", "problems.created_by", "users.user_id")
      .select([
        "problems.problem_id",
        "problems.title",
        "problems.markdown_key",
        "problems.test_keys",
        "problems.difficulty",
        "problems.tags",
        "problems.created_by",
        "problems.created_at",
        "problems.updated_at",
        "users.username as creator_username",
      ]);

    // Apply filters
    if (typeof query.difficulty === "string") {
      baseQuery = baseQuery.where("problems.difficulty", "=", query.difficulty);
    }

    if (Array.isArray(query.tags) && query.tags.length > 0) {
      baseQuery = baseQuery.where(
        sql<boolean>`problems.tags && ${JSON.stringify(query.tags)}::text[]`,
      );
    }

    if (typeof query.search === "string") {
      baseQuery = baseQuery.where(
        sql<boolean>`problems.title ILIKE ${`%${query.search}%`}`,
      );
    }

    if (typeof query.created_by === "number") {
      baseQuery = baseQuery.where("problems.created_by", "=", query.created_by);
    }

    // Get total count for pagination
    const countQuery = baseQuery
      .select(sql<number>`COUNT(*)::int`.as("total"))
      .executeTakeFirstOrThrow();

    // Apply pagination and ordering
    const offset = (query.page - 1) * query.limit;
    const problemsQuery = baseQuery
      .orderBy("problems.created_at", "desc")
      .limit(query.limit)
      .offset(offset)
      .execute();

    const [countResult, problems] = await Promise.all([
      countQuery,
      problemsQuery,
    ]);

    const totalProblems = countResult.total;
    const totalPages = Math.ceil(totalProblems / query.limit);

    return {
      problems: problems,
      totalProblems,
      totalPages,
      currentPage: query.page,
    };
  }

  async updateProblem(
    problemId: Problem["problem_id"],
    updatedBy: User["user_id"],
    updates: UpdateProblemRequest,
  ): Promise<Problem> {
    // Only allow moderators, admins, superadmins, or the creator to update
    const canUpdate = await ProblemServiceInstance.checkIfUserCanUpdateProblem(
      problemId,
      updatedBy,
    );

    if (canUpdate === false) {
      throw new ApiError(
        403,
        "User does not have permission to update this problem",
      );
    }

    const updatedProblem = await DB.updateTable("problems")
      .set({
        title: updates.title ?? undefined,
        markdown_key: updates.markdown_key ?? undefined,
        test_keys: updates.test_keys ?? undefined,
        difficulty: updates.difficulty ?? undefined,
        tags: updates.tags ?? undefined,
        updated_at: sql`CURRENT_TIMESTAMP`,
      })
      .where("problem_id", "=", problemId)
      .returningAll()
      .executeTakeFirst();

    if (updatedProblem === undefined) {
      throw new ApiError(404, "Problem not found");
    }

    return updatedProblem;
  }

  async deleteProblem(
    problemId: Problem["problem_id"],
    deletedBy: User["user_id"],
  ): Promise<void> {
    const canDelete = await ProblemServiceInstance.checkIfUserCanUpdateProblem(
      problemId,
      deletedBy,
    );

    if (canDelete === false) {
      throw new ApiError(
        403,
        "User does not have permission to delete this problem",
      );
    }

    const result = await DB.deleteFrom("problems")
      .where("problem_id", "=", problemId)
      .executeTakeFirst();

    if (result.numDeletedRows === 0n) {
      throw new ApiError(404, "Problem not found");
    }
  }

  async checkIfUserCanUpdateProblem(
    problemId: Problem["problem_id"],
    userId: User["user_id"],
  ): Promise<boolean> {
    const problem = await DB.selectFrom("problems")
      .select("created_by")
      .where("problem_id", "=", problemId)
      .executeTakeFirst();

    if (problem === undefined) {
      throw new ApiError(404, "Problem not found");
    }

    return problem.created_by === userId;
  }
}

export const ProblemServiceInstance = new ProblemService();
