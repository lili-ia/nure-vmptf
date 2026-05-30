import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import Comments from '../components/Comments';
import ShareModal from '../components/ShareModal';
import './WatchPage.css';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' });
}
function formatSize(b) { return `${(b / 1024 / 1024).toFixed(1)} MB`; }

export default function WatchPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const videoRef = useRef();

  useEffect(() => {
    apiFetch(`/api/videos/${id}`)
      .then(data => { setVideo(data); setLoading(false); })
      .catch(() => { setError('Відео не знайдено'); setLoading(false); });
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Видалити це відео?')) return;
    try {
      await apiFetch(`/api/videos/${id}`, { method: 'DELETE' });
      navigate('/');
    } catch (e) { alert(e.message); }
  };

  const canDelete = user && (user.role === 'admin' || user.id === video?.user_id);

  if (loading) return <div className="watch-status">Завантаження...</div>;
  if (error) return (
    <div className="watch-status error">
      <p>{error}</p>
      <Link to="/" className="back-link">Повернутись на головну</Link>
    </div>
  );

  return (
    <div className="watch-page">
      <div className="player-wrap">
        <video ref={videoRef} className="player" controls autoPlay src={`/stream/${video.id}`}>
          Ваш браузер не підтримує відтворення відео.
        </video>
      </div>

      <div className="watch-meta">
        <div className="watch-title-row">
          <h1>{video.title}</h1>
          <div className="watch-btns">
            {user && (
              <button className="share-btn" onClick={() => setShareOpen(true)}>Поділитися</button>
            )}
            {canDelete && (
              <button className="delete-btn" onClick={handleDelete}>Видалити</button>
            )}
          </div>
        </div>

        <div className="watch-stats">
          {video.uploader && <span>@{video.uploader}</span>}
          {video.uploader && <span>·</span>}
          <span>{video.views} переглядів</span>
          <span>·</span>
          <span>{formatDate(video.uploaded_at)}</span>
          <span>·</span>
          <span>{formatSize(video.size)}</span>
        </div>

        {video.description && (
          <div className="watch-desc"><p>{video.description}</p></div>
        )}
      </div>

      <Comments videoId={id} />

      <Link to="/" className="back-link">← Всі відео</Link>

      {shareOpen && <ShareModal videoId={id} onClose={() => setShareOpen(false)} />}
    </div>
  );
}
