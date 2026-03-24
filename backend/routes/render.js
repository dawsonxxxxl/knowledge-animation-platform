/**
 * Render API Routes
 * Handles video rendering and export functionality
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// In-memory storage for render jobs
const renderJobs = new Map();

// POST /api/render - Start a new render job
router.post('/render', (req, res) => {
  const { compositionId, format, quality, fps } = req.body;

  const jobId = `render_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const job = {
    id: jobId,
    compositionId,
    format: format || 'mp4',
    quality: quality || 'high',
    fps: fps || 30,
    status: 'queued',
    progress: 0,
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
    outputUrl: null,
    error: null,
  };

  renderJobs.set(jobId, job);

  // Simulate async rendering process
  simulateRender(jobId);

  res.json({
    success: true,
    jobId,
    status: 'queued',
    message: `Render job started for format: ${format || 'mp4'}`
  });
});

// GET /api/render/:id - Get render job status
router.get('/render/:id', (req, res) => {
  const { id } = req.params;
  const job = renderJobs.get(id);

  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Render job not found'
    });
  }

  res.json({
    id: job.id,
    status: job.status,
    progress: job.progress,
    outputUrl: job.outputUrl,
    error: job.error,
    createdAt: job.createdAt,
    completedAt: job.completedAt,
  });
});

// GET /api/render/:id/download - Download rendered video
router.get('/render/:id/download', (req, res) => {
  const { id } = req.params;
  const job = renderJobs.get(id);

  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Render job not found'
    });
  }

  if (job.status !== 'completed') {
    return res.status(400).json({
      success: false,
      error: 'Render not yet completed',
      status: job.status
    });
  }

  // In production, this would serve the actual rendered file
  // For now, return a placeholder response
  res.json({
    success: true,
    message: 'Download would be served here in production',
    format: job.format,
    jobId: job.id
  });
});

// GET /api/render - List all render jobs
router.get('/render', (req, res) => {
  const jobs = Array.from(renderJobs.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    success: true,
    jobs: jobs.map(job => ({
      id: job.id,
      compositionId: job.compositionId,
      format: job.format,
      status: job.status,
      progress: job.progress,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    }))
  });
});

// DELETE /api/render/:id - Cancel a render job
router.delete('/render/:id', (req, res) => {
  const { id } = req.params;
  const job = renderJobs.get(id);

  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Render job not found'
    });
  }

  if (job.status === 'completed' || job.status === 'failed') {
    return res.status(400).json({
      success: false,
      error: 'Cannot cancel a completed or failed job'
    });
  }

  job.status = 'cancelled';
  job.completedAt = new Date().toISOString();

  res.json({
    success: true,
    message: 'Render job cancelled',
    jobId: id
  });
});

// Simulate render process (placeholder for actual Remotion rendering)
function simulateRender(jobId) {
  const job = renderJobs.get(jobId);
  if (!job) return;

  job.status = 'processing';
  job.startedAt = new Date().toISOString();

  let progress = 0;
  const interval = setInterval(() => {
    if (job.status === 'cancelled') {
      clearInterval(interval);
      return;
    }

    progress += Math.random() * 15 + 5;
    if (progress >= 100) {
      progress = 100;
      job.progress = progress;
      job.status = 'completed';
      job.completedAt = new Date().toISOString();
      job.outputUrl = `/api/render/${jobId}/download`;
      clearInterval(interval);
    } else {
      job.progress = Math.min(progress, 99);
    }
  }, 500);
}

// POST /api/preview - Get a quick preview frame
router.post('/preview', (req, res) => {
  const { composition, time } = req.body;

  if (!composition || time === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Composition and time are required'
    });
  }

  // Find the current scene at the given time
  let sceneStart = 0;
  let currentScene = null;

  for (const scene of composition.scenes) {
    const sceneEnd = sceneStart + scene.duration;
    if (time >= sceneStart && time < sceneEnd) {
      currentScene = scene;
      break;
    }
    sceneStart = sceneEnd;
  }

  if (!currentScene) {
    currentScene = composition.scenes[0];
  }

  // Filter visible elements at this time
  const visibleElements = currentScene.elements.filter(
    element => time >= element.startTime && time <= element.endTime
  );

  res.json({
    success: true,
    scene: currentScene,
    elements: visibleElements,
    time,
    backgroundColor: currentScene.backgroundColor
  });
});

module.exports = router;