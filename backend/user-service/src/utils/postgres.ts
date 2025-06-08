import * as pg from "pg";

/**
 * Returns true if the error is caused because if inserting a duplicate value in unique field
 * @param err The error object
 * @returns true if error is a duplicate key error, otherwise retruns false
 */
export function isDuplicateKeyError(err: any) {
  return err instanceof pg.DatabaseError && err.code == "23505";
}
