import zod from 'zod';
import ApiError from '../utils/ApiError';
import Problem from '../models/problem.model';
import { createProblemDto } from '../dtos/create-problem.dto';
import { updateProblemDto } from '../dtos/update-problem.dto';
import { problemIdDto } from '../dtos/problem.dto';
import { userIdDto } from '../dtos/user.dto';
import { getProblemsQueryDto } from '../dtos/get-problems-query.dto';

export class ProblemService {
  async createProblem(problemDetails: zod.infer<typeof createProblemDto>, userId: number) {
    const validatedProblem = createProblemDto.parse(problemDetails);
    const validatedUserId = userIdDto.parse(userId);
    const newProblem = await Problem.create({ ...validatedProblem, createdBy: validatedUserId });
    return newProblem;
  }
  
  async updateProblem(problemId: string, updates: zod.infer<typeof updateProblemDto>) {
    const validatedProblemId = problemIdDto.parse(problemId);
    const validatedUpdates = updateProblemDto.parse(updates);
    const updatedProblem = await Problem.findOneAndUpdate(
      { problem_id: validatedProblemId },
      validatedUpdates,
      { new: true }
    );

    if (!updatedProblem) {
      throw new ApiError(404, 'Problem not found');
    }
    
    return updatedProblem;
  }
  
  async getProblemById(problemId: string) {
    const validatedProblemId = problemIdDto.parse(problemId);
    const problem = await Problem.findOne({ problem_id: validatedProblemId });
    if (!problem) {
      throw new ApiError(404, 'Problem not found');
    }
    return problem;
  }

  async getProblems(query: zod.infer<typeof getProblemsQueryDto>) {
    const { searchQuery, tags, difficulty, limit, cursor, sort } = getProblemsQueryDto.parse(query);
    const isRelevancySort = sort === 'relevancy' && searchQuery;
    
    // Base query
    const filter: any = {};

    if (searchQuery) {
      filter.$text = { $search: searchQuery };
    }

    if (tags) {
      filter.tags = { $all: tags };
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    // Cursor-based pagination
    const paginationFilter: any = {};
    if (cursor) {
      const [lastScore, lastId] = cursor.split('_');

      if(isNaN(parseFloat(lastScore)) || !lastId) {
        throw new ApiError(400, 'Invalid cursor');
      }

      if (isRelevancySort) {
        paginationFilter.$or = [
          { score: { $lt: parseFloat(lastScore) } },
          { score: parseFloat(lastScore), problem_id: { $lt: lastId } },
        ];
      } else {
        paginationFilter.problem_id =  { $lt: lastId };
      }
    }

    // Combined filters
    const combinedFilter = { ...filter, ...paginationFilter };

    // Sorting
    const sortOptions: any = {};
    if (isRelevancySort) {
      sortOptions.score = -1;
      sortOptions.problem_id = -1;
    } else {
      sortOptions.problem_id = -1;
    }

    // Query the database
    const problems = await Problem.find(combinedFilter)
      .sort(sortOptions)
      .limit(limit + 1) // Fetch one extra to check if there's a next page
      .select(isRelevancySort ? { textSearchScore: { $meta: 'textScore' } } : {}) // Include text search score if sorting by relevancy
      .lean();

    // Determine if there's a next page
    const hasNextPage = problems.length > limit;
    let nextPageCursor: string | undefined = undefined;
    if (hasNextPage) {
      // Remove the extra item
      problems.pop();
      
      // Construct the cursor for next page
      const lastProblem = problems[problems.length - 1];
      if (isRelevancySort) {
        nextPageCursor = `${lastProblem.textSearchScore}_${lastProblem.problem_id}`;
      } else {
        nextPageCursor = `0_${lastProblem.problem_id}`;
      }
    }

    return {
      problems,
      nextPageCursor,
      hasNextPage
    };
  }
}

export const problemServiceInstance = new ProblemService();