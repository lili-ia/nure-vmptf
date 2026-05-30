import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handler = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };

  const active = (path) => pathname === path ? 'active' : '';

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">VideoHost</Link>
        <nav className="nav">
          <Link to="/" className={active('/')}>Головна</Link>
          {user && <Link to="/upload" className={active('/upload')}>Завантажити</Link>}
          {user && <Link to="/inbox" className={active('/inbox')}>Вхідні</Link>}
          {user?.role === 'admin' && <Link to="/admin" className={active('/admin')}>Адмін</Link>}
        </nav>

        <div className="header-right">
          {user ? (
            <div className="user-menu" ref={menuRef}>
              <button className="user-btn" onClick={() => setMenuOpen(o => !o)}>
                <span className="user-avatar">{user.username[0].toUpperCase()}</span>
                <span className="user-name">{user.username}</span>
                {user.role === 'admin' && <span className="user-role">admin</span>}
              </button>
              {menuOpen && (
                <div className="user-dropdown">
                  <p className="dropdown-email">{user.email}</p>
                  <button onClick={handleLogout}>Вийти</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className={active('/login')}>Вхід</Link>
              <Link to="/register" className="register-link">Реєстрація</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
