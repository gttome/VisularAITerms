# Visular AI Terms / Concepts — GitHub Repository and GitHub Pages Setup

**Guide version:** 1.0  
**Baseline application:** Visular AI Terms / Concepts v0.4.0  
**Purpose:** Put the complete project and its current assets in GitHub, deploy the generated site with GitHub Pages, test it publicly, and share a link with reviewers.

> This guide is intentionally tailored to the existing project. The repository already contains `.github/workflows/pages.yml` and `.github/workflows/validate.yml`, so the recommended deployment method is **GitHub Actions -> GitHub Pages**.

## Recommended outcome
Use a project repository named:

```text
VisularAITerms
```

The default public project-site URL will normally be:

```text
https://YOUR-GITHUB-USERNAME.github.io/VisularAITerms/
```

The repository is the working source/version-control location. GitHub Pages publishes the generated `dist/` site for reviewers.

## Important current project facts
The v0.4.0 handoff contains approximately 159 files and about 144 MB extracted. `content/` and the prebuilt `dist/` each contain the multimedia, because the complete delivery ZIP must remain runnable by double-clicking `start-server.bat` without rebuilding. The largest current individual media file is about 25.8 MB decimal (about 24.6 MiB), below GitHub's 100 MiB normal Git file limit.

Because the project has many files and hidden directories such as `.github`, **do not use the GitHub browser's file-upload screen for the initial import**. Use GitHub Desktop or normal Git instead.

Also, do **not** move these Pages assets to Git LFS. GitHub states that Git LFS cannot be used with GitHub Pages sites. The project is deliberately designed to migrate large media to a separate static media host later if growth makes that necessary.

# Part A — Before You Publish

## 1. Decide whether the source repository may be public
For the easiest setup on GitHub Free, create a **public repository**. GitHub Pages is available from public repositories on GitHub Free. GitHub Pro/Team/Enterprise plans can also use private repositories for Pages.

Important: a GitHub Pages site is normally publicly reachable on the internet even when the underlying repository is private on a plan that supports private-repository Pages. Do not publish secrets, private documents, credentials, or media that should not be publicly retrievable.

For the current Visular project, assume the two concepts and their source media will be publicly accessible if you publish them.

## 2. Use a normal development folder
Recommended Windows location:

```text
C:\Dev\VisularAITerms
```

A OneDrive folder can work, but a normal local development directory reduces the chance that cloud-sync file locking, renames, or conflict copies interfere with Git operations.

## 3. Keep the handoff ZIP as a backup
Do not work directly inside the ZIP. Keep the original handoff ZIP unchanged and extract/copy the project into the Git repository working folder.

# Part B — Recommended Setup Using GitHub Desktop

This is the recommended path for Windows 11 because it makes commits, pushes, and later updates easier to see and review.

## Step 1 — Install/sign in to GitHub Desktop
Install GitHub Desktop from GitHub and sign in with the GitHub account that will own the repository.

## Step 2 — Create the empty repository on GitHub.com
On GitHub.com:

1. Select **New repository**.
2. Repository name: `VisularAITerms`.
3. Description: `Visual multimedia reference for AI terms and concepts.`
4. Choose **Public** for the simplest GitHub Pages sharing setup, unless you deliberately want a private source repository and your GitHub plan supports Pages from private repositories.
5. **Do not initialize** the repository with a README, `.gitignore`, or license. The project already contains its own files.
6. Create the repository.

## Step 3 — Clone the empty repository with GitHub Desktop
In GitHub Desktop:

1. **File -> Clone repository**.
2. Select the new `VisularAITerms` repository.
3. Choose a local path such as `C:\Dev\VisularAITerms`.
4. Clone.

You now have an empty local Git repository connected to GitHub.

## Step 4 — Copy the complete project into the cloned folder
Extract `VisularAITerms_Handoff_v0.4.0.zip` somewhere temporary.

Inside the ZIP is the project root containing files such as:

```text
start-server.bat
package.json
README.md
AGENTS.md
HANDOFF.md
.github/
content/
dist/
src/
scripts/
tests/
docs/
```

Copy the **contents of that project root** into:

```text
C:\Dev\VisularAITerms
```

Do not copy the outer handoff folder as an extra nested directory. `start-server.bat` should end up directly at:

```text
C:\Dev\VisularAITerms\start-server.bat
```

## Step 5 — Verify critical files before the first commit
Confirm these exist in the repository root:

```text
start-server.bat
package.json
package-lock.json
README.md
.gitignore
.github\workflows\pages.yml
.github\workflows\validate.yml
content\
dist\
src\
```

Also confirm the two current source concept folders and media are present under `content\concepts\`.

## Step 6 — Test locally before pushing
Double-click:

```text
start-server.bat
```

Confirm the application opens locally and test both concepts and the major media types.

For a development-machine validation with Node.js 20+ installed, also run:

```text
npm ci
npm run check
```

The normal user-facing local server does not require Node, but development validation does.

## Step 7 — Commit the entire baseline in GitHub Desktop
GitHub Desktop should now show the project files under **Changes**.

Use a commit summary such as:

```text
Initial import: Visular AI Terms / Concepts v0.4.0
```

Commit to `main`, then select **Push origin**.

Because the project includes all current source media and a prebuilt `dist/`, the first push may take noticeably longer than a small code-only repository.

## Step 8 — Confirm the repository online
On GitHub.com, verify that the repository contains:

- `.github/workflows/pages.yml`;
- `.github/workflows/validate.yml`;
- `content/` with the multimedia source assets;
- `src/`;
- `scripts/`;
- `tests/`;
- `docs/`;
- `dist/`;
- `start-server.bat`.

Do not proceed to Pages until these are present.

# Part C — Enable GitHub Pages

## Step 1 — Select GitHub Actions as the Pages source
On GitHub.com:

1. Open the `VisularAITerms` repository.
2. Select **Settings**.
3. In the left navigation under **Code and automation**, select **Pages**.
4. Under **Build and deployment -> Source**, select **GitHub Actions**.

Do not select `Deploy from a branch` for this project. The existing workflow validates/builds the application and uploads the generated `dist/` artifact.

## Step 2 — Run or rerun the Pages workflow
The repository already contains `.github/workflows/pages.yml`, which runs on pushes to `main` and can also be started manually.

After Pages is set to GitHub Actions:

1. Open the repository's **Actions** tab.
2. Open **Deploy GitHub Pages**.
3. If an earlier initial run failed because Pages had not yet been enabled, select **Run workflow** (or rerun the failed workflow) on `main`.
4. Wait for the build and deploy jobs to complete successfully.

The workflow performs the project validation/build and then deploys `dist/` using the GitHub Pages Actions.

## Step 3 — Find the public URL
Return to:

```text
Settings -> Pages
```

GitHub should show the live site URL. For a normal project repository it will usually be:

```text
https://YOUR-GITHUB-USERNAME.github.io/VisularAITerms/
```

Copy this URL. This is the link you send to reviewers.

# Part D — Public Test Checklist

Test the deployed site from the GitHub Pages URL, not only localhost.

## Catalog and navigation
- Visular logo loads.
- Catalog loads without console/network errors.
- Search works.
- Category and A-Z controls work.
- Glossary opens.
- Learning Paths open.

## Concept experience
- AI Agents opens in Quick View.
- AI Governance opens in Quick View.
- Deep Dive works.
- Browser Back/Forward works.
- Direct query-string links work.

Useful direct tests:

```text
https://YOUR-GITHUB-USERNAME.github.io/VisularAITerms/?concept=ai-agents-agentic-workflows

https://YOUR-GITHUB-USERNAME.github.io/VisularAITerms/?concept=ai-governance-risk-management-compliance
```

## Multimedia
For both concepts, test:
- infographic/image;
- MP4 playback and seeking;
- M4A playback and seeking;
- PDF open/display;
- web-readable document view;
- original-document links.

## Device/share test
Send the Pages link to yourself and open it:
- in a private/incognito window;
- on your phone using cellular data if practical;
- on another person's device.

This confirms the site is actually publicly reachable and not only cached/authenticated in your normal browser.

# Part E — How Future Releases Move to GitHub

For future versions such as v0.5.0:

1. Keep the current repository clean: commit and push existing work first.
2. Extract the new complete application ZIP to a temporary folder.
3. Update the Git repository working tree with the complete new project contents while preserving only the repository's `.git` metadata.
4. Review the resulting Changes in GitHub Desktop carefully, including deleted files.
5. Run `start-server.bat` locally.
6. Run `npm ci` and `npm run check` when Node is available.
7. Commit with a versioned message, for example:

```text
Release: Visular AI Terms / Concepts v0.5.0
```

8. Push `main`.
9. Watch **Actions -> Validate** and **Actions -> Deploy GitHub Pages**.
10. Test the public Pages URL after deployment.

Do not copy only changed files from ChatGPT releases. The standing project rule is that every development release is a complete standalone project.

# Part F — Assets, Size, and GitHub Limits

## Current state
The current v0.4.0 project is comfortably below GitHub's repository/Page limits, but multimedia is the dominant size.

Approximate current extracted sizes:

```text
Complete handoff project: ~144 MB
content/:                 ~71 MB
dist/:                    ~72 MB
```

The repository currently duplicates media between source `content/` and prebuilt `dist/`. This is intentional for the complete one-click local-delivery requirement, but it means repository growth should be monitored.

## Relevant GitHub limits
Current GitHub documentation states:
- regular Git files larger than 50 MiB trigger a warning;
- regular Git files larger than 100 MiB are blocked;
- GitHub recommends repositories ideally remain below 1 GB;
- published GitHub Pages sites may be no larger than 1 GB;
- Pages has a soft bandwidth limit of 100 GB/month;
- Git LFS cannot be used with GitHub Pages sites.

Therefore:

**Do not plan to solve future Pages-media growth with Git LFS.**

Iteration 4 is specifically planned to improve storage reporting and prepare a controlled external-media export path before the project approaches the Pages limit.

# Part G — Repository Visibility and Sharing

## Public repository
Advantages:
- simplest GitHub Free Pages setup;
- anyone can inspect the source repository;
- reviewers can use the site without GitHub access.

Tradeoff:
- original media/source documents in the repository are public.

## Private repository
GitHub Pro/Team/Enterprise plans can publish Pages from private repositories. However, a Pages deployment should still be treated as publicly accessible unless you are deliberately using an enterprise feature that provides private Pages access.

A private repository hides the source repository from general viewers, but **do not put secrets or private data in deployed Pages content**.

# Part H — Troubleshooting

## Pages workflow fails on the first push
Likely cause: the workflow ran before GitHub Pages was enabled for the repository.

Fix:
1. `Settings -> Pages`.
2. Set Source to **GitHub Actions**.
3. Return to **Actions**.
4. Rerun **Deploy GitHub Pages**.

## Site shows 404
Check:
- Pages Source is GitHub Actions;
- the deploy workflow completed successfully;
- `dist/index.html` is produced by the build;
- the uploaded Pages artifact contains `index.html` at its root.

## Home page loads but media fails
Check the failed URL in browser developer tools and verify the corresponding file exists in `content/` and generated `dist/data/concepts/...` paths. Then inspect the GitHub Actions build log for content/build warnings.

## Push rejects a large file
Do not immediately enable Git LFS for this Pages site. If a future media file exceeds regular Git limits, use the project's planned external-media migration/export approach or otherwise redesign the media location before publishing.

## Workflow validation fails
Open the failed **Actions** run and expand the failed `npm run check` step. Fix the project/content validation problem before attempting to bypass the workflow.

# Part I — Recommended Repository Settings After Initial Success

After the site is working, consider these low-complexity protections:

1. Keep `main` as the production branch.
2. Require pull requests for larger code changes if multiple people begin contributing.
3. Keep the two GitHub Actions workflows enabled.
4. Do not commit passwords, API keys, tokens, or private source material.
5. Keep GitHub Pages HTTPS enabled/default.
6. Use Git tags/releases for meaningful application versions once the release process stabilizes.

Do not add enterprise-scale branch/process rules while you are the only maintainer unless they solve a real problem.

# Source References
This guide was verified against current GitHub documentation in July 2026. Key references:

- GitHub Pages publishing source and custom Actions workflow: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- GitHub Pages limits: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- GitHub large-file guidance: https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github
- Git LFS limitation for GitHub Pages: https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage
- GitHub Desktop existing-project workflow: https://docs.github.com/en/desktop/adding-and-cloning-repositories/adding-an-existing-project-to-github-using-github-desktop?platform=windows
- GitHub Pages 404 troubleshooting: https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-404-errors-for-github-pages-sites
