import React, { useRef, useCallback, useState } from 'react';
import type { Composition } from '../types';
import './Timeline.css';

interface TimelineProps {
  composition: Composition;
  currentTime: number;
  selectedElementId: string | null;
  onTimeChange: (time: number) => void;
  onSelectElement: (elementId: string | null) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  composition,
  currentTime,
  selectedElementId,
  onTimeChange,
  onSelectElement,
  zoom,
  onZoomChange,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const pixelsPerSecond = 50 * zoom;
  const totalDuration = composition.duration;

  const getTimeFromPosition = useCallback((clientX: number) => {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const scrollLeft = timelineRef.current.scrollLeft;
    const x = clientX - rect.left + scrollLeft;
    const time = x / pixelsPerSecond;
    return Math.max(0, Math.min(time, totalDuration));
  }, [pixelsPerSecond, totalDuration]);

  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.element-block')) return;
    const time = getTimeFromPosition(e.clientX);
    onTimeChange(time);
    onSelectElement(null);
  }, [getTimeFromPosition, onTimeChange, onSelectElement]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.element-block')) return;
    setIsDragging(true);
    const time = getTimeFromPosition(e.clientX);
    onTimeChange(time);
  }, [getTimeFromPosition, onTimeChange]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const time = getTimeFromPosition(e.clientX);
      onTimeChange(time);
    }
  }, [isDragging, getTimeFromPosition, onTimeChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Calculate scene positions
  let sceneOffset = 0;
  const scenePositions = composition.scenes.map((scene) => {
    const start = sceneOffset;
    const end = start + scene.duration;
    sceneOffset = end;
    return { scene, start, end };
  });

  const playheadPosition = currentTime * pixelsPerSecond;

  // Generate time markers
  const markers = [];
  const markerInterval = zoom > 1 ? 1 : zoom > 0.5 ? 2 : 5;
  for (let t = 0; t <= totalDuration; t += markerInterval) {
    markers.push(t);
  }

  const handleElementClick = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    onSelectElement(elementId);
  };

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <div className="timeline-controls">
          <button
            onClick={() => onZoomChange(Math.max(0.25, zoom - 0.25))}
            className="zoom-btn"
          >
            -
          </button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => onZoomChange(Math.min(4, zoom + 0.25))}
            className="zoom-btn"
          >
            +
          </button>
        </div>
        <div className="time-display">
          {currentTime.toFixed(2)}s / {totalDuration.toFixed(2)}s
        </div>
      </div>

      <div
        ref={timelineRef}
        className="timeline"
        onClick={handleTimelineClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="timeline-content"
          style={{ width: `${totalDuration * pixelsPerSecond + 100}px` }}
        >
          {/* Time markers */}
          <div className="time-markers">
            {markers.map((time) => (
              <div
                key={time}
                className="time-marker"
                style={{ left: `${time * pixelsPerSecond}px` }}
              >
                <span className="time-label">{time}s</span>
              </div>
            ))}
          </div>

          {/* Scene layers */}
          <div className="scene-layers">
            {scenePositions.map(({ scene, start, end }) => (
              <div
                key={scene.id}
                className="scene-block"
                style={{
                  left: `${start * pixelsPerSecond}px`,
                  width: `${(end - start) * pixelsPerSecond}px`,
                }}
              >
                <span className="scene-name">{scene.name}</span>
              </div>
            ))}
          </div>

          {/* Element layers */}
          <div className="element-layers">
            {composition.scenes.map((scene) => {
              let sceneStart = 0;
              const sceneIndex = composition.scenes.indexOf(scene);
              for (let i = 0; i < sceneIndex; i++) {
                sceneStart += composition.scenes[i].duration;
              }

              return scene.elements.map((element) => {
                const elementStart = sceneStart + element.startTime;
                const elementDuration = element.endTime - element.startTime;
                const isSelected = element.id === selectedElementId;

                return (
                  <div
                    key={element.id}
                    className={`element-block ${isSelected ? 'selected' : ''}`}
                    style={{
                      left: `${elementStart * pixelsPerSecond}px`,
                      width: `${elementDuration * pixelsPerSecond}px`,
                    }}
                    onClick={(e) => handleElementClick(e, element.id)}
                  >
                    <span className="element-name">{element.name}</span>
                    <span className="element-type">{element.type}</span>
                  </div>
                );
              });
            })}
          </div>

          {/* Playhead */}
          <div
            className="playhead"
            style={{ left: `${playheadPosition}px` }}
          >
            <div className="playhead-head" />
            <div className="playhead-line" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;