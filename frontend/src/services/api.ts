/**
 * API service layer for communicating with the backend
 */

import type { Project, CreateProjectRequest, Animation, CreateAnimationRequest } from '../types';

const API_BASE = 'http://localhost:8000/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Generic API wrapper for render service
export const api = {
  get: <T>(url: string) => fetchJson<T>(`${API_BASE}${url}`),
  post: <T>(url: string, data: any) =>
    fetchJson<T>(`${API_BASE}${url}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  delete: <T>(url: string) =>
    fetchJson<T>(`${API_BASE}${url}`, { method: 'DELETE' }),
};

// Projects API
export const projectsApi = {
  getAll: () => fetchJson<Project[]>(`${API_BASE}/projects`),

  getById: (id: string) => fetchJson<Project>(`${API_BASE}/projects/${id}`),

  create: (data: CreateProjectRequest) =>
    fetchJson<Project>(`${API_BASE}/projects`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateProjectRequest>) =>
    fetchJson<Project>(`${API_BASE}/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' }),
};

// Animations API
export const animationsApi = {
  getById: (id: string) => fetchJson<Animation>(`${API_BASE}/animations/${id}`),

  create: (data: CreateAnimationRequest) =>
    fetchJson<Animation>(`${API_BASE}/animations`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};