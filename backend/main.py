from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.models import (
    PlanRequest,
    PlanResponse,
)

from backend.planner.scheduler import (
    generate_schedule,
)


app = FastAPI(
    title="DayFlow API",
    description=(
        "AI-powered work, school, "
        "and life scheduling API"
    ),
    version="0.2.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "DayFlow API is running"
    }


@app.get("/api/health")
def health():
    return {
        "status": "online",
        "app": "DayFlow",
        "version": "0.2.0",
        "planner": "online",
    }


@app.post(
    "/api/plan",
    response_model=PlanResponse,
)
def create_plan(request: PlanRequest):

    result = generate_schedule(
        request.tasks
    )

    scheduled_minutes = (
        result["scheduled_minutes"]
    )

    unscheduled_minutes = (
        result["unscheduled_minutes"]
    )

    if scheduled_minutes == 0:

        message = (
            "I couldn't find anything "
            "to schedule yet."
        )

    elif unscheduled_minutes > 0:

        message = (
            "Your workload is larger "
            "than today's available time, "
            "so I scheduled what fits first."
        )

    else:

        message = (
            "Everything fits today. "
            "I built a focused plan with "
            "breaks between your work blocks."
        )

    return PlanResponse(
        message=message,
        total_minutes=result[
            "total_minutes"
        ],
        scheduled_minutes=(
            scheduled_minutes
        ),
        unscheduled_minutes=(
            unscheduled_minutes
        ),
        schedule=result["schedule"],
    )