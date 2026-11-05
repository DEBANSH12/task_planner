(() => {
  "use strict";

  const elements = {
    form: document.querySelector("#task-form"),
    title: document.querySelector("#task-title"),
    category: document.querySelector("#task-category"),
    priority: document.querySelector("#task-priority"),
    due: document.querySelector("#task-due"),
    formError: document.querySelector("#form-error"),
    list: document.querySelector("#task-list"),
    listRegion: document.querySelector("#task-list-region"),
    empty: document.querySelector("#empty-state"),
    emptyTitle: document.querySelector("#empty-title"),
    emptyCopy: document.querySelector("#empty-copy"),
    status: document.querySelector("#status-message"),
    loadError: document.querySelector("#load-error"),
    search: document.querySelector("#task-search"),
    exportButton: document.querySelector("#export-button"),
    total: document.querySelector("#total-count"),
    open: document.querySelector("#open-count"),
    done: document.querySelector("#done-count"),
    visible: document.querySelector("#visible-count"),
    filters: [...document.querySelectorAll("[data-filter]")],
  };

  let tasks = [];
  let activeFilter = "all";

  async function api(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || "Something went wrong. Please try again.");
    return body;
  }

  function announce(message) {
    elements.status.textContent = "";
    window.setTimeout(() => { elements.status.textContent = message; }, 20);
  }

  function filteredTasks() {
    const term = elements.search.value.trim().toLocaleLowerCase();
    return tasks.filter((task) => {
      const matchesFilter = activeFilter === "all"
        || (activeFilter === "open" && !task.completed)
        || (activeFilter === "done" && task.completed);
      const matchesSearch = !term
        || `${task.title} ${task.category} ${task.priority}`.toLocaleLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  }

  function formatDate(value) {
    if (!value) return "";
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }

  function makeMeta(text, className = "meta-pill") {
    const span = document.createElement("span");
    span.className = className;
    span.textContent = text;
    return span;
  }

  function createTaskElement(task) {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " is-complete" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.className = "task-check";
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(task.completed);
    checkbox.setAttribute("aria-label", `${task.completed ? "Mark as active" : "Mark as complete"}: ${task.title}`);
    checkbox.addEventListener("change", async () => {
      checkbox.disabled = true;
      try {
        await api(`/api/tasks/${encodeURIComponent(task.id)}`, {
          method: "PATCH",
          body: JSON.stringify({ completed: checkbox.checked }),
        });
        task.completed = checkbox.checked;
        render();
        announce(checkbox.checked ? `Completed: ${task.title}` : `Reopened: ${task.title}`);
      } catch (error) {
        checkbox.checked = !checkbox.checked;
        checkbox.disabled = false;
        announce(error.message);
      }
    });

    const main = document.createElement("div");
    main.className = "task-main";
    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;
    main.append(title);

    const meta = document.createElement("div");
    meta.className = "task-meta";
    meta.append(makeMeta(task.category));
    meta.append(makeMeta(task.priority, `meta-pill priority-${String(task.priority).toLowerCase()}`));
    if (task.due_date) {
      const due = makeMeta(`Due ${formatDate(task.due_date)}`);
      const now = new Date();
      const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
      if (!task.completed && task.due_date < today) due.classList.add("due-overdue");
      meta.append(due);
    }
    main.append(meta);

    const actions = document.createElement("div");
    actions.className = "task-actions";
    const remove = document.createElement("button");
    remove.className = "delete-button";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Delete task: ${task.title}`);
    remove.addEventListener("click", async () => {
      remove.disabled = true;
      try {
        await api(`/api/tasks/${encodeURIComponent(task.id)}`, { method: "DELETE" });
        tasks = tasks.filter((itemTask) => itemTask.id !== task.id);
        render();
        announce(`Deleted: ${task.title}`);
      } catch (error) {
        remove.disabled = false;
        announce(error.message);
      }
    });
    actions.append(remove);
    item.append(checkbox, main, actions);
    return item;
  }

  function render() {
    const visibleTasks = filteredTasks();
    elements.total.textContent = String(tasks.length);
    elements.open.textContent = String(tasks.filter((task) => !task.completed).length);
    elements.done.textContent = String(tasks.filter((task) => task.completed).length);
    elements.visible.textContent = String(visibleTasks.length);
    elements.exportButton.disabled = tasks.length === 0;
    elements.list.replaceChildren(...visibleTasks.map(createTaskElement));
    elements.empty.hidden = visibleTasks.length > 0;

    if (tasks.length === 0) {
      elements.emptyTitle.textContent = "Your list starts here.";
      elements.emptyCopy.textContent = "Add one small task and build momentum.";
    } else if (visibleTasks.length === 0) {
      elements.emptyTitle.textContent = "No matching tasks.";
      elements.emptyCopy.textContent = "Try another search or choose a different filter.";
    }
  }

  elements.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    elements.formError.textContent = "";
    const title = elements.title.value.trim();
    if (!title) {
      elements.formError.textContent = "Please enter a task name.";
      elements.title.focus();
      return;
    }
    const submitButton = elements.form.querySelector("button[type='submit']");
    submitButton.disabled = true;
    try {
      const task = await api("/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          title,
          category: elements.category.value,
          priority: elements.priority.value,
          due_date: elements.due.value,
        }),
      });
      tasks.unshift(task);
      elements.form.reset();
      activeFilter = "all";
      elements.search.value = "";
      elements.filters.forEach((button) => {
        const selected = button.dataset.filter === "all";
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
      render();
      elements.title.focus();
      announce(`Added: ${task.title}`);
    } catch (error) {
      elements.formError.textContent = error.message;
    } finally {
      submitButton.disabled = false;
    }
  });

  elements.filters.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      elements.filters.forEach((filterButton) => {
        const selected = filterButton === button;
        filterButton.classList.toggle("is-active", selected);
        filterButton.setAttribute("aria-pressed", String(selected));
      });
      render();
    });
  });

  elements.search.addEventListener("input", render);

  function csvCell(value) {
    let text = String(value ?? "");
    // Prevent spreadsheet formula execution for user-entered values.
    if (/^[=+\-@\t\r]/.test(text)) text = `\'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  }

  elements.exportButton.addEventListener("click", () => {
    const headers = ["Task", "Category", "Priority", "Due date", "Completed", "Created at"];
    const rows = tasks.map((task) => [
      task.title, task.category, task.priority, task.due_date,
      task.completed ? "Yes" : "No", task.created_at,
    ]);
    const csv = "\uFEFF" + [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "focusboard-tasks.csv";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    announce("CSV export prepared. You can open it in Excel or Google Sheets.");
  });

  async function initialize() {
    elements.listRegion.setAttribute("aria-busy", "true");
    try {
      tasks = await api("/api/tasks");
      render();
    } catch (error) {
      elements.loadError.hidden = false;
      elements.loadError.textContent = `${error.message} Restart the app and refresh this page.`;
    } finally {
      elements.listRegion.setAttribute("aria-busy", "false");
    }
  }

  initialize();
})();
