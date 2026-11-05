# FocusBoard — Accessible Daily Task Planner

A small, responsive task-planning web app built to demonstrate practical front-end development, accessible interaction patterns, simple API design, and user-centred thinking. It is intentionally lightweight: no JavaScript framework, database server, or external UI library is required.

## Features

- Create tasks with a category, priority, and optional due date.
- Mark tasks complete or active and delete them.
- Search tasks and filter by All, Active, or Done.
- View total, active, and completed task counts.
- Export all tasks to CSV for Microsoft Excel or Google Sheets.
- Save tasks to a local JSON file through a small Flask API.
- Responsive layout for desktop, tablet, and mobile screens.

## Tech stack

- **Frontend:** HTML5, CSS3, vanilla JavaScript
- **Backend:** Python 3, Flask, JSON file storage
- **Quality:** semantic HTML, keyboard access, visible focus states, ARIA labels/live announcements, input validation

## Run locally

You need Python 3.9 or newer.

### Windows (PowerShell)

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python app.py
```

### macOS / Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python app.py
```

Open **http://127.0.0.1:5000** in your browser. Stop the server with `Ctrl+C`.

The first run creates `data/tasks.json`. This file is intentionally ignored by Git because it contains your local task data. The app binds to `127.0.0.1` and is intended for local demonstration, not public production hosting.

## Accessibility and usability choices

The interface uses native form controls and semantic page landmarks. It includes a skip link, programmatic form labels, keyboard-operable buttons and filters, visible keyboard focus, descriptive names for task checkboxes and delete buttons, and a polite live region that announces task updates. The layout adapts to narrow screens and respects the operating system's reduced-motion preference. Status is communicated with text as well as colour.

These are accessibility-minded implementation choices, **not a claim of formal WCAG 2.0/2.1/2.2 conformance or a completed accessibility audit**. Contrast, screen-reader behaviour, zoom, and mobile operation should be checked with the testing steps below before making a conformance claim.

### User-centred design approach

The design is based on a simple task flow: capture a task, classify it, review the list, and mark progress. The form is kept short; category, priority, and due date are available without making every field mandatory. Search and three clear filters support people with growing task lists. CSV export supports users who prefer to review or share their data in spreadsheet tools.

No formal user interviews or usability sessions are claimed as completed for this sample project. To validate the design with real users, use the lightweight plan in [`docs/USER_TESTING_TEMPLATE.md`](docs/USER_TESTING_TEMPLATE.md), record observed issues, and update the app based on evidence.

## Manual test checklist

1. Add a task with only a title; confirm it appears in the list and counters update.
2. Add a task with a category, priority, and due date; confirm the details appear.
3. Mark a task complete, then active again; confirm the status and counters change.
4. Search for a task and try each filter; confirm the visible list matches the selection.
5. Delete a task; confirm it is removed.
6. Export CSV and open it in Excel or Google Sheets; check that headings and values are in separate columns.
7. Reload the page; confirm tasks remain available.
8. Complete the main flow using only the keyboard. Check focus visibility and the skip link.
9. Resize to a narrow mobile viewport and zoom the browser to 200%; check for clipped controls or horizontal scrolling.
10. Try a screen reader and browser accessibility inspection tools; record any issues rather than assuming the page passes an audit.

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/tasks` | List saved tasks |
| `POST` | `/api/tasks` | Create a task |
| `PATCH` | `/api/tasks/<id>` | Update task fields or completion state |
| `DELETE` | `/api/tasks/<id>` | Delete a task |

## Project structure

```text
FocusBoard/
├── app.py
├── requirements.txt
├── README.md
├── .gitignore
├── data/
│   └── .gitkeep
├── templates/
│   └── index.html
├── static/
│   ├── app.js
│   └── styles.css
└── docs/
    └── USER_TESTING_TEMPLATE.md
```

## Scope and next steps

This is a local portfolio project, not a multi-user task service. It has no login, cloud sync, or database server. Useful next steps would be automated API/UI tests, a proper accessibility audit with assistive technology, and optional database-backed persistence.

## Suggested resume entry

**FocusBoard — Accessible Task Planner | HTML, CSS, JavaScript, Python, Flask**  
Built a responsive task-planning web app with REST API-backed JSON persistence, task search and filters, progress metrics, and CSV export for spreadsheet analysis. Applied semantic HTML, keyboard navigation, visible focus states, ARIA live announcements, and reduced-motion support.

Only describe accessibility or usability testing as completed after you have actually performed and documented it.

## Development approach

The project follows a lightweight SDLC loop suitable for a small prototype. See the [role requirements map](docs/ROLE_REQUIREMENTS_MAP.md) and [3-minute demo script](docs/DEMO_SCRIPT.md) for interview preparation:

1. **Discover:** define the core user goal and the minimum information needed to add a task.
2. **Design:** map the add → review → complete workflow and choose semantic, keyboard-operable controls.
3. **Build:** implement the interface, API endpoints, validation, and local persistence in small pieces.
4. **Verify:** use the manual checklist and, where possible, test with keyboard and assistive technology.
5. **Iterate:** prioritize fixes from observed user feedback and retest the affected flow.

For a portfolio presentation, you can walk through the user problem, a short task-creation demo, the accessible interaction choices, the API/data flow, and the next improvements. This is a suggested presentation outline, not a claim that a user study or formal presentation has already taken place.
