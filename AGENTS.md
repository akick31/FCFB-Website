# Local repository guidance

Read `.claude/REPO_INDEX.md` first, then the relevant feature guide and source shard. Source is authoritative; do not load all documentation at once.

- Preserve the existing UI and business behavior. Fix demonstrated bugs; add no speculative features, logic, abstractions, or validation.
- Keep the conventional React pages/components/hooks/api/utils/constants/context/styles organization.
- Follow `.prettierrc.json` and `eslint.config.js`; use concrete names and focused files. Avoid narrating comments, decorative dividers, and trivial JSDoc.
- Validate at real external boundaries. Frontend role flags are not backend authorization. Never copy secrets into docs, logs, or client build variables.
- For source edits, run `npm run format:check`, `npm run lint`, `npm test -- --runInBand`, and `npm run build`.
- Update the relevant curated guide and run `node .claude/scripts/refresh-context.cjs`, then the same command with `--check` after code changes.
- AI context belongs under ignored `.claude/`; this entry file is also ignored. Never force-add local context.
- Never commit, push, or tag without Andrew explicitly requesting that action. Never add attribution trailers or generated-code comments.

Supplied machine instructions still apply. Read `.claude/docs/security.md` before authentication, permissions, mutation, or deployment changes.
