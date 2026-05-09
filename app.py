import json
import os
from flask import Flask, render_template, abort

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "static", "data")


def load_json(filename):
    path = os.path.join(DATA_DIR, filename)
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def get_tasks():
    return load_json("tasks.json")


def get_practice():
    return load_json("practice.json")


def get_tests():
    return load_json("tests.json")


# ── Routes ───────────────────────────────────────────────────────────

@app.route("/")
def index():
    tasks = get_tasks()
    practice = get_practice()
    tests = get_tests()
    stats = {
        "tasks": len(tasks),
        "practice": sum(len(p["problems"]) for p in practice),
        "tests": len(tests),
    }
    return render_template("index.html", stats=stats)


@app.route("/theory/")
def theory():
    tasks = get_tasks()
    return render_template("theory.html", tasks=tasks)


@app.route("/theory/<int:task_id>/")
def task_detail(task_id):
    tasks = get_tasks()
    task = next((t for t in tasks if t["id"] == task_id), None)
    if task is None:
        abort(404)
    return render_template("task_detail.html", task=task)


@app.route("/practice/")
def practice():
    practice_data = get_practice()
    tasks = get_tasks()
    task_map = {t["id"]: t["title"] for t in tasks}
    return render_template("practice.html", practice=practice_data, task_map=task_map)


@app.route("/practice/<int:task_id>/")
def practice_task(task_id):
    practice_data = get_practice()
    entry = next((p for p in practice_data if p["task_id"] == task_id), None)
    if entry is None:
        abort(404)
    tasks = get_tasks()
    task_info = next((t for t in tasks if t["id"] == task_id), None)
    return render_template("practice_task.html", entry=entry, task_info=task_info)


@app.route("/tests/")
def tests():
    tests_data = get_tests()
    return render_template("tests.html", tests=tests_data)


@app.route("/tests/<int:test_id>/")
def test_session(test_id):
    tests_data = get_tests()
    test = next((t for t in tests_data if t["id"] == test_id), None)
    if test is None:
        abort(404)
    return render_template("test_session.html", test=test)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
