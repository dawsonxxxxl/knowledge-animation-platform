/**
 * Create Project page
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi } from '../services/api';
import './CreateProject.css';

export function CreateProject() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'in_progress'>('draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('请输入项目标题');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await projectsApi.create({
        title: title.trim(),
        description: description.trim(),
        status,
      });
      navigate('/');
    } catch (err) {
      setError('创建项目失败，请确保后端服务正在运行');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-project-page">
      <div className="page-header">
        <h1>创建新项目</h1>
      </div>

      <form onSubmit={handleSubmit} className="project-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="title">项目标题 *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入项目标题"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">项目描述</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="输入项目描述（可选）"
            rows={4}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">初始状态</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'in_progress')}
            disabled={loading}
          >
            <option value="draft">草稿</option>
            <option value="in_progress">制作中</option>
          </select>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="cancel-button"
            disabled={loading}
          >
            取消
          </button>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? '创建中...' : '创建项目'}
          </button>
        </div>
      </form>
    </div>
  );
}