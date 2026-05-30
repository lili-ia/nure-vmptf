import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiUpload } from '../utils/api';
import './UploadPage.css';

export default function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''));
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile({ target: { files: e.dataTransfer.files } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Оберіть відеофайл'); return; }
    const data = new FormData();
    data.append('video', file);
    data.append('title', title.trim() || file.name);
    data.append('description', description.trim());
    setUploading(true); setProgress(0);
    try {
      const video = await apiUpload('/api/videos', data, setProgress);
      navigate(`/watch/${video.id}`);
    } catch (err) {
      setError(err.message);
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      <h1>Завантажити відео</h1>
      <form className="upload-form" onSubmit={handleSubmit}>
        <div
          className={`drop-zone ${file ? 'has-file' : ''}`}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current.click()}
        >
          <input ref={fileRef} type="file" accept="video/*" onChange={handleFile} hidden />
          {file ? (
            <div className="file-info">
              <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32" className="file-icon">
                <path d="M15 10l4.553-2.695A1 1 0 0121 8.117V15.88a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
              </svg>
              <span className="file-name">{file.name}</span>
              <span className="file-size">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
            </div>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" className="upload-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
              </svg>
              <p>Перетягніть відео або <span className="link">оберіть файл</span></p>
              <p className="hint">MP4, WebM, MOV · до 500 MB</p>
            </>
          )}
        </div>

        <div className="form-group">
          <label>Назва</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} maxLength={200} />
        </div>
        <div className="form-group">
          <label>Опис</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} maxLength={1000} />
        </div>

        {error && <p className="form-error">{error}</p>}
        {uploading && (
          <div>
            <div className="progress-wrap"><div className="progress-bar" style={{ width: `${progress}%` }} /></div>
            <p className="progress-label">{progress}%</p>
          </div>
        )}
        <button type="submit" className="submit-btn" disabled={uploading}>
          {uploading ? 'Завантаження...' : 'Завантажити'}
        </button>
      </form>
    </div>
  );
}
