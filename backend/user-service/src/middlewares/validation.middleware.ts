import { RequestHandler } from "express";
import { z, ZodObject } from "zod/v4";

export type ValidationTarget = "body" | "query";

export function getBodyValidationMiddleware<
  ReqParamsType,
  ResBodyType,
  ReqQueryType,
  ResLocalsType,
  SchemaType extends ZodObject,
>(schema: SchemaType) {
  const validationMiddeware: RequestHandler<
    ReqParamsType,
    ResBodyType,
    z.infer<typeof schema>,
    ReqQueryType,
    ResLocalsType
  > = (req, _res, next) => {
    req.body = schema.parse(req.body);
    next();
  };

  return validationMiddeware;
}

export function getQueryValidationMiddleware<
  ReqParamsType,
  ResBodyType,
  ReqBodyType,
  ResLocalsType,
  SchemaType extends ZodObject,
>(schema: SchemaType) {
  const validationMiddeware: RequestHandler<
    ReqParamsType,
    ResBodyType,
    ReqBodyType,
    z.infer<typeof schema>,
    ResLocalsType
  > = (req, _res, next) => {
    req.query = schema.parse(req.body);
    next();
  };

  return validationMiddeware;
}
