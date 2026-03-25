/**
 * Render API Service
 * Handles video rendering and export functionality
 */

import { api } from './api';

export interface RenderJob {
  id: string;
  compositionId: string;
  format: 'mp4' | 'webm' | 'gif';
  quality: 'low' | 'medium' | 'high';
  fps: number;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  createdAt: string;
  completedAt?: string;
  outputUrl?: string;
  error?: string;
}

export interface RenderOptions {
  compositionId: string;
  format: 'mp4' | 'webm' | 'gif';
  quality: 'low' | 'medium' | 'high';
  fps: number;
  composition?: {
    scenes: Array<{
      name: string;
      elements: Array<{
        id: string;
        type: string;
        name: string;
        startTime: number;
        endTime: number;
        properties: Record<string, unknown>;
      }>;
    }>;
    fps: number;
    width: number;
    height: number;
  };
}

export const renderService = {
  /**
   * Start a new render job
   */
  async startRender(options: RenderOptions): Promise<{ jobId: string; status: string }> {
    return api.post<{ jobId: string; status: string }>('/render', options);
  },

  /**
   * Get render job status
   */
  async getRenderStatus(jobId: string): Promise<RenderJob> {
    return api.get<RenderJob>(`/render/${jobId}`);
  },

  /**
   * Get download URL for completed render
   */
  async getDownloadUrl(jobId: string): Promise<{ url: string }> {
    return api.get<{ url: string }>(`/render/${jobId}/download`);
  },

  /**
   * List all render jobs
   */
  async listJobs(): Promise<{ jobs: RenderJob[] }> {
    return api.get<{ jobs: RenderJob[] }>('/render');
  },

  /**
   * Cancel a render job
   */
  async cancelJob(jobId: string): Promise<{ success: boolean }> {
    return api.delete<{ success: boolean }>(`/render/${jobId}`);
  },

  /**
   * Get preview frame at specific time
   */
  async getPreviewFrame(composition: unknown, time: number): Promise<unknown> {
    return api.post<unknown>('/preview', { composition, time });
  },
};