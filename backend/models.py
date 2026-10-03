from typing import List, Optional
from pydantic import BaseModel


class Task(BaseModel):
    id: int
    title: str
    category: str
    date: Optional[str] = None
    duration: int
    priority: str
    completed: bool = False


class PlanRequest(BaseModel):
    tasks: List[Task]


class ScheduleBlock(BaseModel):
    task_id: int
    title: str
    category: str
    start: str
    end: str
    duration: int
    priority: str


class PlanResponse(BaseModel):
    message: str
    total_minutes: int
    scheduled_minutes: int
    unscheduled_minutes: int
    schedule: List[ScheduleBlock]