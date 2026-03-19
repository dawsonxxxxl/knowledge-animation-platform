"""
Knowledge Animation Platform - Main Application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Knowledge Animation Platform",
    description="Backend API for generating educational animations",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Knowledge Animation Platform API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# TODO: Add API routes for:
# - Text to animation generation
# - Project management
# - User authentication
# - Animation export

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)