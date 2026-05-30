import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import './Comments.css';

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return 'щойно';
  if (diff < 3600) return `${Math.floor(diff / 60)} хв тому`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} год тому`;
  return new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short' });
}

export default function Comments({ videoId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch(`/api/videos/${videoId}/comments`)
      .then(data => setComments(data.slice().reverse()))
      .catch(() => {});
  }, [videoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) { setError('Введіть текст коментаря'); return; }
    setSubmitting(true); setError('');
    try {
      const comment = await apiFetch(`/api/videos/${videoId}/comments`, {
        method: 'POST', body: JSON.stringify({ text: text.trim() }),
      });
      setComments(prev => [comment, ...prev]);
      setText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/api/comments/${id}`, { method: 'DELETE' });
      setComments(prev => prev.filter(c => c.id !== id));
    } catch {}
  };

  const canDelete = (comment) => user && (user.role === 'admin' || user.id === comment.user_id);

  return (
    <section className="comments">
      <h2 className="comments-title">Коментарі <span>{comments.length}</span></h2>

      {user ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <div className="comment-input-row">
            <textarea
              className="comment-text"
              placeholder="Напишіть коментар..."
              value={text}
              onChange={e => { setText(e.target.value); setError(''); }}
              rows={3}
              maxLength={1000}
            />
            <button className="comment-submit" type="submit" disabled={submitting}>
              {submitting ? '...' : 'Надіслати'}
            </button>
          </div>
          {error && <p className="comment-error">{error}</p>}
        </form>
      ) : (
        <p className="comment-login-hint">
          <Link to="/login">Увійдіть</Link>, щоб залишити коментар
        </p>
      )}

      <div className="comment-list">
        {comments.length === 0 && <p className="comments-empty">Коментарів ще немає.</p>}
        {comments.map(c => (
          <div key={c.id} className="comment-item">
            <div className="comment-header">
              <span className="comment-author-name">{c.author_name}</span>
              <span className="comment-time">{timeAgo(c.created_at)}</span>
              {canDelete(c) && (
                <button className="comment-delete" onClick={() => handleDelete(c.id)}>×</button>
              )}
            </div>
            <p className="comment-body">{c.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
