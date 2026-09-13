---
name: vesact-review-pr
description: "Use before opening a code pull request: an independent review of the branch against its issue, where every finding is verified before it is reported and fixes land in the same PR."
---

# Review a branch before its pull request

The person who wrote the branch reviews it with the same blind spots; a
subagent with fresh context does not. Unverified LLM findings are mostly
noise, so every candidate is checked by another fresh agent before anyone
reads it. `reviewing-a-pr` lists what a reviewer looks at in this
repository; this skill is the procedure around it.

## When

Every code PR that changes more than three files, or any file under
`packages/auth`, `packages/permissions`, `packages/relay`,
`secrets/`, `.github/`, or an app's `wrangler.jsonc`. Documentation-only PRs
skip it. Run it before the PR is opened so the fixes land in the same PR.

## Inputs

- The diff against `main` (`git diff main...HEAD`) and the callers and
  callees of what changed.
- The issue: its 内容 and 验收 lists are the requirement.
- The unit tests and the app's type-check, which the verifiers may run.

## Procedure

1. Hunt. Three subagents with fresh context, one lens each. Each candidate
   they return carries `file:line`, the concrete input or sequence that
   fails, expected versus actual, and the evidence they read.
   - Requirement fit: does the diff deliver every item of the issue's 内容
     and leave every 验收 line checkable? Report what is missing, what goes
     beyond the issue, and where the implementation changed the scope
     without saying so.
   - Correctness and invariants: bugs and edge cases on the changed paths,
     stale query caches after mutations, SSR and client mismatches, races,
     permission and tenancy checks.
   - Repository rules and security: `AGENTS.md`, `docs/`, the skills; quote
     the rule that is broken. Secrets, data loss, cross-tenant access.
2. Verify. One subagent with fresh context per candidate, without the
   hunter's reasoning. Its default position is "false positive"; it
   disproves by reading the code or running a targeted test and answers
   survives or killed with a confidence of 0 to 100. Keep survivors at 80
   and above.
3. Fix what survived on the same branch and re-run the gates.
4. Put the summary in the PR body: fixed, left alone with the reason,
   verified as fine.

## Do not report

Style, naming, comments, logging; anything `pnpm lint`,
`pnpm format:check` or `pnpm type-check` enforces; "consider abstracting or
generalizing"; hypothetical scale or inputs the code cannot receive;
pre-existing issues (once, as a count); missing tests unless the issue asks
for them; copies from Studio or the account center that
`docs/relay/architecture.md` §4.3 sanctions.

## Output

At most five findings, ranked Blocker / Important / Nit, at most two nits.
When nothing survives, the first line is "No blocking issues". Each finding:
the problem, why it matters, the code-level fix. A second review of the same
branch reports new Important findings only.

## Feedback

The PR body says which findings were acted on. A false positive that comes
back three times becomes a line under "Do not report". Fewer than a third
acted on means the bar is wrong, not the reviewer.
