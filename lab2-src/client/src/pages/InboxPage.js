import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import './InboxPage.css';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatSize(b) {
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export default function InboxPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    apiFetch('/api/shares/inbox')
      .then(data => { setShares(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, navigate]);

  const dismiss = async (id) => {
    try {
      await apiFetch(`/api/shares/${id}`, { method: 'DELETE' });
      setShares(s => s.filter(x => x.id !== id));
    } catch {}
  };

  if (loading) return <div className="inbox-status">Завантаження...</div>;

  return (
    <div className="inbox-page">
      <h1>Вхідні відео <span>{shares.length}</span></h1>

      {shares.length === 0 && (
        <p className="inbox-empty">Вам ще ніхто не надсилав відео.</p>
      )}

      <div className="inbox-list">
        {shares.map(s => (
          <div key={s.id} className="inbox-item">
            <div className="inbox-from">
              <strong>{s.from_username}</strong> поділився відео
              <span className="inbox-date">{formatDate(s.created_at)}</span>
            </div>
            <Link to={`/watch/${s.video_id}`} className="inbox-video-title">
              {s.title}
            </Link>
            <div className="inbox-meta">
              {s.views} переглядів · {formatSize(s.size)}
            </div>
            {s.message && <p className="inbox-message">"{s.message}"</p>}
            <div className="inbox-actions">
              <Link to={`/watch/${s.video_id}`} className="inbox-watch-btn">Дивитись</Link>
              <button className="inbox-dismiss" onClick={() => dismiss(s.id)}>Закрити</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
