---
name: ai-code-smells
description: Audit source code (not visual design/copy — see ai-design-smells for that) for patterns that read as unedited AI-generated code rather than deliberate, human-written code. Covers redundant comments that restate the code, decorative section-divider comments, defensive try/catch that swallows or rethrows without adding value, generic variable names, needless abstraction layers, leftover console.log/debug statements, boilerplate JSDoc on trivial functions, and inconsistent error handling. Use when asked to clean up code so it doesn't "look AI-written", or to review code quality/style consistency across a codebase.
---

# AI Code Smell Audit

A two-phase skill: **find** concrete instances with file:line evidence, then **fix** only what's confirmed — not every comment or try/catch is a smell. The tell is *redundancy and padding*, not the presence of comments or error handling per se. A comment explaining a non-obvious constraint is good code; a comment restating what the next line already says is the smell.

## Phase 1: Find

Read broadly across the codebase (not just grep — many of these require judgment about context). Report every hit as `file:line — quote — category`, and say "none found" explicitly for empty categories.

### Comment smells

| Smell | What it looks like | Why it's a tell |
|---|---|---|
| Restating comments | `// set loading to true` above `setLoading(true)`, `// increment counter` above `count++` | Adds zero information beyond the code itself |
| Decorative section dividers | `// ═══════════ SECTION ═══════════`, `// ---- Helpers ----`, banner comments with box-drawing characters | Real codebases split files/functions instead of decorating one file with banners |
| Narrative/"walkthrough" comments | `// First, we fetch the data. Then, we process it. Finally, we return it.` | Reads like a generated explanation of the code rather than a note a human left for the next reader |
| Boilerplate JSDoc on trivial functions | A multi-line `/** ... */` block with `@param`/`@returns` on a one-line getter/formatter whose name and types already say everything | Real engineers document non-obvious behavior, not `getName(user): returns the user's name` |
| Comment/code drift | A comment describing behavior the code next to it no longer does | Sign the comment was generated once and never revisited |

Grep starting points: `grep -rn "═══\|----.*----\|\*\*\*\*" src`, then manually scan comment density in recently-touched files.

### Structural/logic smells

| Smell | What it looks like | Detect |
|---|---|---|
| Swallow-and-log catch blocks | `catch (error) { console.error(...); }` with no rethrow, no user feedback, no fallback — the error just vanishes | `grep -rn "catch (" src` then check each block's body |
| Catch-then-rethrow-unchanged | `catch (e) { console.error(e); throw e; }` — adds a log line but no actual handling | Same grep, check if the catch does anything beyond logging + rethrowing |
| Defensive checks for impossible states | Null/undefined guards on values that TypeScript/PropTypes/the calling context already guarantee are present | Read call sites; if every caller already ensures the value exists, the guard is padding |
| Needless single-use wrapper functions | A function that only calls one other function with the same arguments and returns its result, never reused elsewhere | `grep -rn "^const \w\+ = (" ` then check each function's caller count |
| Generic variable names | `data`, `result`, `response`, `item`, `temp`, `value`, `obj`, `res` used where a domain name (`game`, `team`, `play`) is obvious from context | Read function bodies; flag names that could be any type |
| Inconsistent error handling across similar code | Some API calls have try/catch + user-facing error state, sibling calls silently ignore failures, with no reason for the difference | Compare similar functions/hooks across the codebase |
| Unnecessary `async`/`await` | `async` function that has no `await` inside, or `await`ing a value that isn't a promise | `grep -rn "async " src` then check each for an actual await |
| Redundant boolean comparisons | `if (x === true)`, `if (x == false)`, `!!value` where a plain truthy check reads the same | `grep -rn "=== true\|=== false\|== true\|== false" src` |
| Placeholder TODOs with no context | `// TODO: fix this` / `// TODO: handle error` with no ticket, owner, or explanation | `grep -rniE "todo|fixme|hack" src` |
| Leftover debug output | `console.log`/`debugger` statements not gated behind a dev flag, left in from development | `grep -rn "console\.log\|debugger" src` |

## Phase 2: Fix

1. **Restating/narrative comments**: delete them. If the comment explains a genuine non-obvious constraint, keep it but trim to one line of *why*, not *what*.
2. **Section-divider banners**: remove the decoration; if the file is genuinely doing too much, that's a separate refactor question — don't take that on unprompted, just drop the banner.
3. **Swallow/rethrow-only catches**: either make the catch do something real (surface an error to the UI, set error state) or, if the call site already handles rejection upstream, remove the try/catch entirely rather than leaving a no-op one.
4. **Impossible-state guards**: remove only after confirming (via call sites and types) the guarded case truly cannot occur. If there's genuine uncertainty, leave it — don't strip real safety nets to look leaner.
5. **Single-use wrappers**: inline the wrapper at its one call site, unless it exists for testability/mocking (check test files before removing).
6. **Generic names**: rename to the concrete domain type, updating all references in the same scope.
7. **Inconsistent error handling**: match the pattern the rest of the codebase already uses for that category of call (e.g. if other API calls in the file set an `error` state and show `<ErrorMessage>`, make the outlier do the same) — don't invent a new pattern.
8. **Unnecessary async/redundant booleans/TODOs/console.log**: fix mechanically, these are low-risk.
9. Re-run lint/build after fixes to confirm nothing broke.

Don't manufacture cleverness for its own sake — the goal is code that reads as if a competent engineer wrote it under normal time pressure, not code that's been maximally condensed or over-engineered in the other direction.
