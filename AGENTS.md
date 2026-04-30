<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Branching Strategy

Use Git Flow for this project:

```text
main
├── hotfix/<name>
└── develop
    ├── feature/<name>
    └── release/<version>
```

- `main` is production only.
- `develop` is the integration branch.
- Branch new work from `develop` into `feature/<name>`.
- Open feature PRs back into `develop`.
- Branch releases from `develop` into `release/<version>`, then merge to both `main` and `develop`.
- Branch hotfixes from `main` into `hotfix/<name>`, then merge to both `main` and `develop`.
- Never commit directly to `main` or `develop`.

# Instruction Precedence

When instructions conflict, use this order of precedence:

1. Direct user instruction in the current thread
2. `AGENTS.md`
3. Assignment and architecture docs in `docs/`
4. `PRODUCT.md` and `DESIGN.md`
5. General agent defaults

If two repo documents appear to conflict, do not guess silently. Prefer the more specific document for the current task and record the interpretation in commentary or the relevant spec/ADR when needed.

# Package Manager

This repository uses `bun`.

- Use `bun` for install, test, build, lint, and script execution.
- Do not use `pnpm` in this repository.
- If another instruction file mentions `pnpm`, treat the repo's actual setup as authoritative and use `bun`.

# Documentation Order

For work that changes behavior or user-facing UX/UI:

1. Write or update the relevant planning artifact first.
2. Then implement.
3. Then validate.
4. Then commit.

Required artifact rules:

- BMAD Quick Flow work must have a short tech spec in `docs/bmad/` before implementation commits.
- Durable technical or interaction decisions should be recorded in `docs/01c-adrs.md`.
- Do not treat commit messages as a substitute for required BMAD or ADR documentation.

# Commit Discipline

- Never mix unrelated changes in one commit.
- Stage files intentionally; do not commit the whole working tree by default.
- If unrelated local changes exist, leave them unstaged unless the user explicitly asks to include them.
- If a commit must be split, prefer multiple small commits over one broad commit.

Commit scope rules:

- Documentation-only changes should be committed separately from implementation where practical.
- Restoration of lost functionality should be committed separately from new feature development where practical.
- Tests should travel with the implementation they verify, not as a separate unrelated commit.

# Restoration vs New Work

If functionality existed previously and was lost through merge conflict, regression, or branch churn:

- Describe it as `restore` / `restoration`, not as a new feature.
- Check history before re-implementing from scratch when the user indicates it existed before.
- Keep restoration commits distinct from broader redesign or polish commits where practical.

# ADR Usage

Use an ADR only when the change establishes a lasting rule, pattern, or constraint.

Good ADR candidates:

- rendering policy for missing-data states
- control behavior that future work should preserve
- infrastructure or library usage decisions

Do not use an ADR for a generic bugfix unless the bugfix results in a lasting decision that should guide future implementation.

# Assignment Interpretation

When assignment wording is ambiguous:

- Prefer the most literal reviewer-friendly interpretation unless a repo spec explicitly narrows or reinterprets it.
- If implementation must diverge from literal wording because of real data or API constraints, make that explicit in the relevant spec, ADR, subtitle, or helper copy.

# Working Tree Safety

- Before committing, check `git status --short`.
- Call out unrelated modified or untracked files before staging.
- Do not rewrite or discard user work without explicit permission.

# Design Context

- **Register:** `product` (Analytical dashboard & API)
- **Personality:** Precise, quiet, trustworthy instrument.
- **Principles:**
  - **Analytical Canvas:** Maximize whitespace for data legibility.
  - **Honest Data:** Explicitly show null/missing/loading states.
  - **Restrained Polish:** Rely on typography/hierarchy, not effects.
  - **Technical Clarity:** Clean, rigorous API and Admin surfaces.
  - **Contextual UI:** Keep controls near the data they influence.
- **Specifications:** See `PRODUCT.md` (strategic) and `DESIGN.md` (visual tokens).
