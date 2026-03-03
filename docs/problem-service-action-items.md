# Problem Service - Action Items

## Overview
This document outlines the actionable items needed to fix and improve the Problem Service based on compile errors and coding guidelines review.

---

## Compile Errors (Must Fix)

### 1. Missing `ProblemWithCreator` Type Export
- [ ] **Add `ProblemWithCreator` type to `problem.model.ts`**
  - Create a type that extends `Problem` with `creator_username: string | null`
  - Export it from the model file

### 2. `ApiResponse` Constructor Signature Mismatch
The `ApiResponse` class requires 4 arguments (`statusCode`, `message`, `data`, `errors`), but the controller is passing 2-3 arguments.

- [ ] **Update `ApiResponse` class to support optional `data` and `errors` parameters**
  - Add default values: `data = null`, `errors = null`
  - This aligns with how `user.controller.ts` uses `ApiResponse` (which has no errors)

### 3. `createProblem` Service Return Type
- [ ] **Update `createProblem` in `problem.service.ts` to return the created `Problem`**
  - Currently returns `void`, but controller expects `Problem`
  - Use `.returningAll()` in the Kysely insert query

---

## Bug Fixes (Code Logic Issues)

### 4. Variable Name Mismatch in `getProblemById`
- [ ] **Fix undefined variable reference in `problem.service.ts` line ~50**
  - `matchedProblem` is declared but `problem` is checked/returned
  - Change references from `problem` to `matchedProblem`

---

## Style Guide Compliance

### 5. Use Explicit Type Checks (Rule #3)
- [ ] **Already following `typeof x === "undefined"` pattern** ✅
  - Service correctly uses explicit type checks

### 6. Avoid Magic Strings (Rule #8)
- [ ] **Verify all difficulty values use `ProblemDifficulty` enum** ✅
  - Already using the enum from model

### 7. Named Exports Only (Rule #6)
- [ ] **Verify no default exports** ✅
  - All exports are named exports

---

## Summary

| Priority | Item | File(s) |
|----------|------|---------|
| 🔴 High | Add `ProblemWithCreator` type | `problem.model.ts` |
| 🔴 High | Fix `ApiResponse` constructor args | `ApiResponse.ts` |
| 🔴 High | Fix `createProblem` return type | `problem.service.ts` |
| 🔴 High | Fix `matchedProblem` variable name | `problem.service.ts` |

---

**Next Steps:** Confirm these items before proceeding with implementation.
