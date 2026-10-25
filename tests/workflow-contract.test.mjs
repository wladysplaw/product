import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const workflowPath = path.resolve(testDirectory, "../.github/workflows/deploy.yml");

function workflowJob(workflow, jobName) {
  const header = `  ${jobName}:\n`;
  const jobStart = workflow.indexOf(header);

  assert.notEqual(jobStart, -1, `workflow must define the ${jobName} job`);

  const bodyStart = jobStart + header.length;
  const nextJobOffset = workflow.slice(bodyStart).search(/\n {2}[^\s]/);

  return nextJobOffset === -1
    ? workflow.slice(bodyStart)
    : workflow.slice(bodyStart, bodyStart + nextJobOffset);
}

test("Pages workflow builds the static site and deploys only its dist artifact", () => {
  const workflow = readFileSync(workflowPath, "utf8");
  const buildJob = workflowJob(workflow, "build");
  const deployJob = workflowJob(workflow, "deploy");

  assert.match(workflow, /push:\s*\n\s+branches:\s*\n\s+- main/, "workflow must deploy pushes to main");
  assert.match(workflow, /workflow_dispatch:/, "workflow must allow a manual deployment");
  assert.match(workflow, /contents:\s*read/, "workflow must grant read-only source access");
  assert.match(workflow, /pages:\s*write/, "workflow must grant Pages deployment access");
  assert.match(workflow, /id-token:\s*write/, "workflow must grant the Pages identity token");
  assert.match(workflow, /npm ci/, "workflow must install from the lockfile");
  assert.match(buildJob, /run: npm run build/, "workflow must build the static artifact");
  assert.match(buildJob, /run: npm test/, "workflow must validate the built artifact before upload");
  assert.match(workflow, /actions\/configure-pages@/, "workflow must configure Pages before building");
  assert.match(
    buildJob,
    /uses: actions\/upload-pages-artifact@[^\n]+\n\s+with:\n\s+path:\s*dist\/?\s*$/m,
    "the Pages artifact action must receive only the generated dist directory"
  );
  assert.match(deployJob, /^    needs:\s*build\s*$/m, "deployment must wait for the build artifact");
  assert.match(deployJob, /uses: actions\/deploy-pages@/, "workflow must deploy the uploaded artifact");
  assert.ok(
    buildJob.indexOf("run: npm run build") < buildJob.indexOf("run: npm test") &&
      buildJob.indexOf("run: npm test") < buildJob.indexOf("uses: actions/upload-pages-artifact@"),
    "workflow must test the built artifact before uploading it"
  );
  assert.doesNotMatch(
    workflow,
    /actions-gh-pages|git\s+push|gh-pages\s+branch/i,
    "workflow must not publish generated files through a branch"
  );
});
