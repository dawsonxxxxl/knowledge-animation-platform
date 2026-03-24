# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Knowledge Animation Platform - an educational animation platform for creating knowledge animations using Manim and React-based editing.

### Frontend
- **Framework**: React 19 + TypeScript with Vite 8
- **Entry point**: `frontend/src/main.tsx`
- **Main component**: `frontend/src/App.tsx`
- **Dev server port**: 5173 (Vite default)

### Backend (Node.js)
- **Framework**: Express 5 with CORS
- **Entry point**: `backend/index.js`
- **Server port**: 8000 (or `PORT` env var)
- **Module system**: CommonJS (`"type": "commonjs"` in package.json)

### Backend (Python)
- **Entry point**: `backend/manim_generator.py` (standalone script, not a running server)
- **Purpose**: Generates Manim Python code and renders animations
- **Output**: Renders to `backend/output/`

## Common Commands

```bash
# Frontend
cd frontend
npm install
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run lint       # Run ESLint

# Backend
cd backend
npm install        # Install Node.js dependencies
node index.js      # Start Express server
```

Note: Python backend is invoked via the Node.js server, not run separately. Manim is called directly by `manim_generator.py`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check |
| GET/POST | `/api/projects` | List/Create projects |
| GET | `/api/projects/:id` | Get project by ID |
| GET/POST | `/api/animations` | List/Create animations |
| GET | `/api/animations/:id` | Get animation status |
| GET/POST | `/api/render` | List/Create render jobs |
| GET | `/api/render/:id` | Get render job status |
| POST | `/api/preview` | Get preview frame at time |
| POST | `/api/ai/generate` | AI-generate animation structure |
| POST | `/api/ai/layout` | Get layout suggestions |
| POST | `/api/ai/recommend` | Get smart recommendations |

## Data Structures

Projects and compositions use these types (see `frontend/src/types/index.ts`):
- **Composition**: Contains scenes, fps, dimensions
- **Scene**: Contains elements, duration, backgroundColor
- **Element**: Text, equation, shape, chart, image with properties

## Architecture Notes

- Frontend makes API calls to Node.js backend on port 8000
- Node.js backend proxies animation generation to Python (`manim_generator.py`)
- Render jobs simulate progress asynchronously (in-memory)
- AI routes provide mock generation (not connected to actual AI)
- No database - all data stored in-memory
- Animation files render to `backend/output/` directory