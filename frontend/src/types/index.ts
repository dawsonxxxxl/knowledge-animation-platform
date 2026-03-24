/**
 * Type definitions for the Knowledge Animation Platform
 */

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  status?: 'draft' | 'in_progress' | 'completed';
}

export interface Animation {
  id: string;
  projectId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnimationRequest {
  projectId: string;
  script: string;
}

// Animation Editor Types

export type AnimationElementType = 'text' | 'shape' | 'image' | 'chart' | 'equation';

export interface AnimationElement {
  id: string;
  type: AnimationElementType;
  name: string;
  properties: ElementProperties;
  startTime: number;
  endTime: number;
}

export interface TextProperties {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  x: number;
  y: number;
}

export interface ShapeProperties {
  shapeType: 'rectangle' | 'circle' | 'line' | 'arrow';
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  x: number;
  y: number;
}

export interface ImageProperties {
  src: string;
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface ChartProperties {
  chartType: 'bar' | 'line' | 'pie';
  data: { label: string; value: number }[];
}

export interface EquationProperties {
  latex: string;
  x: number;
  y: number;
  scale: number;
}

export type ElementProperties = TextProperties | ShapeProperties | ImageProperties | ChartProperties | EquationProperties;

export interface Scene {
  id: string;
  name: string;
  order: number;
  duration: number;
  elements: AnimationElement[];
  backgroundColor: string;
}

export interface Composition {
  id: string;
  projectId: string;
  name: string;
  duration: number;
  scenes: Scene[];
  fps: number;
  width: number;
  height: number;
}

export interface TimelineState {
  currentTime: number;
  isPlaying: boolean;
  selectedElementId: string | null;
  zoom: number;
}