# Visual Verification Guide

This guide details the mandatory visual verification processes required for any UI additions, modifications, or bug fixes across the F1 Viewer platform.

## 📸 The Mandate
To ensure high quality and prevent regressions, all Pull Requests modifying the frontend **must** include:
1. **Screenshot(s)** of the rendered UI changes.
2. **Short Video Demo** of any interactive behaviors or user flows.

If a PR lacks these artifacts, it will not be approved.

## 🤖 Automated Capture via Playwright
We use Playwright to standardize the recording and extraction of these visual artifacts.

### 1. The Template Script
A starting template is available at `test-utils/visual-demo.spec.ts`. Whenever you are implementing a feature, copy this file or add a new `.spec.ts` file in the same directory.

The configuration in `playwright.config.ts` ensures that `video: 'on'` and `screenshot: 'on'` are active.

### 2. Running the Tests
Once you have written a small interactive flow (navigating to your new component, clicking buttons, etc.):
```bash
npm run test:visual > visual_test.log 2>&1
```
Check the exit status to ensure it ran successfully.

### 3. Locating the Artifacts
After execution, look in the `test-results/` directory. You will find:
- `.png` files (Screenshots)
- `.webm` files (Video recordings of the test execution)

### 4. Attaching to Pull Requests
When you open a Pull Request on GitHub:
- Drag and drop the generated `.png` and `.webm` files into the designated sections of the Pull Request description template.
- Update the GitHub Issue body to check off the `- [x]` visual verification criteria checkboxes.
