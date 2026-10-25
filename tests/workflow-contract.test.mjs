import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const workflowPath = path.resolve(testDirectory, "../.github/workflows/deploy.yml");

test("Pages workflow builds the static site and deploys only its dist artifact", () => {
  const workflow = readFileSync(workflowPath, "utf8");

  assert.match(workflow, /push:\s*\n\s+branches:\s*\n\s+- main/, "workflow must deploy pushes to main");
  assert.match(workflow, /workflow_dispatch:/, "workflow must allow a manual deployment");
  assert.match(workflow, /contents:\s*read/, "workflow must grant read-only source access");
  assert.match(workflow, /pages:\s*write/, "workflow must grant Pages deployment access");
  assert.match(workflow, /id-token:\s*write/, "workflow must grant the Pages identity token");
  assert.match(workflow, /npm ci/, "workflow must install from the lockfile");
  assert.match(workflow, /npm run build/, "workflow must build the static artifact");
  assert.match(workflow, /actions\/configure-pages@/, "workflow must configure Pages before building");
  assert.match(workflow, /actions\/upload-pages-artifact@/, "workflow must upload a Pages artifact");
  assert.match(workflow, /path:\s*dist\/?/, "workflow must upload only the generated dist directory");
  assert.match(workflow, /actions\/deploy-pages@/, "workflow must deploy the uploaded artifact");
});
