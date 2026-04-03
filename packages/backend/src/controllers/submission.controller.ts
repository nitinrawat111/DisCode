import { RequestHandler } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { SubmissionServiceInstance } from "../services/submission.service";
import { Submission } from "../models/submission.model";
import { UserJWTPayload } from "../types";
import {
  CreateSubmissionRequest,
  GetSubmissionsQuery,
  UpdateSubmissionRequest,
} from "../dtos/submission.dto";

export type SubmissionIdParam = {
  submissionId: string;
};

class SubmissionController {
  createSubmission: RequestHandler<
    unknown,
    ApiResponse<Submission>,
    CreateSubmissionRequest,
    unknown,
    UserJWTPayload
  > = async (req, res) => {
    const submission = await SubmissionServiceInstance.createSubmission(
      req.body,
      res.locals.userId,
    );
    res
      .status(201)
      .json(new ApiResponse(201, "Submission created successfully", submission));
  };

  getSubmissionById: RequestHandler<
    SubmissionIdParam,
    ApiResponse<Submission>
  > = async (req, res) => {
    const submissionId = parseInt(req.params.submissionId, 10);
    const submission =
      await SubmissionServiceInstance.getSubmissionById(submissionId);
    res
      .status(200)
      .json(
        new ApiResponse(200, "Submission fetched successfully", submission),
      );
  };

  getSubmissions: RequestHandler<
    unknown,
    ApiResponse<{
      submissions: Submission[];
      totalSubmissions: number;
      totalPages: number;
      currentPage: number;
    }>,
    unknown,
    GetSubmissionsQuery
  > = async (req, res) => {
    const result = await SubmissionServiceInstance.getSubmissions(req.query);
    res
      .status(200)
      .json(
        new ApiResponse(200, "Submissions fetched successfully", result),
      );
  };

  updateSubmission: RequestHandler<
    unknown,
    ApiResponse,
    UpdateSubmissionRequest
  > = async (req, res) => {
    await SubmissionServiceInstance.updateSubmission(req.body);
    res
      .status(200)
      .json(new ApiResponse(200, "Submission updated successfully"));
  };
}

export const SubmissionControllerInstance = new SubmissionController();
