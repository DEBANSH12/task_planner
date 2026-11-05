# FocusBoard — Mini Project Plan

## Goal

Create a small browser-based planner that makes it easy to capture and track everyday tasks on desktop and mobile.

## Primary user needs (initial assumptions to validate)

- Add a task without completing a long form.
- Quickly see what is active and what is finished.
- Find a task by text or status.
- Use the main workflow with a keyboard.
- Export task data to a spreadsheet.

These are starting assumptions, not findings from completed interviews.

## Scope

**In scope:** task creation, category/priority/due date, completion, deletion, search, status filters, counts, local persistence, CSV export, responsive layout, accessibility-minded controls.

**Out of scope:** accounts, cloud sync, collaboration, notifications, external calendar integrations, and production deployment.

## Small delivery plan

| Stage | Deliverable | Completion evidence |
|---|---|---|
| 1. Requirements | User flow and field definitions | This plan and README |
| 2. UI | Responsive task form and list | `templates/index.html`, `static/styles.css` |
| 3. Functionality | API, persistence, search, filters, export | `app.py`, `static/app.js` |
| 4. Quality | Validation and accessibility checklist | README and user testing template |
| 5. Iteration | Fixes based on actual feedback | Add dated findings to `USER_TESTING_TEMPLATE.md` |
