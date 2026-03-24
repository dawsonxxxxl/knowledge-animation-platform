import React, { useEffect, useRef } from 'react';
import type { Composition, Scene, AnimationElement } from '../types';

interface RemotionPlayerProps {
  composition: Composition;
  currentTime: number;
  onTimeChange: (time: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
}

const SimpleText: React.FC<{
  text: string;
  fontSize: number;
  color: string;
  x: number;
  y: number;
}> = ({ text, fontSize, color, x, y }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        fontSize: `${fontSize}px`,
        color,
        fontFamily: 'sans-serif',
        whiteSpace: 'pre-wrap',
      }}
    >
      {text}
    </div>
  );
};

const SimpleShape: React.FC<{
  shapeType: string;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  x: number;
  y: number;
}> = ({ shapeType, width, height, fill, stroke, strokeWidth, x, y }) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: x,
    top: y,
    width,
    height,
    backgroundColor: fill,
    border: `${strokeWidth}px solid ${stroke}`,
  };

  if (shapeType === 'circle') {
    style.borderRadius = '50%';
  }

  return <div style={style} />;
};

const SceneRenderer: React.FC<{ scene: Scene; time: number }> = ({ scene, time }) => {
  const isVisible = (element: AnimationElement) => {
    return time >= element.startTime && time <= element.endTime;
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: scene.backgroundColor,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {scene.elements.filter(isVisible).map((element) => {
        switch (element.type) {
          case 'text': {
            const props = element.properties as { text: string; fontSize: number; color: string; x: number; y: number };
            return (
              <SimpleText
                key={element.id}
                text={props.text}
                fontSize={props.fontSize}
                color={props.color}
                x={props.x}
                y={props.y}
              />
            );
          }
          case 'shape': {
            const props = element.properties as { shapeType: string; width: number; height: number; fill: string; stroke: string; strokeWidth: number; x: number; y: number };
            return (
              <SimpleShape
                key={element.id}
                shapeType={props.shapeType}
                width={props.width}
                height={props.height}
                fill={props.fill}
                stroke={props.stroke}
                strokeWidth={props.strokeWidth}
                x={props.x}
                y={props.y}
              />
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
};

export const RemotionPlayer: React.FC<RemotionPlayerProps> = ({
  composition,
  currentTime,
  onTimeChange,
  isPlaying,
  onPlayPause,
}) => {
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Handle play/pause with animation loop
  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now();

      const animate = () => {
        const now = performance.now();
        const delta = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;

        const newTime = currentTime + delta;
        if (newTime >= composition.duration) {
          onTimeChange(0);
          onPlayPause();
        } else {
          onTimeChange(newTime);
        }
        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, composition.duration, currentTime, onTimeChange, onPlayPause]);

  // Find the current scene based on time
  const currentScene = composition.scenes.find(
    (scene, sceneIndex) => {
      const sceneStart = composition.scenes
        .slice(0, sceneIndex)
        .reduce((acc, s) => acc + s.duration, 0);
      const sceneEnd = sceneStart + scene.duration;
      return currentTime >= sceneStart && currentTime < sceneEnd;
    }
  ) || composition.scenes[0];

  return (
    <div className="remotion-player">
      <div
        className="player-viewport"
        style={{
          width: composition.width,
          height: composition.height,
          maxWidth: '100%',
          margin: '0 auto',
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        {currentScene ? (
          <SceneRenderer scene={currentScene} time={currentTime} />
        ) : (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            No scenes available
          </div>
        )}
      </div>

      <div className="player-controls" style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          onClick={onPlayPause}
          style={{
            padding: '8px 24px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: isPlaying ? '#f97316' : '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
          }}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <button
          onClick={() => onTimeChange(0)}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            cursor: 'pointer',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
          }}
        >
          Restart
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            {currentTime.toFixed(2)}s / {composition.duration.toFixed(2)}s
          </span>
        </div>
      </div>

      {/* Hidden div to satisfy Remotion's requirement for a composition */}
      <div style={{ display: 'none' }} />
    </div>
  );
};

export default RemotionPlayer;