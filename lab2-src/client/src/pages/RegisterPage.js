import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import './AuthPage.css';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { token, user } = await apiFetch('/api/auth/register', {
        method: 'POST', body: JSON.stringify(form),
      });
      login(token, user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <h1>Реєстрація</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <label>Ім'я користувача</label>
          <input type="text" value={form.username} onChange={set('username')} autoFocus maxLength={50} />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" value={form.email} onChange={set('email')} />
        </div>
        <div className="field">
          <label>Пароль</label>
          <input type="password" value={form.password} onChange={set('password')} minLength={6} />
        </div>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? '...' : 'Зареєструватись'}
        </button>
      </form>
      <p className="auth-switch">Вже є акаунт? <Link to="/login">Увійти</Link></p>
    </div>
  );
}
