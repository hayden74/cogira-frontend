# CI/CD for AWS SAM–based Lambda Applications (AWS‑native)

This document summarizes common, proven CI/CD patterns that teams use for **SAM-based Lambda applications** using **only AWS services**, plus the step‑by‑step event flow from a `git push` to a deployed CloudFormation stack. It focuses on the big picture rather than edge cases and aligns well with a PoC “modular monolith” Lambda project.

---

## What most teams do (consensus patterns)

1. **Use CodePipeline to orchestrate** the end‑to‑end flow: **Source → Build → (optional) Test → Deploy** (per environment). SAM deploys via **CloudFormation**, and (optionally) **CodeDeploy** handles Lambda traffic‑shifting (canary/linear) when enabled in your SAM template.
2. **Use CodeBuild for build & test** with a standard container that includes SAM tooling. Typical steps: `sam validate`, `sam build`, run unit tests, and either create a packaged template or let deployment create/apply a change set.
3. **Bake safe deployments into the template**: define `AutoPublishAlias` and `DeploymentPreference` (e.g., `Linear10PercentEvery1Minute`) so CodeDeploy gradually shifts traffic and rolls back automatically on alarms.
4. **Separate environments as pipeline stages** (Dev → Staging → Prod). Promote the **same artifact** through stages, add a **manual approval** before Prod, and apply per‑stage parameters/roles. Many teams use **multi‑account** separation for stronger isolation.
5. **Automate quality gates**: run unit tests and template linting in Build; run quick smoke/API tests in a dedicated Test stage between Deploy stages or immediately after each deploy.
6. **Standardize pipeline creation** with **SAM Pipelines** or a shared template, then customize stages, approvals, and alarms as needed.

---

## The end‑to‑end flow (push → CloudFormation)

A typical, AWS‑only CI/CD sequence looks like this:

1. **Developer pushes to a branch** (e.g., `main`) in **CodeCommit**. The repo event triggers the **CodePipeline Source** action.
2. **CodePipeline starts** and produces an input artifact from the commit. It passes that artifact to the **CodeBuild (Build stage)**.
3. **CodeBuild runs `buildspec.yml`**. Common steps:
   - `sam validate` (sanity check the template)
   - `sam build` (resolve deps, transpile/bundle)
   - Run **unit tests** / lint
   - Optionally `sam package` to push assets to the artifact S3 bucket and output a **packaged** template (or defer packaging to Deploy).
4. **(Optional) Integration/API tests**: Add a **CodeBuild Test stage** to run smoke/contract tests (e.g., Newman/Postman) against a non‑prod environment.
5. **Deploy to the first environment (Dev)**:
   - **Option A (common):** a CodePipeline **CloudFormation Deploy** action applies the packaged template and parameters.
   - **Option B:** a CodeBuild “deploy” job runs `sam deploy --no-confirm-changeset` with appropriate parameter overrides.
6. **Safe rollout with CodeDeploy (if enabled)**: Because `AutoPublishAlias` + `DeploymentPreference` are in your SAM template, CloudFormation wires CodeDeploy to shift traffic (canary/linear). If any **CloudWatch Alarms** fire during the bake window, **CodeDeploy rolls back** automatically.
7. **Promote to next stages** (Staging → **Manual approval** → Prod): Re‑use the **same artifact** and template, provide per‑stage parameters/roles (often cross‑account assume‑role in larger setups). Run light smoke tests after each deploy.
8. **Observe & iterate**: Monitor CloudFormation stack events, CodeDeploy rollout status, CodeBuild logs, and CloudWatch logs/metrics. On failures, rollbacks occur automatically (when configured). On success, the Lambda alias reaches 100% and the pipeline completes.

---

## Practical best practices (recurring themes)

- **Declarative deployments**: keep deploy logic in SAM/CloudFormation, not bash. Use CodePipeline/CodeBuild only to invoke `sam build`/`sam deploy` or a CloudFormation action.
- **Use official SAM build images in CodeBuild** so native deps match Lambda runtimes; fewer “works on my machine” issues.
- **Traffic‑shift by default** with `DeploymentPreference` and **meaningful CloudWatch alarms**; get safe rollouts and auto‑rollback.
- **One artifact, multiple stages**: promote the same S3 artifact through Dev → Staging → Prod; add **manual approval** for Prod.
- **Parameterize everything** (stack names, VPC IDs, env vars) via `samconfig.toml`, parameter overrides, or SSM parameters.
- **Test gates**: unit tests in Build; quick smoke/integration tests post‑deploy to fail fast before real users see issues.
- **Security & provenance**: encrypt artifact buckets with KMS, use least‑privilege IAM roles for CodeBuild/CodePipeline, and stamp the **commit SHA** into an environment variable or version metadata for traceability.
- **Scale to multi‑account when ready**: start single‑account for PoC; move to **dev/test/prod accounts** with cross‑account roles as you mature.
- **Bootstrap pipelines** with **SAM Pipelines** or a shared template to speed adoption and ensure consistency.

---

## A typical `buildspec.yml` (conceptual flow)

- **Install**: usually nothing (SAM CLI and languages are in the image); optionally `npm ci`/`pnpm i --frozen-lockfile` for your code.
- **Pre‑build**: `sam validate`, run linters and **unit tests**.
- **Build**: `sam build` (use `--use-container` if you rely on native deps).
- **Package/Deploy**: either
  - Export a **packaged template** as the pipeline artifact for a CloudFormation Deploy action, or
  - Run `sam deploy --no-confirm-changeset` in a Deploy stage with parameter overrides and a dedicated IAM role.

---

## Why this fits a PoC “modular monolith” Lambda

- **Fast iterations** with a single artifact and simple pipeline.
- **Safety** via CodeDeploy canaries/linear shifts and auto‑rollback.
- **Observability & auditability** within AWS (CloudWatch, CodeBuild logs, stack events).
- **Easy evolution** to multi‑env and multi‑account without redesigning the core pipeline.

---

## Questions to tailor your pipeline

- **Source**: Will you use **CodeCommit** (preferred for AWS‑only) or another provider?
- **Rollout strategy**: Do you want **traffic‑shifting** (e.g., Linear 10%/min) enabled from day one?
- **Environments**: Start **single account** (Dev/Prod stages) or go **multi‑account** immediately (dev/test/prod)?
