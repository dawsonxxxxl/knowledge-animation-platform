/**
 * Knowledge Animation Platform - Main App
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Projects } from './pages/Projects';
import { CreateProject } from './pages/CreateProject';
import { AnimationEditor } from './pages/AnimationEditor';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Projects />} />
          <Route path="projects/new" element={<CreateProject />} />
          <Route path="editor/:projectId" element={<AnimationEditor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;