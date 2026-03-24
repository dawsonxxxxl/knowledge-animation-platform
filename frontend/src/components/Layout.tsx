/**
 * Main layout component with navigation
 */

import { Link, Outlet } from 'react-router-dom';
import './Layout.css';

export function Layout() {
  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            知识动画平台
          </Link>
          <nav className="nav">
            <Link to="/" className="nav-link">
              项目列表
            </Link>
            <Link to="/projects/new" className="nav-link">
              创建项目
            </Link>
          </nav>
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        <p>知识动画平台 - 让学习更有趣</p>
      </footer>
    </div>
  );
}