Summary

This branch contains fixes and additions to address printing and registration sync issues.

Changes

- src/components/ConfirmationSlip.jsx: clone confirmation slip into a body-level portal (`#print-slip-portal`) before printing to avoid a blank first page.
- src/css/components/ConfirmationSlip.css: updated print rules to show only the `#print-slip-portal` child during print.
- src/lib/supabaseClient.js: after successful Supabase insert, persist a local copy and dispatch `rhopee:registrations-updated`; `getAllTrainingRegistrations` now merges locally persisted registrations with remote results so the admin dashboard shows local entries.
- scripts/e2e-test.cjs: Puppeteer E2E script that submits a registration, ensures it is persisted to localStorage, opens the admin page, and captures a PDF/screenshot of the slip preview.

Notes

- The branch is local. To create a PR you can push the branch and open a pull request:

  ```bash
  cd rhopee.org.ng
  git push -u origin fix/print-supabase-merge
  ```

- The E2E run created PDF and PNG artifacts in the project root (for debugging). Remove them if not needed.

- If you prefer the admin dashboard to show only remote DB records when Supabase is configured, revert the merge behavior in `getAllTrainingRegistrations`.

Testing

1. Start dev server:

  ```bash
  cd rhopee.org.ng
  npm install
  npm run dev
  ```

2. Visit `http://localhost:5173/event-register`, submit a registration, then visit `http://localhost:5173/admin` to confirm it appears.

3. Click Print on the slip to confirm the blank first page is gone (set print margins to None and disable headers/footers if needed).

Questions

Would you like me to push this branch and open a PR, or revert the merge-behavior change and run the tests again?