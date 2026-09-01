/**
 * Orval configuration for generating the typed API client from the backend OpenAPI spec
 *
 * NOTE: Operation IDs in the spec drive generated function/hook names and the
 * React Query query keys (when useOperationIdAsQueryKey is enabled). Keep them stable.
 * See: https://orval.dev/docs/reference/configuration/output#useoperationidasquerykey
 */
import {
  defineConfig,
  OutputClient,
  OutputHttpClient,
  OutputMode,
  SupportedFormatter,
} from "orval";

export default defineConfig({
  discode: {
    input: {
      target: "../backend/src/docs/openapi.json",
    },
    output: {
      workspace: "./src/api",
      target: "./",
      client: OutputClient.REACT_QUERY,
      httpClient: OutputHttpClient.FETCH,
      mode: OutputMode.TAGS_SPLIT,
      indexFiles: true,
      formatter: SupportedFormatter.PRETTIER,
      mock: {
        generators: [{ type: "faker" }],
      },
      override: {
        enumGenerationType: "const",
        mutator: {
          // Custom fetcher that resolves the backend origin from env and injects
          path: "./fetcher.ts",
          name: "customFetch",
        },
      },
    },
  },
  discodeZod: {
    input: {
      target: "../backend/src/docs/openapi.json",
    },
    output: {
      workspace: "./src/api/zod",
      target: "./",
      client: OutputClient.ZOD,
      mode: OutputMode.TAGS_SPLIT,
      indexFiles: true,
      fileExtension: ".zod.ts",
      formatter: SupportedFormatter.PRETTIER,
      override: {
        enumGenerationType: "const",
      },
    },
  },
});
