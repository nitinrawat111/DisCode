/**
 * This file should be imported before any other file in server.ts.
 * This ideally contains setup/config needed before other modules can be excuted.
 */

import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Extend Zod with OpenAPI methods
extendZodWithOpenApi(z);
