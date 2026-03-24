/**
 * Project API Routes
 */

const express = require('express');
const router = express.Router();

// In-memory storage (replace with database later)
const projects = [];

// GET /api/projects - List all projects
router.get('/projects', (req, res) => {
  // Map to frontend expected format (title instead of name)
  const mappedProjects = projects.map(p => ({
    id: p.id,
    title: p.name,
    description: p.description,
    status: p.status,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt || p.createdAt
  }));
  res.json(mappedProjects);
});

// POST /api/projects - Create new project
router.post('/projects', (req, res) => {
  const { title, description, status = 'draft' } = req.body;

  const now = new Date().toISOString();
  const project = {
    id: `proj_${Date.now()}`,
    name: title,
    description,
    createdAt: now,
    updatedAt: now,
    status
  };

  projects.push(project);

  // Return in frontend expected format
  res.json({
    id: project.id,
    title: project.name,
    description: project.description,
    status: project.status,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  });
});

// GET /api/projects/:id - Get project by ID
router.get('/projects/:id', (req, res) => {
  const { id } = req.params;
  const project = projects.find(p => p.id === id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  res.json({
    id: project.id,
    title: project.name,
    description: project.description,
    status: project.status,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt || project.createdAt
  });
});

// DELETE /api/projects/:id - Delete project
router.delete('/projects/:id', (req, res) => {
  const { id } = req.params;
  const index = projects.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }

  projects.splice(index, 1);
  res.json({ success: true });
});

// PATCH /api/projects/:id - Update project
router.patch('/projects/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;
  const project = projects.find(p => p.id === id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  if (title !== undefined) project.name = title;
  if (description !== undefined) project.description = description;
  if (status !== undefined) project.status = status;
  project.updatedAt = new Date().toISOString();

  res.json({
    id: project.id,
    title: project.name,
    description: project.description,
    status: project.status,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  });
});

module.exports = router;