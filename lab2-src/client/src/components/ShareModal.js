import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../utils/api';
import './ShareModal.css';

export default function ShareModal({ videoId, onClose }) {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) { setError('Введіть ім\'я користувача'); return; }
    setLoading(true); setError('');
    try {
      await apiFetch(`/api/videos/${videoId}/share`, {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), message: message.trim() }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>Поділитися відео</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {success ? (
          <div className="share-success">
            <p>Відео надіслано користувачу <strong>{username}</strong>!</p>
            <button className="modal-btn" onClick={onClose}>Закрити</button>
          </div>
        ) : (
          <form className="modal-form" onSubmit={handleSubmit}>
            <div className="modal-field">
              <label>Ім'я користувача</label>
              <input
                ref={inputRef}
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                placeholder="username"
                maxLength={50}
              />
            </div>
            <div className="modal-field">
              <label>Повідомлення <span>(необов'язково)</span></label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Подивись це відео!"
                rows={2}
                maxLength={300}
              />
            </div>
            {error && <p className="modal-error">{error}</p>}
            <div className="modal-actions">
              <button type="submit" className="modal-btn" disabled={loading}>
                {loading ? '...' : 'Надіслати'}
              </button>
              <button type="button" className="modal-cancel" onClick={onClose}>Скасувати</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
