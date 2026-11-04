---
trigger: always_on
---

# Auto-Commit and Push Rule

The agent must automatically stage, commit, and push all modifications to GitHub (`origin main`) after completing any feature, file edit, bugfix, or milestone.

1. Ensure the change is tested and error-free.
2. Stage modified and untracked files (`git add .`).
3. Commit with a concise Conventional Commit message (`feat: ...`, `fix: ...`, `docs: ...`, `test: ...`, `refactor: ...`).
4. Push to remote (`git push origin main`).
5. Maintain a clean working directory.

