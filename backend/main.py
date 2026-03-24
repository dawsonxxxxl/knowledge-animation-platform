"""
Knowledge Animation Platform - Main Application
"""

import os
import uuid
import asyncio
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from manim_generator import (
    generate_manim_code,
    save_manim_script,
    render_video,
    OUTPUT_DIR
)

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

# In-memory storage for render jobs
render_jobs: Dict[str, Dict[str, Any]] = {}


# Request models
class GenerateRequest(BaseModel):
    composition: Dict[str, Any]
    quality: str = "medium_quality"


class RenderRequest(BaseModel):
    script_path: str
    quality: str = "medium_quality"


@app.get("/")
async def root():
    return {"message": "Knowledge Animation Platform API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/generate")
async def generate_animation(request: GenerateRequest):
    """Generate Manim code from composition data"""
    try:
        # Generate Manim Python code
        code = generate_manim_code(request.composition)

        # Save to file
        script_path = save_manim_script(code)

        job_id = f"job_{uuid.uuid4().hex[:8]}"

        render_jobs[job_id] = {
            "id": job_id,
            "script_path": script_path,
            "composition": request.composition,
            "quality": request.quality,
            "status": "ready",
            "progress": 0,
            "created_at": asyncio.get_event_loop().time()
        }

        return {
            "success": True,
            "job_id": job_id,
            "script_path": script_path,
            "message": "Manim script generated successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/render")
async def render_animation(request: RenderRequest):
    """Render the animation using Manim"""
    job_id = f"render_{uuid.uuid4().hex[:8]}"

    render_jobs[job_id] = {
        "id": job_id,
        "script_path": request.script_path,
        "quality": request.quality,
        "status": "processing",
        "progress": 0,
        "video_url": None,
        "error": None
    }

    # Run rendering in background (simplified - runs synchronously for now)
    try:
        result = render_video(request.script_path, request.quality)

        render_jobs[job_id].update({
            "status": result.get("status", "completed"),
            "progress": 100 if result.get("status") == "completed" else 0,
            "video_url": result.get("video_url"),
            "error": result.get("error"),
            "output_path": result.get("output_path")
        })

        return {
            "success": result.get("status") == "completed",
            "job_id": job_id,
            "status": render_jobs[job_id]["status"],
            "video_url": result.get("video_url"),
            "error": result.get("error")
        }

    except Exception as e:
        render_jobs[job_id].update({
            "status": "failed",
            "error": str(e)
        })
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/status/{job_id}")
async def get_render_status(job_id: str):
    """Get render job status"""
    if job_id not in render_jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    job = render_jobs[job_id]
    return {
        "job_id": job["id"],
        "status": job["status"],
        "progress": job.get("progress", 0),
        "video_url": job.get("video_url"),
        "error": job.get("error")
    }


@app.get("/api/output/{job_id}/{filename}")
async def get_output_video(job_id: str, filename: str):
    """Serve the rendered video file"""
    video_path = os.path.join(OUTPUT_DIR, job_id, 'videos', '1080p60', filename)

    if not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail="Video not found")

    return FileResponse(video_path, media_type="video/mp4")


# Legacy compatibility endpoints
@app.post("/api/animations")
async def create_animation(req: dict):
    """Legacy endpoint for animation creation"""
    # Accept project-based or direct composition
    composition = req.get("composition", req)

    generate_req = GenerateRequest(
        composition=composition,
        quality=req.get("quality", "medium_quality")
    )

    return await generate_animation(generate_req)


@app.get("/api/animations/{job_id}")
async def get_animation_status(job_id: str):
    """Legacy endpoint for animation status"""
    return await get_render_status(job_id)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)  # Use port 8001 to avoid conflict