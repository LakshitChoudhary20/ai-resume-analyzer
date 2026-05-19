# Contributing to AI Resume Analyzer

Thanks for your interest in contributing! Here's how to get started.

## Development Workflow

1. **Fork** the repo and clone your fork
2. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```
3. **Make your changes**, following the code style of the project
4. **Test** your changes locally (frontend + backend)
5. **Commit** using clear, descriptive messages:
   ```
   feat: add resume comparison feature
   fix: resolve PDF parse error on large files
   docs: update setup instructions
   ```
6. **Push** and open a Pull Request against `main`

## Branch Naming

| Type     | Example                      |
|----------|------------------------------|
| Feature  | `feat/interview-export`      |
| Bug fix  | `fix/ats-score-calculation`  |
| Docs     | `docs/update-readme`         |
| Refactor | `refactor/gemini-service`    |

## Code Style

- Use **camelCase** for JS variables and functions
- Use **PascalCase** for React components
- Keep components small and single-responsibility
- Always use `.env.example` for new env variables — never commit real secrets

## Reporting Issues

- Search existing issues before opening a new one
- Include steps to reproduce, expected vs. actual behavior, and your Node.js version
