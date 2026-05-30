import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import './AdminPage.css';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    apiFetch('/api/users')
      .then(setUsers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const changeRole = async (id, role) => {
    try {
      const updated = await apiFetch(`/api/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });
      setUsers(us => us.map(u => u.id === id ? { ...u, ...updated } : u));
    } catch (e) { alert(e.message); }
  };

  const deleteUser = async (id, username) => {
    if (!window.confirm(`Видалити користувача «${username}»?`)) return;
    try {
      await apiFetch(`/api/users/${id}`, { method: 'DELETE' });
      setUsers(us => us.filter(u => u.id !== id));
    } catch (e) { alert(e.message); }
  };

  if (loading) return <div className="admin-status">Завантаження...</div>;
  if (error) return <div className="admin-status error">{error}</div>;

  return (
    <div className="admin-page">
      <h1>Управління користувачами <span>{users.length}</span></h1>
      <table className="users-table">
        <thead>
          <tr>
            <th>Користувач</th>
            <th>Email</th>
            <th>Роль</th>
            <th>Відео</th>
            <th>Дата реєстрації</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className={u.id === user.id ? 'current-user' : ''}>
              <td className="cell-username">{u.username}</td>
              <td className="cell-email">{u.email}</td>
              <td>
                <span className={`role-badge ${u.role}`}>{u.role === 'admin' ? 'Адмін' : 'Користувач'}</span>
              </td>
              <td>{u.video_count}</td>
              <td>{new Date(u.created_at).toLocaleDateString('uk-UA')}</td>
              <td className="cell-actions">
                {u.id !== user.id && (
                  <>
                    <button
                      className="action-btn"
                      onClick={() => changeRole(u.id, u.role === 'admin' ? 'user' : 'admin')}
                    >
                      {u.role === 'admin' ? '↓ user' : '↑ admin'}
                    </button>
                    <button className="action-btn danger" onClick={() => deleteUser(u.id, u.username)}>
                      Видалити
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
