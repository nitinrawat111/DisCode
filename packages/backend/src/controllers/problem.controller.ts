import { RequestHandler } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { ProblemServiceInstance } from "../services/problem.service";
import { Problem, ProblemWithCreator } from "../models/problem.model";
import { UserJWTPayload } from "../types";
import {
  CreateProblemRequest,
  GetProblemsQuery,
  UpdateProblemRequest,
} from "../dtos/problem.dto";

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
    const problem = await ProblemServiceInstance.updateProblem(
      req.params.problemId,
      res.locals.userId,
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
    await ProblemServiceInstance.deleteProblem(
      req.params.problemId,
      res.locals.userId,
    );
    res.status(200).json(new ApiResponse(200, "Problem deleted successfully"));
  };
}

export const ProblemControllerInstance = new ProblemController();
