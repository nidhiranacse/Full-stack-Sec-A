# Problem 4 — GitHub Actions and Git Recovery

## A. Recover commits after an accidental force push

1. Use `git reflog` to find the previous commit hash.
2. Create a recovery branch using `git branch recovery <commit-hash>`.
3. Switch to it using `git switch recovery`.
4. Verify the recovered files with `git log --oneline -10`.
5. Push the recovery branch using `git push origin recovery`.

To bring a recovered commit into another branch, switch to that branch and use `git cherry-pick <commit-hash>`. Resolve conflicts and test before pushing.

## B. Branch protection

1. Open the GitHub repository settings.
2. Create a branch protection rule or ruleset targeting `main`.
3. Require pull requests before merging.
4. Require the CI status checks to pass before merging.
5. Disable force pushes and branch deletion.
6. Require approvals if required by the team or assessment.

## CI/CD workflow

The GitHub Actions workflow runs linting and tests on Node.js 18 and 20 for pushes and pull requests targeting `main`. It uses npm dependency caching, runs lint before tests, and defines a separate deployment job that runs only after all test jobs pass on a push to `main`.

The deployment command is currently a placeholder and must be configured for a real deployment platform.