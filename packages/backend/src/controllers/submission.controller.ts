import { RequestHandler } from "express";
import {
  CreateSubmissionRequest,
  GetSubmissionsFilterQuery,
  GetSubmissionsResponse,
} from "../dtos/submission.dto";
import { Submission } from "../models/submission.model";
import { SubmissionServiceInstance } from "../services/submission.service";
import { UserJWTPayload } from "../types";
import { ApiResponse } from "../utils/ApiResponse";

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
      .json(
        new ApiResponse(201, "Submission created successfully", submission),
      );
  };

  getSubmissions: RequestHandler<
    unknown,
    ApiResponse<GetSubmissionsResponse>,
    unknown,
    GetSubmissionsFilterQuery,
    UserJWTPayload
  > = async (req, res) => {
    const result = await SubmissionServiceInstance.getSubmissions(req.query);

    res
      .status(200)
      .json(new ApiResponse(200, "Submissions fetched successfully", result));
  };
}

export const SubmissionControllerInstance = new SubmissionController();
