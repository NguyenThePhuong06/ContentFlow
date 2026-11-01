import React, { useEffect } from 'react';
import { Dashboard } from './pages/Dashboard';
import { AuthForm } from './components/AuthForm';

export const App: React.FC = () => {
  const [userEmail, setUserEmail] = React.useState(() => localStorage.getItem('userEmail') || '');
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => Boolean(localStorage.getItem('token')));

  useEffect(() => {
    const handleUnauthorized = () => {
      setUserEmail('');
      setIsAuthenticated(false);
    };
    window.addEventListener('contentflow:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('contentflow:unauthorized', handleUnauthorized);
  }, []);

  const handleAuthenticated = (token: string, email: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', email);
    setUserEmail(email);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {isAuthenticated ? (
        <Dashboard userEmail={userEmail} onLogout={handleLogout} />
      ) : (
        <AuthForm onAuthenticated={handleAuthenticated} />
      )}
    </div>
  );
};
