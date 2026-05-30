import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import WatchPage from './pages/WatchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import InboxPage from './pages/InboxPage';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/"          element={<HomePage />} />
            <Route path="/upload"    element={<UploadPage />} />
            <Route path="/watch/:id" element={<WatchPage />} />
            <Route path="/login"     element={<LoginPage />} />
            <Route path="/register"  element={<RegisterPage />} />
            <Route path="/admin"     element={<AdminPage />} />
            <Route path="/inbox"     element={<InboxPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}
