# FocusBoard — 3-minute project walkthrough

Use this as a speaking outline. Make sure the app is running and use your own sample tasks during the demonstration.

## 1. Problem and intended users (30 seconds)

“FocusBoard is a lightweight task planner for someone who wants to capture everyday work quickly, see what is still active, and review completed work. I kept the form short and made category, priority, and due date optional or quick to choose so the workflow stays simple.”

## 2. Live workflow (60–75 seconds)

1. Add a task with a clear title, category, priority, and due date.
2. Search for the task and switch between All, Active, and Done.
3. Mark the task complete and point out how the summary counts update.
4. Export the task list as CSV and explain that it can be opened in Excel or Google Sheets.

## 3. Accessibility and responsive design (40–50 seconds)

“ I used semantic page regions and native form controls, added a skip link, visible keyboard focus, descriptive accessible names, and a live announcement region for task updates. The layout changes for smaller screens and respects the reduced-motion setting. These are accessibility-minded choices; I would still run a full WCAG audit and assistive-technology checks before claiming conformance.”

Demonstrate keyboard-only navigation. Do not claim screen-reader validation unless you have actually tested it.

## 4. Technical overview (30–40 seconds)

“The interface is built with HTML, CSS, and vanilla JavaScript. A small Flask API handles create, read, update, and delete operations. Tasks are stored in a local JSON file, which keeps the demo easy to run without a database service.”

## 5. Reflection and next step (20–30 seconds)

“The current version is a single-user local prototype. My next step would be to run short usability sessions, observe where people hesitate, prioritize the findings, and then retest. I would also add automated tests and a formal accessibility audit before extending it beyond a local demo.”

## Questions to prepare for

- Why did you choose local JSON storage instead of a database?
- How did you avoid unsafe HTML insertion for user-entered task names?
- What is the purpose of the ARIA live region?
- How would you recruit participants for a usability test?
- What would you measure to evaluate whether the workflow is usable?
- What would need to change before multiple users could use this application?
