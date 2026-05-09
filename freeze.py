"""Собирает статический сайт в каталог build/ (для GitHub Pages)."""
from flask_frozen import Freezer

from app import app, get_practice, get_tasks, get_tests

app.config["FREEZER_RELATIVE_URLS"] = True
app.config["FREEZER_DESTINATION"] = "build"

freezer = Freezer(app)


@freezer.register_generator
def task_detail():
    for t in get_tasks():
        yield {"task_id": t["id"]}


@freezer.register_generator
def practice_task():
    for p in get_practice():
        yield {"task_id": p["task_id"]}


@freezer.register_generator
def test_session():
    for tst in get_tests():
        yield {"test_id": tst["id"]}


if __name__ == "__main__":
    freezer.freeze()
