import React, { useState } from 'react';
import type { Scene, AnimationElement, AnimationElementType } from '../types';
import './SceneManager.css';

interface SceneManagerProps {
  scenes: Scene[];
  selectedSceneId: string | null;
  onSelectScene: (sceneId: string) => void;
  onAddScene: () => void;
  onDeleteScene: (sceneId: string) => void;
  onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void;
  onAddElement: (sceneId: string, elementType: AnimationElementType) => void;
  onDeleteElement: (sceneId: string, elementId: string) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const SceneManager: React.FC<SceneManagerProps> = ({
  scenes,
  selectedSceneId,
  onSelectScene,
  onAddScene,
  onDeleteScene,
  onUpdateScene,
  onAddElement: _onAddElement, // Passed from parent but handled via onUpdateScene
  onDeleteElement,
}) => {
  const [showAddMenu, setShowAddMenu] = useState<string | null>(null);

  const selectedScene = scenes.find((s) => s.id === selectedSceneId);

  const handleAddScene = () => {
    onAddScene();
  };

  const handleAddElement = (sceneId: string, type: AnimationElementType) => {
    const newElement: AnimationElement = {
      id: generateId(),
      type,
      name: `New ${type}`,
      startTime: 0,
      endTime: 2,
      properties: getDefaultProperties(type),
    };

    if (selectedScene) {
      onUpdateScene(sceneId, {
        elements: [...selectedScene.elements, newElement],
      });
    }
    setShowAddMenu(null);
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

  return (
    <div className="scene-manager">
      <div className="scene-manager-header">
        <h3>Scenes</h3>
        <button className="add-scene-btn" onClick={handleAddScene}>
          + Add Scene
        </button>
      </div>

      <div className="scene-list">
        {scenes.map((scene, index) => (
          <div
            key={scene.id}
            className={`scene-item ${scene.id === selectedSceneId ? 'selected' : ''}`}
            onClick={() => onSelectScene(scene.id)}
          >
            <div className="scene-info">
              <span className="scene-number">{index + 1}</span>
              <input
                type="text"
                className="scene-name-input"
                value={scene.name}
                onChange={(e) => {
                  e.stopPropagation();
                  onUpdateScene(scene.id, { name: e.target.value });
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="scene-meta">
              <span className="scene-duration">{scene.duration}s</span>
              <span className="scene-elements">{scene.elements.length} elements</span>
            </div>
            <button
              className="delete-scene-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteScene(scene.id);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {selectedScene && (
        <div className="scene-elements-section">
          <div className="elements-header">
            <h4>Elements</h4>
            <div className="add-element-dropdown">
              <button
                className="add-element-btn"
                onClick={() => setShowAddMenu(showAddMenu === selectedScene.id ? null : selectedScene.id)}
              >
                + Add Element
              </button>
              {showAddMenu === selectedScene.id && (
                <div className="dropdown-menu">
                  <button onClick={() => handleAddElement(selectedScene.id, 'text')}>
                    Text
                  </button>
                  <button onClick={() => handleAddElement(selectedScene.id, 'shape')}>
                    Shape
                  </button>
                  <button onClick={() => handleAddElement(selectedScene.id, 'image')}>
                    Image
                  </button>
                  <button onClick={() => handleAddElement(selectedScene.id, 'chart')}>
                    Chart
                  </button>
                  <button onClick={() => handleAddElement(selectedScene.id, 'equation')}>
                    Equation
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="element-list">
            {selectedScene.elements.map((element) => (
              <div key={element.id} className="element-item">
                <span className="element-icon">{getElementIcon(element.type)}</span>
                <input
                  type="text"
                  className="element-name-input"
                  value={element.name}
                  readOnly
                />
                <button
                  className="delete-element-btn"
                  onClick={() => onDeleteElement(selectedScene.id, element.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const getElementIcon = (type: AnimationElementType): string => {
  switch (type) {
    case 'text': return 'T';
    case 'shape': return '□';
    case 'image': return '🖼';
    case 'chart': return '📊';
    case 'equation': return '∑';
    default: return '•';
  }
};

export default SceneManager;