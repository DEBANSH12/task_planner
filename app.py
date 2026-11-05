"""FocusBoard: a small, accessible task planner backed by a local JSON file."""
from __future__ import annotations

import json
import os
import tempfile
import uuid
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any

from flask import Flask, jsonify, render_template, request

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
DATA_FILE = DATA_DIR / "tasks.json"
ALLOWED_PRIORITIES = {"Low", "Medium", "High"}

app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False


def load_tasks() -> list[dict[str, Any]]:
    """Load saved tasks; return an empty list when the app is used for the first time."""
    DATA_DIR.mkdir(exist_ok=True)
    if not DATA_FILE.exists():
        return []
    try:
        data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except (json.JSONDecodeError, OSError):
        app.logger.exception("Could not read the task store")
        return []


def save_tasks(tasks: list[dict[str, Any]]) -> None:
    """Write atomically so an interrupted write is less likely to corrupt saved tasks."""
    DATA_DIR.mkdir(exist_ok=True)
    fd, temporary_name = tempfile.mkstemp(prefix="tasks-", suffix=".tmp", dir=DATA_DIR)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as temporary_file:
            json.dump(tasks, temporary_file, ensure_ascii=False, indent=2)
        Path(temporary_name).replace(DATA_FILE)
    except Exception:
        try:
            os.unlink(temporary_name)
        except OSError:
            pass
        raise


def valid_due_date(value: Any) -> bool:
    if value in (None, ""):
        return True
    if not isinstance(value, str):
        return False
    try:
        date.fromisoformat(value)
        return True
    except ValueError:
        return False


@app.get("/")
def home():
    return render_template("index.html")


@app.get("/api/tasks")
def get_tasks():
    return jsonify(load_tasks())


@app.post("/api/tasks")
def create_task():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify(error="Send task details as a JSON object."), 400
    title = payload.get("title", "")
    category = payload.get("category", "Personal")
    priority = payload.get("priority", "Medium")
    due_date = payload.get("due_date", "")

    if not isinstance(title, str) or not title.strip():
        return jsonify(error="Please enter a task name."), 400
    if len(title.strip()) > 120:
        return jsonify(error="Task names must be 120 characters or fewer."), 400
    if not isinstance(category, str) or len(category) > 40:
        return jsonify(error="Choose a valid category."), 400
    if not isinstance(priority, str) or priority not in ALLOWED_PRIORITIES:
        return jsonify(error="Choose a valid priority."), 400
    if not valid_due_date(due_date):
        return jsonify(error="Enter a valid due date."), 400

    task = {
        "id": str(uuid.uuid4()),
        "title": title.strip(),
        "category": category,
        "priority": priority,
        "due_date": due_date or "",
        "completed": False,
        "created_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }
    tasks = load_tasks()
    tasks.insert(0, task)
    save_tasks(tasks)
    return jsonify(task), 201


@app.patch("/api/tasks/<task_id>")
def update_task(task_id: str):
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify(error="Send task updates as a JSON object."), 400
    tasks = load_tasks()
    task = next((item for item in tasks if item.get("id") == task_id), None)
    if task is None:
        return jsonify(error="Task not found."), 404

    allowed_fields = {"title", "category", "priority", "due_date", "completed"}
    if not payload or not set(payload).issubset(allowed_fields):
        return jsonify(error="No valid task updates were provided."), 400

    if "title" in payload:
        title = payload["title"]
        if not isinstance(title, str) or not title.strip() or len(title.strip()) > 120:
            return jsonify(error="Task names must contain 1–120 characters."), 400
        task["title"] = title.strip()
    if "category" in payload:
        category = payload["category"]
        if not isinstance(category, str) or len(category) > 40:
            return jsonify(error="Choose a valid category."), 400
        task["category"] = category
    if "priority" in payload:
        if not isinstance(payload["priority"], str) or payload["priority"] not in ALLOWED_PRIORITIES:
            return jsonify(error="Choose a valid priority."), 400
        task["priority"] = payload["priority"]
    if "due_date" in payload:
        if not valid_due_date(payload["due_date"]):
            return jsonify(error="Enter a valid due date."), 400
        task["due_date"] = payload["due_date"] or ""
    if "completed" in payload:
        if not isinstance(payload["completed"], bool):
            return jsonify(error="Completion status must be true or false."), 400
        task["completed"] = payload["completed"]

    save_tasks(tasks)
    return jsonify(task)


@app.delete("/api/tasks/<task_id>")
def delete_task(task_id: str):
    tasks = load_tasks()
    remaining = [item for item in tasks if item.get("id") != task_id]
    if len(remaining) == len(tasks):
        return jsonify(error="Task not found."), 404
    save_tasks(remaining)
    return jsonify(message="Task deleted.")


if __name__ == "__main__":
    # Local development only. Do not expose this development server to the public internet.
    app.run(host="127.0.0.1", port=5000, debug=False)
