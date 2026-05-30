import React, { useState, useEffect } from 'react';
import VideoCard from '../components/VideoCard';
import './HomePage.css';

export default function HomePage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchVideos = () => {
    setLoading(true);
    fetch('/api/videos')
      .then(r => r.json())
      .then(data => { setVideos(data); setLoading(false); })
      .catch(() => { setError('Не вдалося завантажити список відео'); setLoading(false); });
  };

  useEffect(() => { fetchVideos(); }, []);

  const handleDelete = (id) => {
    if (!window.confirm('Видалити відео?')) return;
    fetch(`/api/videos/${id}`, { method: 'DELETE' })
      .then(r => r.json())
      .then(() => setVideos(v => v.filter(x => x.id !== id)))
      .catch(() => alert('Помилка при видаленні'));
  };

  if (loading) return <div className="status">Завантаження...</div>;
  if (error) return <div className="status error">{error}</div>;

  return (
    <div className="home">
      <div className="home-header">
        <h1>Всі відео</h1>
        <span className="count">{videos.length} відео</span>
      </div>

      {videos.length === 0 ? (
        <div className="empty">
          <p>Тут поки немає відео.</p>
          <a href="/upload" className="btn-primary">Завантажити перше відео</a>
        </div>
      ) : (
        <div className="video-grid">
          {videos.map(v => (
            <VideoCard key={v.id} video={v} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
