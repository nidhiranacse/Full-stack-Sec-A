# Problem 4: Git and CI/CD Pipeline Solutions

**Course:** Full Stack Development (BTCS303T) &mdash; Coding Assessment  
**Student Name:** Rahul Raj  
**Roll / Student ID:** cu24250116  
**Section:** Sec-A  
**Submission:** Lab Sheet 12  

---

## (a) GitHub Actions Workflow File (`.github/workflows/ci.yml`)

The complete workflow file is created at `.github/workflows/ci.yml` and fulfills all assessment requirements:
1. **Triggers:** Runs automatically on pull requests targeting `main` and on direct pushes to `main`.
2. **Matrix Build:** Builds and tests simultaneously across a matrix of **Node 18** and **Node 20**.
3. **Dependency Caching:** Utilizes `actions/setup-node@v4` with `cache: 'npm'` for rapid cache hits across CI runs.
4. **Execution Order:** Runs `npm run lint` first, followed by `npm test`.
5. **Separate Deploy Job:** Runs only on direct pushes to `main`, and only if all matrix test jobs have passed (`needs: test`).

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    name: Lint & Test (Node ${{ matrix.node-version }})
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Set up Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
          cache-dependency-path: '**/package.json'

      - name: Install Dependencies
        run: |
          if [ -f package-lock.json ]; then
            npm ci
          else
            npm install
          fi

      - name: Run Linter
        run: npm run lint --if-present

      - name: Run Test Suite
        run: npm test --if-present

  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Execute Deployment
        run: |
          echo "=========================================="
          echo "Test matrix passed successfully on Node 18 & 20!"
          echo "Deploying production release on push to main..."
          echo "=========================================="
```

---

## (b) Git Concurrency & History Recovery After Force-Push

### Scenario:
A teammate accidentally ran `git push --force` to the shared `main` branch, overwriting the remote tip and causing three commits from other developers to disappear from remote history.

### 1. Exact Git Commands to Find and Safely Restore Those Commits

#### Step 1: Locate the lost commits using the local Reference Log (`git reflog`)
Any developer who previously fetched or had the branch checked out prior to the force push retains the original commit objects in their local repository:

```bash
# View the local reflog history for main / HEAD
git reflog show origin/main
# or simply inspect recent moves of HEAD:
git reflog -n 20
```
*Output will display entries such as:*
```text
a1b2c3d HEAD@{1}: update: fetch: fast-forward
e4f5a6b HEAD@{2}: commit: feat(cart): add abort controller to product search
```
Identify the SHA of the lost commit at the tip of `main` before the force-push occurred (e.g., `<lost-commit-sha>`). Alternatively, if a teammate has the intact branch on their local machine, they can run `git rev-parse HEAD`.

#### Step 2: Create a recovery branch pointing directly to the lost commit
```bash
git branch recovery-branch <lost-commit-sha>
```

#### Step 3: Inspect and verify that the three missing commits are present
```bash
git log -n 5 --oneline recovery-branch
```

#### Step 4: Safely integrate and restore the commits to the remote `main` branch
Fetch the latest remote state and switch to `main`:
```bash
git checkout main
git pull origin main
```

Merge the recovered commits back into `main` (preserving both teammate's new commit and the restored commits):
```bash
git merge recovery-branch -m "fix: restore missing commits after accidental force-push"
```

Push the restored, merged history to the remote:
```bash
git push origin main
```

*(Note: If the teammate's force-push was completely erroneous and needs to be completely rolled back, you can safely restore the tip using lease protection: `git checkout main && git reset --hard <lost-commit-sha> && git push --force-with-lease origin main`)*

---

### 2. Team-Level Rule or Setting to Prevent Accidental Force-Pushes

**Rule / Setting: GitHub Branch Protection Rules (Rulesets)**

On the GitHub repository settings page:
1. Navigate to **Settings** &rarr; **Branches** &rarr; **Add branch protection rule** (or **Rulesets**).
2. Set **Branch name pattern** to `main`.
3. Configure the following critical protections:
   - **Check "Lock branch" / Ensure "Allow force pushes" is UNCHECKED (Disabled):** Completely blocks any user (including administrators) from running `git push --force` or `git push -f` to the branch.
   - **Check "Require a pull request before merging":** Ensures all changes must go through a peer-reviewed Pull Request and cannot be directly pushed to `main`.
   - **Check "Require status checks to pass before merging":** Guarantees the CI workflow (linting and test matrix) passes before any code enters production.
