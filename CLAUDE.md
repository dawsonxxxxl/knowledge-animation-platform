# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Knowledge Animation Platform - an educational animation platform for creating knowledge animations using Manim and video generation AI.

## Common Commands

```bash
# Frontend development
cd frontend
npm install        # Install dependencies
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run lint       # Run ESLint

# Backend development
cd backend
npm install        # Install Node.js dependencies
node index.js      # Start Node.js Express server
python main.py     # Start Python FastAPI server (for animation generation)
```

## Architecture

### Frontend
- **Framework**: React 19 + TypeScript with Vite 8
- **Entry point**: `frontend/src/main.tsx`
- **Main component**: `frontend/src/App.tsx`
- **Linting**: ESLint with React hooks plugin
- **Dev server port**: Vite defaults (5173)

### Backend (Node.js)
- **Framework**: Express 5 with CORS
- **Entry point**: `backend/index.js`
- **API routes**:
  - `backend/routes/animations.js` - Animation generation endpoints (POST/GET)
  - `backend/routes/projects.js` - Project CRUD endpoints (POST/GET)
- **Storage**: In-memory arrays (no database yet)
- **Server port**: 8000 (or `PORT` env var)

### Backend (Python)
- **Framework**: FastAPI
- **Entry point**: `backend/main.py`
- **Purpose**: Animation generation with Manim/CogVideoX (not yet implemented)
- **Server port**: 8000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project by ID |
| POST | `/api/animations` | Generate animation |
| GET | `/api/animations/:id` | Get animation status |

## Development Notes

- The Node.js backend uses CommonJS (`"type": "commonjs"` in package.json)
- The Python backend has a virtual environment at `backend/venv/`
- Animation generation logic is not yet implemented (TODOs in `backend/routes/animations.js`)
- No database - data stored in-memory
- Frontend makes API calls to backend on port 8000