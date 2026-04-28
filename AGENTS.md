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
