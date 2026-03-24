/**
 * Projects list page - displays all projects
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi } from '../services/api';
import type { Project } from '../types';
import './Projects.css';

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch (err) {
      setError('加载项目失败，请确保后端服务正在运行');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个项目吗？')) return;

    try {
      await projectsApi.delete(id);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (err) {
      alert('删除失败');
      console.error(err);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: '草稿',
      in_progress: '制作中',
      completed: '已完成',
    };
    return labels[status] || status;
  };

  const getStatusClass = (status: string) => {
    const classes: Record<string, string> = {
      draft: 'status-draft',
      in_progress: 'status-progress',
      completed: 'status-completed',
    };
    return classes[status] || '';
  };

  if (loading) {
    return (
      <div className="projects-page">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="projects-page">
        <div className="error-message">{error}</div>
        <button onClick={loadProjects} className="retry-button">
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <div className="page-header">
        <h1>我的项目</h1>
        <Link to="/projects/new" className="create-button">
          创建项目
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <p>还没有项目，创建一个开始吧！</p>
          <Link to="/projects/new" className="create-button">
            创建第一个项目
          </Link>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <h3 className="project-title">{project.title}</h3>
                <span className={`project-status ${getStatusClass(project.status)}`}>
                  {getStatusLabel(project.status)}
                </span>
              </div>
              <p className="project-description">{project.description || '暂无描述'}</p>
              <div className="project-footer">
                <span className="project-date">
                  更新于 {new Date(project.updatedAt).toLocaleDateString('zh-CN')}
                </span>
                <div className="project-actions">
                  <Link to={`/editor/${project.id}`} className="edit-button">
                    编辑
                  </Link>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="delete-button"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}