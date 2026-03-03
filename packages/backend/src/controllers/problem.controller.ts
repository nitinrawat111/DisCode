import { RequestHandler } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { ProblemServiceInstance } from "../services/problem.service";
import {
  CreateProblemRequest,
  UpdateProblemRequest,
  GetProblemsQuery,
} from "../dtos/problem.dto";
import { Problem, ProblemWithCreator } from "../models/problem.model";
import { UserJWTPayload } from "../types";
import { UserRole } from "../models/user.model";
import { ApiError } from "../utils/ApiError";

export type ProblemIdParam = {
  problemId: string;
};

class ProblemController {
  createProblem: RequestHandler<
    unknown,
    ApiResponse<Problem>,
    CreateProblemRequest,
    unknown,
    UserJWTPayload
  > = async (req, res) => {
    const problem = await ProblemServiceInstance.createProblem(
      req.body,
      res.locals.userId,
    );
    res
      .status(201)
      .json(new ApiResponse(201, "Problem created successfully", problem));
  };

  getProblemById: RequestHandler<
    ProblemIdParam,
    ApiResponse<ProblemWithCreator>
  > = async (req, res) => {
    const problem = await ProblemServiceInstance.getProblemById(
      req.params.problemId,
    );
    res
      .status(200)
      .json(new ApiResponse(200, "Problem fetched successfully", problem));
  };

  getProblems: RequestHandler<
    unknown,
    ApiResponse<{
      problems: ProblemWithCreator[];
      totalProblems: number;
      totalPages: number;
      currentPage: number;
    }>,
    unknown,
    GetProblemsQuery
  > = async (req, res) => {
    const result = await ProblemServiceInstance.getProblems(req.query);
    res
      .status(200)
      .json(new ApiResponse(200, "Problems fetched successfully", result));
  };

  updateProblem: RequestHandler<
    ProblemIdParam,
    ApiResponse<Problem>,
    UpdateProblemRequest,
    unknown,
    UserJWTPayload
  > = async (req, res) => {
    // Check if user has permission to update this problem
    const userRole = res.locals.role;
    const userId = res.locals.userId;
    const problemId = req.params.problemId;

    // Only allow moderators, admins, superadmins, or the creator to update
    const isCreator = await ProblemServiceInstance.checkProblemOwnership(
      problemId,
      userId,
    );

    if (
      !isCreator &&
      userRole !== UserRole.Moderator &&
      userRole !== UserRole.Admin &&
      userRole !== UserRole.SuperAdmin
    ) {
      throw new ApiError(
        403,
        "You do not have permission to update this problem",
      );
    }

    const problem = await ProblemServiceInstance.updateProblem(
      problemId,
      req.body,
    );
    res
      .status(200)
      .json(new ApiResponse(200, "Problem updated successfully", problem));
  };

  deleteProblem: RequestHandler<
    ProblemIdParam,
    ApiResponse,
    unknown,
    unknown,
    UserJWTPayload
  > = async (req, res) => {
    // Check if user has permission to delete this problem
    const userRole = res.locals.role;
    const userId = res.locals.userId;
    const problemId = req.params.problemId;

    // Only allow moderators, admins, superadmins, or the creator to delete
    const isCreator = await ProblemServiceInstance.checkProblemOwnership(
      problemId,
      userId,
    );

    if (
      !isCreator &&
      userRole !== UserRole.Moderator &&
      userRole !== UserRole.Admin &&
      userRole !== UserRole.SuperAdmin
    ) {
      throw new ApiError(
        403,
        "You do not have permission to delete this problem",
      );
    }

    await ProblemServiceInstance.deleteProblem(problemId);
    res.status(200).json(new ApiResponse(200, "Problem deleted successfully"));
  };
}

export const ProblemControllerInstance = new ProblemController();
