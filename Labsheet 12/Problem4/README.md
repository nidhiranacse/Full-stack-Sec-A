# Problem 4 - CI/CD and Git Recovery

## Part A - GitHub Actions CI

The GitHub Actions workflow is stored in:

`.github/workflows/ci.yml`

The CI workflow is configured to run when:

- A pull request is created or updated for the `main` branch.
- Code is pushed to the `main` branch.

The workflow performs the following tasks:

1. Checks out the repository.
2. Sets up Node.js.
3. Installs dependencies for Problem 1.
4. Installs dependencies for Problem 3.
5. Builds the React application in Problem 3.
6. Runs the deployment job only after the required jobs pass.

The workflow file is:

`.github/workflows/ci.yml`

---

## Part B - Recovering Lost Commits

If a teammate force-pushes to the shared `main` branch and some commits disappear, Git may still contain references to those commits in the local repository.

The first step is to check the Git reflog:

```bash
git reflog