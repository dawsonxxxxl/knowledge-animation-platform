/**
 * Render API Routes
 * Handles video rendering and export functionality
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// In-memory storage for render jobs
const renderJobs = new Map();

// Manim path
const MANIM_BIN = '/Library/Frameworks/Python.framework/Versions/3.12/bin/manim';
const OUTPUT_DIR = path.join(__dirname, '..', 'output', 'media', 'videos');
const MANIM_GENERATOR = path.join(__dirname, '..', 'manim_generator.py');

// POST /api/render - Start a new render job
router.post('/render', (req, res) => {
  const { compositionId, format, quality, fps, composition } = req.body;

  const jobId = `render_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Quality settings
  const qualitySettings = {
    'low': { height: 720, fps: 15 },
    'medium': { height: 1080, fps: 30 },
    'high': { height: 1080, fps: 60 }
  };
  const settings = qualitySettings[quality] || qualitySettings.high;

  const job = {
    id: jobId,
    compositionId,
    format: format || 'mp4',
    quality: quality || 'high',
    fps: fps || settings.fps,
    height: settings.height,
    width: 1920,
    composition,
    status: 'queued',
    progress: 0,
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
    outputUrl: null,
    outputPath: null,
    error: null,
  };

  renderJobs.set(jobId, job);

  // Start actual rendering process
  startManimRender(jobId);

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

  // Serve the actual rendered file
  const outputPath = job.outputPath;
  if (outputPath && fs.existsSync(outputPath)) {
    const filename = path.basename(outputPath);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.sendFile(outputPath);
  }

  // Fallback if file not found
  res.json({
    success: false,
    error: 'Output file not found'
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

// Render using Manim
function startManimRender(jobId) {
  const job = renderJobs.get(jobId);
  if (!job) return;

  job.status = 'processing';
  job.startedAt = new Date().toISOString();

  // Use default composition if none provided
  const composition = job.composition || {
    scenes: [{
      name: 'Scene 1',
      elements: [{
        id: 'text_1',
        type: 'text',
        name: 'Title',
        startTime: 0,
        endTime: 5,
        properties: {
          text: 'Hello from Manim!',
          fontSize: 48,
          color: '#FFFFFF'
        }
      }]
    }],
    fps: job.fps,
    width: job.width,
    height: job.height
  };

  // Create output directory
  const jobOutputDir = path.join(OUTPUT_DIR, jobId);
  fs.mkdirSync(jobOutputDir, { recursive: true });

  // Generate Manim Python code
  const manimCode = generateManimCode(composition, jobId);
  const pythonFile = path.join(jobOutputDir, 'animation.py');
  fs.writeFileSync(pythonFile, manimCode);

  // Determine quality flag for Manim
  const qualityFlags = {
    'low': '-ql',   // low quality (480p15)
    'medium': '-qm', // medium quality (720p30)
    'high': '-qh'    // high quality (1080p60)
  };
  const qualityFlag = qualityFlags[job.quality] || '-qm';

  console.log(`[Render ${jobId}] Starting Manim render...`);
  console.log(`[Render ${jobId}] Quality: ${job.quality}, FPS: ${job.fps}`);

  // Run Manim
  const manimProcess = spawn(MANIM_BIN, [
    qualityFlag,
    pythonFile,
    'AnimationScene',
    '--output_file', 'output',
    '-f'  // output format (mp4)
  ], {
    cwd: jobOutputDir,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let stderr = '';

  manimProcess.stderr.on('data', (data) => {
    const text = data.toString();
    stderr += text;

    // Parse progress from Manim output
    const progressMatch = text.match(/Rendered (\d+)/);
    if (progressMatch) {
      const progress = Math.min(parseInt(progressMatch[1]) * 10, 90);
      job.progress = progress;
    }
  });

  manimProcess.on('close', (code) => {
    console.log(`[Render ${jobId}] Manim process exited with code ${code}`);

    if (code === 0 || fs.existsSync(path.join(jobOutputDir, 'output.mp4'))) {
      // Check for generated files
      const outputFile = path.join(jobOutputDir, 'output.mp4');
      const mediaDir = path.join(jobOutputDir, 'media', 'videos');

      let finalOutput = outputFile;

      // Check different possible output locations
      if (!fs.existsSync(outputFile)) {
        // Check media/videos/{scenename}/{quality}/output.mp4
        const dirs = fs.readdirSync(mediaDir).filter(f => fs.statSync(path.join(mediaDir, f)).isDirectory());
        for (const dir of dirs) {
          const videoDir = path.join(mediaDir, dir);
          if (fs.existsSync(videoDir)) {
            const qualityDirs = fs.readdirSync(videoDir).filter(f => fs.statSync(path.join(videoDir, f)).isDirectory());
            for (const qdir of qualityDirs) {
              const outFile = path.join(videoDir, qdir, 'output.mp4');
              if (fs.existsSync(outFile)) {
                finalOutput = outFile;
                break;
              }
              // Also check for Scene_*.mp4
              const mp4Files = fs.readdirSync(path.join(videoDir, qdir)).filter(f => f.endsWith('.mp4'));
              if (mp4Files.length > 0) {
                finalOutput = path.join(videoDir, qdir, mp4Files[0]);
                break;
              }
            }
          }
          if (finalOutput !== outputFile) break;
        }
      }

      if (fs.existsSync(finalOutput)) {
        job.progress = 100;
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
        job.outputUrl = `/api/render/${jobId}/download`;
        job.outputPath = finalOutput;
        console.log(`[Render ${jobId}] Render complete: ${finalOutput}`);
      } else {
        job.status = 'failed';
        job.error = 'Output file not found';
        console.error(`[Render ${jobId}] Output file not found at ${finalOutput}`);
      }
    } else {
      job.status = 'failed';
      job.error = stderr.slice(-500) || 'Manim rendering failed';
      console.error(`[Render ${jobId}] Render failed:`, stderr.slice(-500));
    }
  });

  manimProcess.on('error', (err) => {
    job.status = 'failed';
    job.error = err.message;
    console.error(`[Render ${jobId}] Process error:`, err.message);
  });
}

// Generate Manim Python code from composition
function generateManimCode(composition, jobId) {
  const scenes = [];

  for (const scene of composition.scenes) {
    const elements = [];

    for (const element of scene.elements || []) {
      if (element.type === 'text') {
        const props = element.properties || {};
        const text = props.text || 'Text';
        const color = props.color || '#FFFFFF';
        const fontSize = props.fontSize || 48;

        elements.push(`        text = Text("${text}", font_size=${fontSize}, color="${color}")
        self.play(Write(text))`);
      } else if (element.type === 'equation') {
        const props = element.properties || {};
        const equation = props.equation || 'x^2';

        elements.push(`        equation = MathTex(r"${equation}")
        self.play(Write(equation))`);
      } else if (element.type === 'shape') {
        const props = element.properties || {};
        const shapeType = props.shapeType || 'circle';
        const color = props.color || '#FFFFFF';

        elements.push(`        shape = ${shapeType}(color="${color}")
        self.play(Create(shape))`);
      }
    }

    if (elements.length === 0) {
      elements.push(`        text = Text("Animation", font_size=48)
        self.play(Write(text))`);
    }

    scenes.push(`
class Scene_${scene.name.replace(/\s+/g, '_')}(Scene):
    def construct(self):
${elements.join('\n        self.wait(1)\n')}
        self.wait(1)
`);
  }

  // Default scene if none provided
  if (scenes.length === 0) {
    scenes.push(`
class AnimationScene(Scene):
    def construct(self):
        text = Text("Hello from Manim!", font_size=48)
        self.play(Write(text))
        self.wait(1)
`);
  }

  return `"""
Auto-generated animation by Knowledge Animation Platform
"""

from manim import *

config.pixel_height = ${composition.height || 1080}
config.pixel_width = ${composition.width || 1920}
config.frame_rate = ${composition.fps || 30}

${scenes.join('\n')}
`;
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