---
description: Review a pull request or diff for loxchi-s repositories and report findings ranked by severity, with evidence and suggested fixes.
---

# Code review

Use this when someone asks you to review a pull request, a branch, or a diff. It builds on `code__review`: load that skill as well for the general method, and apply the house rules below.

## 1. Get the change

- On a GitHub pull request turn the diff is already in context and the repo is at `/workspace`.
- Otherwise work in `/workspace/repos/<repo>` (for `loxchi-s/loxchi-agent` this is `/workspace/repos/loxchi-agent`). Fetch the branch with `git__gh pr checkout <number>` or `git fetch origin <branch>` and diff against the base with `git diff origin/main...HEAD`.
- Read the pull request description and linked issues so you know what the change claims to do.

## 2. Check, in this order

1. **Correctness**: does the code do what the description says? Trace changed functions to their callers. Look for off-by-one errors, missing `await`, unhandled `null`/`undefined`, and broken error paths.
2. **Security**: secrets in code or logs, unvalidated input, SQL or shell injection, missing auth or ownership checks, credentials that leave the network policy.
3. **Tests**: run `run_tests` on the repo. Report the exit code. If tests are missing for new behavior, say which case is uncovered.
4. **Types and build**: run the repo's typecheck (for this agent repo, `pnpm typecheck`) and `eve build` when `agent/` changed.
5. **UI changes**: when the change touches a web page, open it with the `browser__*` tools, take a snapshot, and check the affected flow.
6. **Readability**: naming, dead code, and comments that restate the code. Only mention these when they get in the way.

## 3. Report

Lead with a one-line verdict: **Approve**, **Approve with nits**, or **Request changes**.

Then list findings grouped by severity:

- **Blocker**: wrong behavior, security risk, or failing tests.
- **Should fix**: likely bug or missing test.
- **Nit**: style or minor clarity.

For each finding give `path:line`, what is wrong, the evidence (test output, a trace, or a quoted line), and a concrete fix. Mark anything you inferred without checking as unverified.

End with what you ran (tests, typecheck, browser checks) and their results. Do not post the review again with `gh` on a GitHub turn; your final message is the comment.
