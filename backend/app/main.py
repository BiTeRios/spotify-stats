from fastapi import FastAPI

app = FastAPI(
    title="Spotify Stats API",
    description="Backend API for the Spotify Stats application",
    version="0.1.0",
)

@app.get("/")
async def root () -> dict[str, str]:
    return {
        "message": "Backend works correctly"
    }