import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { SERVICE_NAME } from "../constants";
import {
  RegisterRequestDto,
  LoginRequestDto,
  ChangeRoleRequestDto,
  UpdateProfileRequestDto,
  UsernameDto,
  UserIdDto,
  UserRoleDto,
  EmailDto,
} from "../dtos/user.dto";
import {
  CreateProblemRequestDto,
  UpdateProblemRequestDto,
  GetProblemsQueryDto,
  ProblemTitleDto,
  MarkdownKeyDto,
  TestKeysDto,
  ProblemDifficultyDto,
} from "../dtos/problem.dto";
import {
  CreateSubmissionRequestDto,
  GetSubmissionsFilterQueryDto,
  SubmissionKeyDto,
  SubmissionLanguageDto,
  SubmissionStatusDto,
} from "../dtos/submission.dto";

// Shared OpenAPI Registry instance
const Registry = new OpenAPIRegistry();

// Register security scheme for Bearer JWT auth
const BearerAuthComponent = Registry.registerComponent(
  "securitySchemes",
  "bearerAuth",
  {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "JWT access token returned in the Authorization header",
  },
);

// Helper for API response schema
function createApiResponseSchema<T extends z.ZodTypeAny>(
  dataSchema?: T,
  description?: string,
) {
  return z
    .object({
      success: z.boolean().openapi({ example: true }),
      message: z.string().openapi({ example: "Operation successful" }),
      ...(dataSchema !== undefined ? { data: dataSchema } : {}),
      errors: z.unknown().optional(),
    })
    .openapi({ description });
}

// Generic error response schema
const ApiErrorResponseSchema = Registry.register(
  "ApiErrorResponse",
  z.object({
    success: z.boolean().openapi({ example: false }),
    message: z.string().openapi({ example: "Error message" }),
    errors: z.unknown().optional(),
  }),
);

// ==========================================
// User Schemas & Routes
// ==========================================
export const RegisterRequestSchema = Registry.register(
  "RegisterRequest",
  RegisterRequestDto,
);

export const LoginRequestSchema = Registry.register(
  "LoginRequest",
  LoginRequestDto,
);

export const ChangeRoleRequestSchema = Registry.register(
  "ChangeRoleRequest",
  ChangeRoleRequestDto,
);

export const UpdateProfileRequestSchema = Registry.register(
  "UpdateProfileRequest",
  UpdateProfileRequestDto,
);

export const UserProfileSchema = Registry.register(
  "UserProfile",
  z.object({
    user_id: UserIdDto,
    username: UsernameDto,
    email: EmailDto,
    bio: z.string().nullable(),
    avatar_url: z.string().nullable(),
    role: UserRoleDto,
    created_at: z.string().datetime().or(z.date()),
  }),
);

export const UserRoleResponseSchema = Registry.register(
  "UserRoleResponse",
  z.object({
    role: UserRoleDto,
  }),
);

// Register User Endpoints
Registry.registerPath({
  method: "post",
  path: "/api/v1/users/register",
  summary: "Register a new user",
  tags: ["Users"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: RegisterRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Registration successful",
      content: {
        "application/json": {
          schema: createApiResponseSchema(
            undefined,
            "Registration successful response",
          ),
        },
      },
    },
    400: {
      description: "Invalid request body (validation error)",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
    409: {
      description: "Username or email already exists",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
  },
});

Registry.registerPath({
  method: "post",
  path: "/api/v1/users/login",
  summary: "Log in a user and return an access token",
  tags: ["Users"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Login successful, returns access token in Authorization header",
      headers: {
        Authorization: {
          schema: {
            type: "string",
            example: "Bearer eyJhbG...",
            description: "JWT access token (must be sent as Authorization header on subsequent requests)",
          },
        },
      },
      content: {
        "application/json": {
          schema: createApiResponseSchema(
            undefined,
            "Login successful response",
          ),
        },
      },
    },
    400: {
      description: "Invalid request body (validation error)",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Incorrect password",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Email not found",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
  },
});

Registry.registerPath({
  method: "get",
  path: "/api/v1/users/profile",
  summary: "Get the profile of the logged-in user",
  tags: ["Users"],
  security: [{ [BearerAuthComponent.name]: [] }],
  responses: {
    200: {
      description: "User profile fetched successfully",
      content: {
        "application/json": {
          schema: createApiResponseSchema(UserProfileSchema),
        },
      },
    },
    401: {
      description: "Unauthorized (missing or invalid access token)",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
    404: {
      description: "User not found",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
  },
});

Registry.registerPath({
  method: "get",
  path: "/api/v1/users/profile/{userId}",
  summary: "Get a user's profile by ID",
  tags: ["Users"],
  request: {
    params: z.object({
      userId: z.coerce
        .number()
        .int()
        .positive()
        .openapi({
          param: {
            name: "userId",
            in: "path",
            required: true,
            description: "The ID of the user to fetch",
          },
        }),
    }),
  },
  responses: {
    200: {
      description: "User profile fetched successfully",
      content: {
        "application/json": {
          schema: createApiResponseSchema(UserProfileSchema),
        },
      },
    },
    400: {
      description: "Invalid userId",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
    404: {
      description: "User not found",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
  },
});

Registry.registerPath({
  method: "patch",
  path: "/api/v1/users/profile",
  summary: "Update the logged-in user's profile",
  tags: ["Users"],
  security: [{ [BearerAuthComponent.name]: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateProfileRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Profile updated successfully",
      content: {
        "application/json": {
          schema: createApiResponseSchema(undefined, "Profile update response"),
        },
      },
    },
    400: {
      description: "Invalid request body (validation error)",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized (missing or invalid access token)",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
    409: {
      description: "Username already exists",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
  },
});

Registry.registerPath({
  method: "get",
  path: "/api/v1/users/role/{userId}",
  summary: "Get a user's role by ID",
  tags: ["Users"],
  request: {
    params: z.object({
      userId: z.coerce
        .number()
        .int()
        .positive()
        .openapi({
          param: {
            name: "userId",
            in: "path",
            required: true,
            description: "The ID of the user whose role is to be fetched",
          },
        }),
    }),
  },
  responses: {
    200: {
      description: "User role fetched successfully",
      content: {
        "application/json": {
          schema: createApiResponseSchema(UserRoleResponseSchema),
        },
      },
    },
    400: {
      description: "Invalid userId",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
    404: {
      description: "User not found",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
  },
});

Registry.registerPath({
  method: "put",
  path: "/api/v1/users/role/{userId}",
  summary: "Change a user's role (requires sufficient privileges)",
  tags: ["Users"],
  security: [{ [BearerAuthComponent.name]: [] }],
  request: {
    params: z.object({
      userId: z.coerce
        .number()
        .int()
        .positive()
        .openapi({
          param: {
            name: "userId",
            in: "path",
            required: true,
            description: "The ID of the user whose role is to be changed",
          },
        }),
    }),
    body: {
      content: {
        "application/json": {
          schema: ChangeRoleRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Role changed successfully",
      content: {
        "application/json": {
          schema: createApiResponseSchema(undefined, "Role change response"),
        },
      },
    },
    400: {
      description: "Invalid request body or userId",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized (missing or invalid access token)",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
    403: {
      description: "Forbidden (insufficient privileges)",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Target user not found",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
  },
});

// ==========================================
// Problem Schemas & Routes
// ==========================================
export const CreateProblemRequestSchema = Registry.register(
  "CreateProblemRequest",
  CreateProblemRequestDto,
);

export const UpdateProblemRequestSchema = Registry.register(
  "UpdateProblemRequest",
  UpdateProblemRequestDto,
);

export const ProblemSchema = Registry.register(
  "Problem",
  z.object({
    problem_id: z.string().uuid().openapi({ description: "Problem UUID" }),
    title: ProblemTitleDto,
    markdown_key: MarkdownKeyDto,
    test_keys: TestKeysDto,
    difficulty: ProblemDifficultyDto,
    tags: z.array(z.string()),
    created_by: UserIdDto,
    created_at: z.string().datetime().or(z.date()),
    updated_at: z.string().datetime().or(z.date()),
  }),
);

export const ProblemWithCreatorSchema = Registry.register(
  "ProblemWithCreator",
  ProblemSchema.extend({
    creator_username: UsernameDto,
  }),
);

export const GetProblemsResponseSchema = Registry.register(
  "GetProblemsResponse",
  z.object({
    problems: z.array(ProblemWithCreatorSchema),
    totalProblems: z.number().int().openapi({ example: 100 }),
    totalPages: z.number().int().openapi({ example: 10 }),
    currentPage: z.number().int().openapi({ example: 1 }),
  }),
);

// Register Problem Endpoints
Registry.registerPath({
  method: "post",
  path: "/api/v1/problems",
  summary: "Create a new problem",
  tags: ["Problems"],
  security: [{ [BearerAuthComponent.name]: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateProblemRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Problem created successfully",
      content: {
        "application/json": {
          schema: createApiResponseSchema(ProblemSchema),
        },
      },
    },
    400: {
      description: "Invalid request body (validation error)",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized (missing or invalid access token)",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
    403: {
      description: "Forbidden (insufficient permissions)",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
  },
});

Registry.registerPath({
  method: "get",
  path: "/api/v1/problems",
  summary: "Get problems with optional filtering and pagination",
  tags: ["Problems"],
  request: {
    query: GetProblemsQueryDto,
  },
  responses: {
    200: {
      description: "Problems fetched successfully",
      content: {
        "application/json": {
          schema: createApiResponseSchema(GetProblemsResponseSchema),
        },
      },
    },
    400: {
      description: "Invalid query parameters",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
  },
});

Registry.registerPath({
  method: "get",
  path: "/api/v1/problems/{problemId}",
  summary: "Get a problem by ID",
  tags: ["Problems"],
  request: {
    params: z.object({
      problemId: z
        .string()
        .uuid()
        .openapi({
          param: {
            name: "problemId",
            in: "path",
            required: true,
            description: "Problem ID",
          },
        }),
    }),
  },
  responses: {
    200: {
      description: "Problem fetched successfully",
      content: {
        "application/json": {
          schema: createApiResponseSchema(ProblemWithCreatorSchema),
        },
      },
    },
    404: {
      description: "Problem not found",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
  },
});

Registry.registerPath({
  method: "patch",
  path: "/api/v1/problems/{problemId}",
  summary: "Update a problem",
  tags: ["Problems"],
  security: [{ [BearerAuthComponent.name]: [] }],
  request: {
    params: z.object({
      problemId: z
        .string()
        .uuid()
        .openapi({
          param: {
            name: "problemId",
            in: "path",
            required: true,
            description: "Problem ID",
          },
        }),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateProblemRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Problem updated successfully",
      content: {
        "application/json": {
          schema: createApiResponseSchema(ProblemSchema),
        },
      },
    },
    400: {
      description: "Invalid request body (validation error)",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized (missing or invalid access token)",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
    403: {
      description: "Forbidden (insufficient permissions)",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Problem not found",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
  },
});

Registry.registerPath({
  method: "delete",
  path: "/api/v1/problems/{problemId}",
  summary: "Delete a problem",
  tags: ["Problems"],
  security: [{ [BearerAuthComponent.name]: [] }],
  request: {
    params: z.object({
      problemId: z
        .string()
        .uuid()
        .openapi({
          param: {
            name: "problemId",
            in: "path",
            required: true,
            description: "Problem ID",
          },
        }),
    }),
  },
  responses: {
    200: {
      description: "Problem deleted successfully",
      content: {
        "application/json": {
          schema: createApiResponseSchema(undefined, "Problem delete response"),
        },
      },
    },
    401: {
      description: "Unauthorized (missing or invalid access token)",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
    403: {
      description: "Forbidden (insufficient permissions)",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Problem not found",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
  },
});

// ==========================================
// Submission Schemas & Routes
// ==========================================
export const CreateSubmissionRequestSchema = Registry.register(
  "CreateSubmissionRequest",
  CreateSubmissionRequestDto,
);

export const SubmissionSchema = Registry.register(
  "Submission",
  z.object({
    submission_id: z.number().int().openapi({ example: 1 }),
    user_id: UserIdDto,
    problem_id: z.string(),
    submission_key: SubmissionKeyDto,
    language: SubmissionLanguageDto,
    status: SubmissionStatusDto,
    executed_at: z.string().datetime().nullable().or(z.date().nullable()),
    completed_at: z.string().datetime().nullable().or(z.date().nullable()),
    created_at: z.string().datetime().or(z.date()),
    updated_at: z.string().datetime().or(z.date()),
  }),
);

export const GetSubmissionsResponseSchema = Registry.register(
  "GetSubmissionsResponse",
  z.object({
    submissions: z.array(SubmissionSchema),
    totalSubmissions: z.number().int().openapi({ example: 10 }),
    totalPages: z.number().int().openapi({ example: 1 }),
    currentPage: z.number().int().openapi({ example: 1 }),
  }),
);

// Register Submission Endpoints
Registry.registerPath({
  method: "post",
  path: "/api/v1/submissions",
  summary: "Create a new code submission",
  tags: ["Submissions"],
  security: [{ [BearerAuthComponent.name]: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateSubmissionRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Submission created successfully",
      content: {
        "application/json": {
          schema: createApiResponseSchema(SubmissionSchema),
        },
      },
    },
    400: {
      description: "Invalid request body (validation error)",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized (missing or invalid access token)",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Problem not found",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
  },
});

Registry.registerPath({
  method: "get",
  path: "/api/v1/submissions",
  summary: "Get submissions by problemId or userId",
  tags: ["Submissions"],
  security: [{ [BearerAuthComponent.name]: [] }],
  request: {
    query: GetSubmissionsFilterQueryDto,
  },
  responses: {
    200: {
      description: "Submissions fetched successfully",
      content: {
        "application/json": {
          schema: createApiResponseSchema(GetSubmissionsResponseSchema),
        },
      },
    },
    400: {
      description: "Invalid query parameters",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized (missing or invalid access token)",
      content: {
        "application/json": {
          schema: ApiErrorResponseSchema,
        },
      },
    },
  },
});

// ==========================================
// JWKS Schemas & Routes
// ==========================================
Registry.registerPath({
  method: "get",
  path: "/api/v1/jwks",
  summary: "Get JSON Web Key Set (JWKS)",
  tags: ["Auth"],
  responses: {
    200: {
      description: "JWKS public keys",
      content: {
        "application/json": {
          schema: z.object({
            keys: z.array(z.record(z.string(), z.unknown())),
          }),
        },
      },
    },
  },
});

// Generate OpenAPI Spec Document
export function generateOpenApiDocument(): ReturnType<
  OpenApiGeneratorV3["generateDocument"]
> {
  const generator = new OpenApiGeneratorV3(Registry.definitions);
  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: SERVICE_NAME,
      version: "1.0.0",
    },
    servers: [
      {
        url: "/",
        description: SERVICE_NAME,
      },
    ],
  });
}
