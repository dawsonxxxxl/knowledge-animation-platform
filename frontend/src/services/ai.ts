/**
 * AI API Service
 * Handles communication with backend AI endpoints
 */

import { api } from './api';

export interface AIGenerationRequest {
  topic: string;
  knowledgeType: string;
  grade?: string;
  duration?: number;
}

export interface AILayoutRequest {
  elements: Array<{ id: string; type: string }>;
  canvasWidth: number;
  canvasHeight: number;
}

export interface AIRecommendRequest {
  context: {
    type: string;
    previousElements?: Array<{ id: string; type: string }>;
  };
}

export interface GeneratedScene {
  id: string;
  name: string;
  order: number;
  duration: number;
  backgroundColor: string;
  elements: Array<{
    id: string;
    type: string;
    name: string;
    startTime: number;
    endTime: number;
    properties: Record<string, unknown>;
  }>;
}

export interface GenerateScriptResponse {
  success: boolean;
  script: {
    topic: string;
    scenes: GeneratedScene[];
    metadata: { generatedAt: string; version: string };
  };
}

export interface LayoutSuggestion {
  name: string;
  type: string;
  elements: Array<{
    elementId: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

export interface LayoutResponse {
  success: boolean;
  layouts: LayoutSuggestion[];
}

export interface Recommendation {
  type: string;
  suggestion: string;
  reason: string;
}

export interface RecommendResponse {
  success: boolean;
  recommendations: Recommendation[];
}

export const aiService = {
  /**
   * Generate animation script from topic/knowledge description
   */
  async generateScript(request: AIGenerationRequest): Promise<GenerateScriptResponse> {
    return api.post<GenerateScriptResponse>('/ai/generate', request);
  },

  /**
   * Get layout suggestions for elements
   */
  async getLayoutSuggestions(request: AILayoutRequest): Promise<LayoutResponse> {
    return api.post<LayoutResponse>('/ai/layout', request);
  },

  /**
   * Get smart recommendations
   */
  async getRecommendations(request: AIRecommendRequest): Promise<RecommendResponse> {
    return api.post<RecommendResponse>('/ai/recommend', request);
  },
};