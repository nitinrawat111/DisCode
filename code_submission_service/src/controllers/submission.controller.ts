import { NextFunction, Request, Response } from "express";
import ApiResponse from "../utils/ApiResponse";
import { submissionServiceInstance } from "../services/submission.service";
import { AuthenticatedRequest } from "../types/types";

export class SubmissionController {
  async createSubmission(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const submission = await submissionServiceInstance.createSubmission(req.body, req.user.userId);
    res.status(201).json(new ApiResponse(201, "Submission created successfully", submission));
  }

  async updateSubmission(req: Request, res: Response, next: NextFunction) {
    await submissionServiceInstance.updateSubmission(req.body);
    res.status(200).json(new ApiResponse(200, "Submission updated successfully"));
  }

  async getSubmissionById(req: Request, res: Response, next: NextFunction) {
    const submissionId = parseInt(req.params.submissionId);
    const submission = await submissionServiceInstance.getSubmissionById(submissionId);
    res.status(200).json(new ApiResponse(200, "Submission fetched successfully", submission));
  }

  async getSubmissions(req: Request, res: Response, next: NextFunction) {
    const result = await submissionServiceInstance.getSubmissions(req.query);
    res.status(200).json(new ApiResponse(200, "Submissions fetched successfully", result));
  }
}

export const submissionControllerInstance = new SubmissionController();