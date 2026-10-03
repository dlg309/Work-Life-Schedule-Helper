from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="DayFlow API",
    description="AI-powered work, school, and life scheduling API",
    version="0.1.0",
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
        "version": "0.1.0"
    }