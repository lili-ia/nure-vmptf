import React from 'react';
import { Link } from 'react-router-dom';
import './VideoCard.css';

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function VideoCard({ video, onDelete }) {
  return (
    <div className="video-card">
      <Link to={`/watch/${video.id}`} className="card-thumb">
        <div className="thumb-placeholder">
          <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </Link>
      <div className="card-info">
        <Link to={`/watch/${video.id}`} className="card-title">{video.title}</Link>
        {video.description && <p className="card-desc">{video.description}</p>}
        <div className="card-meta">
          <span>{video.views} переглядів</span>
          <span>{formatSize(video.size)}</span>
          <span>{formatDate(video.uploadedAt)}</span>
        </div>
      </div>
      {onDelete && (
        <button className="card-delete" onClick={() => onDelete(video.id)} title="Видалити">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      )}
    </div>
  );
}
