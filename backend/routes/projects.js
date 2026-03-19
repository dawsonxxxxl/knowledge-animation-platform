/**
 * Project API Routes
 */

const express = require('express');
const router = express.Router();

// In-memory storage (replace with database later)
const projects = [];

// GET /api/projects - List all projects
router.get('/projects', (req, res) => {
  res.json({ projects });
});

// POST /api/projects - Create new project
router.post('/projects', (req, res) => {
  const { name, description } = req.body;
  
  const project = {
    id: `proj_${Date.now()}`,
    name,
    description,
    createdAt: new Date().toISOString(),
    status: 'draft'
  };
  
  projects.push(project);
  
  res.json({ success: true, project });
});

// GET /api/projects/:id - Get project by ID
router.get('/projects/:id', (req, res) => {
  const { id } = req.params;
  const project = projects.find(p => p.id === id);
  
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  res.json({ project });
});

module.exports = router;