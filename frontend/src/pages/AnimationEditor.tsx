import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RemotionPlayer } from '../components/RemotionPlayer';
import { Timeline } from '../components/Timeline';
import { SceneManager } from '../components/SceneManager';
import { ElementPanel } from '../components/ElementPanel';
import type { Composition, Scene, AnimationElement, AnimationElementType, TimelineState } from '../types';
import { renderService } from '../services/render';
import type { RenderJob } from '../services/render';
import './animationEditor.css';

const generateId = () => Math.random().toString(36).substr(2, 9);

const createDefaultComposition = (projectId: string): Composition => ({
  id: generateId(),
  projectId,
  name: 'Untitled Animation',
  duration: 10,
  fps: 30,
  width: 1920,
  height: 1080,
  scenes: [
    {
      id: generateId(),
      name: 'Scene 1',
      order: 0,
      duration: 5,
      elements: [
        {
          id: generateId(),
          type: 'text',
          name: 'Welcome',
          startTime: 0,
          endTime: 3,
          properties: {
            text: 'Welcome to Knowledge Animation',
            fontSize: 72,
            fontFamily: 'sans-serif',
            color: '#ffffff',
            x: 200,
            y: 400,
          },
        },
      ],
      backgroundColor: '#1e3a8a',
    },
    {
      id: generateId(),
      name: 'Scene 2',
      order: 1,
      duration: 5,
      elements: [],
      backgroundColor: '#065f46',
    },
  ],
});

export const AnimationEditor: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [composition, setComposition] = useState<Composition>(() =>
    createDefaultComposition(projectId || 'demo')
  );

  const [timelineState, setTimelineState] = useState<TimelineState>({
    currentTime: 0,
    isPlaying: false,
    selectedElementId: null,
    zoom: 1,
  });

  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(
    composition.scenes[0]?.id || null
  );

  // Export modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'mp4' | 'webm' | 'gif'>('mp4');
  const [exportQuality, setExportQuality] = useState<'low' | 'medium' | 'high'>('high');
  const [exportFps, setExportFps] = useState(30);
  const [renderJob, setRenderJob] = useState<RenderJob | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Calculate total duration from scenes
  const totalDuration = useMemo(() => {
    return composition.scenes.reduce((acc, scene) => acc + scene.duration, 0);
  }, [composition.scenes]);

  const handleTimeChange = useCallback((time: number) => {
    setTimelineState((prev) => ({ ...prev, currentTime: time }));
  }, []);

  const handlePlayPause = useCallback(() => {
    setTimelineState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const handleSelectElement = useCallback((elementId: string | null) => {
    setTimelineState((prev) => ({ ...prev, selectedElementId: elementId }));
  }, []);

  const handleZoomChange = useCallback((zoom: number) => {
    setTimelineState((prev) => ({ ...prev, zoom }));
  }, []);

  const handleAddScene = useCallback(() => {
    const newScene: Scene = {
      id: generateId(),
      name: `Scene ${composition.scenes.length + 1}`,
      order: composition.scenes.length,
      duration: 3,
      elements: [],
      backgroundColor: '#374151',
    };
    setComposition((prev) => ({
      ...prev,
      scenes: [...prev.scenes, newScene],
    }));
    setSelectedSceneId(newScene.id);
  }, [composition.scenes.length]);

  const handleDeleteScene = useCallback((sceneId: string) => {
    setComposition((prev) => ({
      ...prev,
      scenes: prev.scenes.filter((s) => s.id !== sceneId),
    }));
    if (selectedSceneId === sceneId) {
      setSelectedSceneId(composition.scenes[0]?.id || null);
    }
  }, [selectedSceneId, composition.scenes]);

  const handleUpdateScene = useCallback((sceneId: string, updates: Partial<Scene>) => {
    setComposition((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.id === sceneId ? { ...s, ...updates } : s
      ),
    }));
  }, []);

  const handleAddElement = useCallback((sceneId: string, elementType: AnimationElementType) => {
    const newElement: AnimationElement = {
      id: generateId(),
      type: elementType,
      name: `New ${elementType}`,
      startTime: 0,
      endTime: 2,
      properties: getDefaultProperties(elementType),
    };

    setComposition((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.id === sceneId
          ? { ...s, elements: [...s.elements, newElement] }
          : s
      ),
    }));
  }, []);

  const handleDeleteElement = useCallback((sceneId: string, elementId: string) => {
    setComposition((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) =>
        s.id === sceneId
          ? { ...s, elements: s.elements.filter((e) => e.id !== elementId) }
          : s
      ),
    }));
    if (timelineState.selectedElementId === elementId) {
      setTimelineState((prev) => ({ ...prev, selectedElementId: null }));
    }
  }, [timelineState.selectedElementId]);

  const handleUpdateElement = useCallback((updates: Partial<AnimationElement>) => {
    setComposition((prev) => ({
      ...prev,
      scenes: prev.scenes.map((scene) => ({
        ...scene,
        elements: scene.elements.map((element) =>
          element.id === timelineState.selectedElementId
            ? { ...element, ...updates }
            : element
        ),
      })),
    }));
  }, [timelineState.selectedElementId]);

  // Find the selected element
  const selectedElement = useMemo(() => {
    for (const scene of composition.scenes) {
      const element = scene.elements.find(
        (e) => e.id === timelineState.selectedElementId
      );
      if (element) return element;
    }
    return null;
  }, [composition.scenes, timelineState.selectedElementId]);

  const compositionWithDuration = useMemo(() => ({
    ...composition,
    duration: totalDuration,
  }), [composition, totalDuration]);

  // Export handlers
  const handleExportClick = useCallback(() => {
    setShowExportModal(true);
    setRenderJob(null);
  }, []);

  const handleStartExport = useCallback(async () => {
    try {
      const result = await renderService.startRender({
        compositionId: composition.id,
        format: exportFormat,
        quality: exportQuality,
        fps: exportFps,
      });
      setRenderJob({
        id: result.jobId,
        compositionId: composition.id,
        format: exportFormat,
        quality: exportQuality,
        fps: exportFps,
        status: 'queued',
        progress: 0,
        createdAt: new Date().toISOString(),
      });
      setIsPolling(true);
    } catch (error) {
      console.error('Failed to start render:', error);
    }
  }, [composition.id, exportFormat, exportQuality, exportFps]);

  // Poll for render status
  useEffect(() => {
    if (!isPolling || !renderJob) return;

    const pollInterval = setInterval(async () => {
      try {
        const status = await renderService.getRenderStatus(renderJob.id);
        setRenderJob(status);

        if (status.status === 'completed' || status.status === 'failed' || status.status === 'cancelled') {
          setIsPolling(false);
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Failed to get render status:', error);
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [isPolling, renderJob?.id]);

  const handleCloseExportModal = useCallback(() => {
    setShowExportModal(false);
    setRenderJob(null);
    setIsPolling(false);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!renderJob) return;
    try {
      const result = await renderService.getDownloadUrl(renderJob.id);
      // In production, this would trigger an actual download
      alert(`Download would start from: ${result.url}`);
    } catch (error) {
      console.error('Failed to get download URL:', error);
    }
  }, [renderJob]);

  return (
    <div className="animation-editor">
      <div className="editor-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/')}>
            ← Back
          </button>
          <h1>{composition.name}</h1>
        </div>
        <div className="header-right">
          <button className="export-btn" onClick={handleExportClick}>Export Video</button>
        </div>
      </div>

      <div className="editor-main">
        <div className="preview-section">
          <RemotionPlayer
            composition={compositionWithDuration}
            currentTime={timelineState.currentTime}
            onTimeChange={handleTimeChange}
            isPlaying={timelineState.isPlaying}
            onPlayPause={handlePlayPause}
          />
        </div>

        <div className="timeline-section">
          <Timeline
            composition={compositionWithDuration}
            currentTime={timelineState.currentTime}
            selectedElementId={timelineState.selectedElementId}
            onTimeChange={handleTimeChange}
            onSelectElement={handleSelectElement}
            zoom={timelineState.zoom}
            onZoomChange={handleZoomChange}
          />
        </div>

        <div className="sidebar">
          <SceneManager
            scenes={composition.scenes}
            selectedSceneId={selectedSceneId}
            onSelectScene={setSelectedSceneId}
            onAddScene={handleAddScene}
            onDeleteScene={handleDeleteScene}
            onUpdateScene={handleUpdateScene}
            onAddElement={handleAddElement}
            onDeleteElement={handleDeleteElement}
          />
          <ElementPanel
            element={selectedElement}
            onUpdateElement={handleUpdateElement}
          />
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="export-modal-overlay" onClick={handleCloseExportModal}>
          <div className="export-modal" onClick={e => e.stopPropagation()}>
            <h2>Export Video</h2>

            {!renderJob ? (
              <>
                <div className="export-option">
                  <label>Format</label>
                  <div className="format-options">
                    <div
                      className={`format-option ${exportFormat === 'mp4' ? 'selected' : ''}`}
                      onClick={() => setExportFormat('mp4')}
                    >
                      <div className="format-name">MP4</div>
                      <div className="format-desc">Best compatibility</div>
                    </div>
                    <div
                      className={`format-option ${exportFormat === 'webm' ? 'selected' : ''}`}
                      onClick={() => setExportFormat('webm')}
                    >
                      <div className="format-name">WebM</div>
                      <div className="format-desc">Smaller size</div>
                    </div>
                    <div
                      className={`format-option ${exportFormat === 'gif' ? 'selected' : ''}`}
                      onClick={() => setExportFormat('gif')}
                    >
                      <div className="format-name">GIF</div>
                      <div className="format-desc">No audio</div>
                    </div>
                  </div>
                </div>

                <div className="export-option">
                  <label>Quality</label>
                  <select
                    value={exportQuality}
                    onChange={e => setExportQuality(e.target.value as 'low' | 'medium' | 'high')}
                  >
                    <option value="low">Low (720p)</option>
                    <option value="medium">Medium (1080p)</option>
                    <option value="high">High (1080p@60fps)</option>
                  </select>
                </div>

                <div className="export-option">
                  <label>Frame Rate</label>
                  <select
                    value={exportFps}
                    onChange={e => setExportFps(Number(e.target.value))}
                  >
                    <option value={24}>24 fps</option>
                    <option value={30}>30 fps</option>
                    <option value={60}>60 fps</option>
                  </select>
                </div>
              </>
            ) : (
              <div className="render-progress">
                <div className="render-progress-bar">
                  <div
                    className="render-progress-fill"
                    style={{ width: `${renderJob.progress}%` }}
                  />
                </div>
                <div className="render-progress-text">
                  {renderJob.status === 'queued' && 'Preparing render...'}
                  {renderJob.status === 'processing' && `Rendering... ${Math.round(renderJob.progress)}%`}
                  {renderJob.status === 'completed' && 'Render complete!'}
                  {renderJob.status === 'failed' && `Error: ${renderJob.error}`}
                  {renderJob.status === 'cancelled' && 'Render cancelled'}
                </div>
              </div>
            )}

            <div className="export-modal-actions">
              <button className="btn-cancel" onClick={handleCloseExportModal}>
                {renderJob?.status === 'completed' ? 'Close' : 'Cancel'}
              </button>
              {!renderJob && (
                <button className="btn-export" onClick={handleStartExport}>
                  Start Export
                </button>
              )}
              {renderJob?.status === 'completed' && (
                <button className="btn-download" onClick={handleDownload}>
                  Download
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getDefaultProperties = (type: AnimationElementType) => {
  switch (type) {
    case 'text':
      return { text: 'New Text', fontSize: 48, fontFamily: 'sans-serif', color: '#ffffff', x: 100, y: 100 };
    case 'shape':
      return { shapeType: 'rectangle' as const, width: 200, height: 100, fill: '#3b82f6', stroke: '#1d4ed8', strokeWidth: 2, x: 100, y: 100 };
    case 'image':
      return { src: '', width: 200, height: 200, x: 100, y: 100 };
    case 'chart':
      return { chartType: 'bar' as const, data: [{ label: 'A', value: 10 }, { label: 'B', value: 20 }] };
    case 'equation':
      return { latex: 'E = mc^2', x: 100, y: 100, scale: 1 };
  }
};

export default AnimationEditor;