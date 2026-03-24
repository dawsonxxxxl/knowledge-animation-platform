/**
 * Animation API Routes
 * Calls Python backend for actual Manim animation generation
 */

const express = require('express');
const router = express.Router();
const http = require('http');

const PYTHON_API = 'http://localhost:8001';

// In-memory animation jobs
const animationJobs = new Map();

// Helper to call Python API
function callPythonAPI(endpoint, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const url = new URL(endpoint, PYTHON_API);

    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// POST /api/animations - Generate animation from composition
router.post('/animations', async (req, res) => {
  const { composition, quality, projectId } = req.body;

  // Store job
  const jobId = `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  animationJobs.set(jobId, {
    id: jobId,
    projectId,
    status: 'pending',
    progress: 0,
    createdAt: new Date().toISOString()
  });

  try {
    // Call Python API to generate animation
    const result = await callPythonAPI('/api/generate', {
      composition: composition || {
        // Default test composition
        name: 'Test Animation',
        fps: 30,
        width: 1920,
        height: 1080,
        scenes: [{
          id: 'scene_1',
          name: 'Scene 1',
          order: 0,
          duration: 5,
          backgroundColor: '#1a1a2e',
          elements: [{
            id: 'title_1',
            type: 'text',
            name: 'Title',
            startTime: 0,
            endTime: 4,
            properties: {
              text: 'Hello from Manim!',
              fontSize: 48,
              color: '#ffffff',
              x: 960,
              y: 540
            }
          }]
        }]
      },
      quality: quality || 'medium_quality'
    });

    animationJobs.set(jobId, {
      ...animationJobs.get(jobId),
      status: result.success ? 'generating' : 'failed',
      pythonJobId: result.job_id,
      scriptPath: result.script_path
    });

    res.json({
      id: jobId,
      projectId,
      status: 'processing',
      progress: 25,
      message: 'Animation generation started',
      pythonJobId: result.job_id
    });

    // Trigger render in background
    try {
      const renderResult = await callPythonAPI('/api/render', {
        script_path: result.script_path,
        quality: quality || 'medium_quality'
      });

      const job = animationJobs.get(jobId);
      if (renderResult.success) {
        job.status = 'completed';
        job.progress = 100;
        job.videoUrl = renderResult.video_url;
        job.message = 'Animation generated successfully';
      } else {
        job.status = 'failed';
        job.error = renderResult.error;
      }
      animationJobs.set(jobId, job);
    } catch (e) {
      console.error('Render error:', e);
    }

  } catch (error) {
    console.error('Animation generation error:', error);
    animationJobs.set(jobId, {
      ...animationJobs.get(jobId),
      status: 'failed',
      error: error.message
    });

    res.json({
      id: jobId,
      status: 'failed',
      error: error.message
    });
  }
});

// GET /api/animations/:id - Get animation status
router.get('/animations/:id', async (req, res) => {
  const { id } = req.params;
  const job = animationJobs.get(id);

  if (!job) {
    // Check Python API
    try {
      const pythonStatus = await callPythonAPI(`/api/status/${id}`, {});
      res.json({
        id,
        status: pythonStatus.status,
        progress: pythonStatus.progress,
        videoUrl: pythonStatus.video_url,
        error: pythonStatus.error
      });
    } catch (e) {
      res.json({
        id,
        status: 'not_found',
        error: 'Animation job not found'
      });
    }
    return;
  }

  res.json({
    id: job.id,
    projectId: job.projectId,
    status: job.status,
    progress: job.progress || 50,
    videoUrl: job.videoUrl,
    error: job.error,
    createdAt: job.createdAt
  });
});

// GET /api/animations - List all animations
router.get('/animations', (req, res) => {
  const jobs = Array.from(animationJobs.values()).map(job => ({
    id: job.id,
    projectId: job.projectId,
    status: job.status,
    progress: job.progress,
    createdAt: job.createdAt
  }));

  res.json({ animations: jobs });
});

module.exports = router;