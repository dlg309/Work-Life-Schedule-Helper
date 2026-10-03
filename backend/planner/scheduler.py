from datetime import datetime, timedelta
from typing import List

from backend.models import Task, ScheduleBlock


PRIORITY_WEIGHT = {
    "high": 3,
    "medium": 2,
    "low": 1,
}


def parse_deadline(task: Task):
    if not task.date:
        return datetime.max

    try:
        return datetime.strptime(
            task.date,
            "%Y-%m-%d"
        )
    except ValueError:
        return datetime.max


def sort_tasks(tasks: List[Task]) -> List[Task]:
    unfinished_tasks = [
        task
        for task in tasks
        if not task.completed
    ]

    return sorted(
        unfinished_tasks,
        key=lambda task: (
            -PRIORITY_WEIGHT.get(
                task.priority.lower(),
                1
            ),
            parse_deadline(task),
        )
    )


def format_time(time: datetime) -> str:
    return time.strftime(
        "%I:%M %p"
    ).lstrip("0")


def generate_schedule(tasks: List[Task]):
    """
    Generate a basic daily schedule.

    Current MVP rules:
    - Planning window is 9 AM to 9 PM
    - High priority tasks are scheduled first
    - Deadline breaks priority ties
    - Focus blocks are at most 90 minutes
    - 15-minute breaks are added between blocks
    """

    sorted_tasks = sort_tasks(tasks)

    today = datetime.now()

    current_time = today.replace(
        hour=9,
        minute=0,
        second=0,
        microsecond=0
    )

    end_of_day = today.replace(
        hour=21,
        minute=0,
        second=0,
        microsecond=0
    )

    schedule = []

    total_minutes = sum(
        task.duration
        for task in sorted_tasks
    )

    scheduled_minutes = 0

    for task in sorted_tasks:

        remaining_minutes = task.duration

        while remaining_minutes > 0:

            if current_time >= end_of_day:
                break

            block_minutes = min(
                remaining_minutes,
                90
            )

            proposed_end = (
                current_time
                + timedelta(
                    minutes=block_minutes
                )
            )

            if proposed_end > end_of_day:

                block_minutes = int(
                    (
                        end_of_day
                        - current_time
                    ).total_seconds()
                    / 60
                )

                proposed_end = end_of_day

            if block_minutes <= 0:
                break

            schedule.append(
                ScheduleBlock(
                    task_id=task.id,
                    title=task.title,
                    category=task.category,
                    start=format_time(
                        current_time
                    ),
                    end=format_time(
                        proposed_end
                    ),
                    duration=block_minutes,
                    priority=task.priority,
                )
            )

            scheduled_minutes += block_minutes
            remaining_minutes -= block_minutes

            current_time = (
                proposed_end
                + timedelta(minutes=15)
            )

        if current_time >= end_of_day:
            break

    unscheduled_minutes = max(
        total_minutes - scheduled_minutes,
        0
    )

    return {
        "schedule": schedule,
        "total_minutes": total_minutes,
        "scheduled_minutes": scheduled_minutes,
        "unscheduled_minutes": unscheduled_minutes,
    }