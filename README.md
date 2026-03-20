# Knowledge Animation Platform

An educational animation platform for creating knowledge animations using Manim and video generation AI.

## Tech Stack

### Frontend
- React + TypeScript
- Vite (build tool)

### Backend
- Node.js + Express
- RESTful API

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Running the Application

```bash
# Start frontend (development)
cd frontend
npm run dev

# Start backend
cd backend
node index.js
```

## API Endpoints

- `GET /api/animations` - List animations
- `POST /api/animations` - Create animation
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /health` - Health check

## Project Structure

```
knowledge-animation-platform/
├── frontend/          # React frontend
│   ├── src/
│   └── ...
├── backend/          # Node.js backend
│   ├── routes/
│   └── index.js
└── README.md
```

## License

MIT