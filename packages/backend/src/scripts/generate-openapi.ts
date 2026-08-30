import "../setup";
import { writeFileSync } from "fs";
import { join } from "path";
import { generateOpenApiDocument } from "../docs/openapi";

const OpenAPIDoc = generateOpenApiDocument();
const OutputPath = join(__dirname, "..", "docs", "openapi.json");
writeFileSync(OutputPath, JSON.stringify(OpenAPIDoc, null, 2));
console.log(
  `OpenAPI JSON specification successfully written to: ${OutputPath}`,
);
