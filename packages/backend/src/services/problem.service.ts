import { DB } from "../db/db";
import {
  CreateProblemRequest,
  UpdateProblemRequest,
  GetProblemsQuery,
} from "../dtos/problem.dto";
import { Problem, ProblemWithCreator } from "../models/problem.model";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { sql } from "kysely";

export class ProblemService {
  async createProblem(
    createProblemRequest: CreateProblemRequest,
    creatorId: User["user_id"],
  ) {
    await DB.insertInto("problems")
      .values({
        title: createProblemRequest.title,
        markdown_key: createProblemRequest.markdown_key,
        test_keys: createProblemRequest.test_keys,
        difficulty: createProblemRequest.difficulty,
        tags: createProblemRequest.tags ?? [],
        created_by: creatorId,
      })
      .execute();
  }

  async getProblemById(
    problemId: Problem["problem_id"],
  ): Promise<ProblemWithCreator> {
    const queryResult = await DB.selectFrom("problems")
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
      .execute();

    const matchedProblem = queryResult.at(0);

    if (matchedProblem === undefined || typeof matchedProblem.creator_username !== "string") {
      throw new ApiError(404, "Problem not found");
    }

    return matchedProblem;
  }

  async getProblems(query: GetProblemsQuery): Promise<{
    problems: ProblemWithCreator[];
    totalProblems: number;
    totalPages: number;
    currentPage: number;
  }> {
    let problemQuery = DB.selectFrom("problems")
      .leftJoin("users", "problems.created_by", "users.user_id")
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
    if (typeof query.difficulty !== "undefined") {
      problemQuery = problemQuery.where(
        "problems.difficulty",
        "=",
        query.difficulty,
      );
    }

    if (typeof query.tags !== "undefined" && query.tags.length > 0) {
      problemQuery = problemQuery.where(
        sql<boolean>`problems.tags && ${JSON.stringify(query.tags)}::text[]`,
      );
    }

    if (typeof query.search !== "undefined") {
      problemQuery = problemQuery.where(
        sql<boolean>`problems.title ILIKE ${`%${query.search}%`}`,
      );
    }

    if (typeof query.created_by !== "undefined") {
      problemQuery = problemQuery.where(
        "problems.created_by",
        "=",
        query.created_by,
      );
    }

    // Get total count for pagination
    const countQuery = problemQuery
      .select(sql`COUNT(*)::int`.as("total"))
      .executeTakeFirstOrThrow();

    // Apply pagination and ordering
    const offset = (query.page - 1) * query.limit;
    const problemsQuery = problemQuery
      .orderBy("problems.created_at", "desc")
      .limit(query.limit)
      .offset(offset)
      .execute();

    const [countResult, problems] = await Promise.all([
      countQuery,
      problemsQuery,
    ]);

    const totalProblems = Number(countResult.total);
    const totalPages = Math.ceil(totalProblems / query.limit);

    return {
      problems: problems as ProblemWithCreator[],
      totalProblems,
      totalPages,
      currentPage: query.page,
    };
  }

  async updateProblem(
    problemId: Problem["problem_id"],
    updates: UpdateProblemRequest,
  ): Promise<Problem> {
    // Check if problem exists
    const existingProblem = await DB.selectFrom("problems")
      .select("problem_id")
      .where("problem_id", "=", problemId)
      .executeTakeFirst();

    if (typeof existingProblem === "undefined") {
      throw new ApiError(404, "Problem not found");
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
      .executeTakeFirstOrThrow();

    return updatedProblem;
  }

  async deleteProblem(problemId: Problem["problem_id"]): Promise<void> {
    const result = await DB.deleteFrom("problems")
      .where("problem_id", "=", problemId)
      .executeTakeFirst();

    if (result.numDeletedRows === 0n) {
      throw new ApiError(404, "Problem not found");
    }
  }

  async checkProblemOwnership(
    problemId: Problem["problem_id"],
    userId: User["user_id"],
  ): Promise<boolean> {
    const problem = await DB.selectFrom("problems")
      .select("created_by")
      .where("problem_id", "=", problemId)
      .executeTakeFirst();

    if (typeof problem === "undefined") {
      throw new ApiError(404, "Problem not found");
    }

    return problem.created_by === userId;
  }
}

export const ProblemServiceInstance = new ProblemService();
