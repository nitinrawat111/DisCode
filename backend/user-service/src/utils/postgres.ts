import { DatabaseError } from "pg";

/**
 * Returns true if the error is caused because if inserting a duplicate value in unique field
 * @param err The error object
 * @returns true if error is a duplicate key error, otherwise returns false
 */
export function isDuplicateKeyError(error: unknown): error is DatabaseError {
  return error instanceof DatabaseError && error.code == "23505";
}
