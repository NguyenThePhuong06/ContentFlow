import React, { useEffect } from 'react';
import { Dashboard } from './pages/Dashboard';
import { AuthForm } from './components/AuthForm';

export const App: React.FC = () => {
  const [userEmail, setUserEmail] = React.useState(() => localStorage.getItem('userEmail') || '');
  const [userRole, setUserRole] = React.useState<'USER' | 'ADMIN'>(() =>
    localStorage.getItem('userRole') === 'ADMIN' ? 'ADMIN' : 'USER'
  );
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => Boolean(localStorage.getItem('token')));

  useEffect(() => {
    const handleUnauthorized = () => {
      setUserEmail('');
      setUserRole('USER');
      setIsAuthenticated(false);
    };
    window.addEventListener('contentflow:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('contentflow:unauthorized', handleUnauthorized);
  }, []);

  const handleAuthenticated = (token: string, email: string, role: 'USER' | 'ADMIN') => {
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);
    setUserEmail(email);
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {isAuthenticated ? (
        <Dashboard userEmail={userEmail} isAdmin={userRole === 'ADMIN'} onLogout={handleLogout} />
      ) : (
        <AuthForm onAuthenticated={handleAuthenticated} />
      )}
    </div>
  );
};
