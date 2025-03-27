import ApiResponse from '../utils/ApiResponse';
import { Request, Response, NextFunction } from 'express';
import { problemServiceInstance } from '../services/problem.service';
import { AuthenticatedRequest } from '../types/types';

export class ProblemController {
  async createProblem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const problem = await problemServiceInstance.createProblem(req.body, req.user?.userId);
    res.status(201).json(new ApiResponse(201, 'Problem created successfully', problem));
  }
  
  async updateProblem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const problem = await problemServiceInstance.updateProblem(req.params.problemId, req.body);
    res.status(200).json(new ApiResponse(200, 'Problem updated successfully', problem));
  }

  async getProblemById(req: Request, res: Response, next: NextFunction) {
    const problem = await problemServiceInstance.getProblemById(req.params.problemId);
    res.status(200).json(new ApiResponse(200, 'Problem fetched successfully', problem));
  }

  async getProblems(req: Request, res: Response, next: NextFunction) {
    const result = await problemServiceInstance.getProblems(req.query);
    res.status(200).json(new ApiResponse(200, 'Problems fetched successfully', result));
  }
}

export const problemControllerInstance = new ProblemController();