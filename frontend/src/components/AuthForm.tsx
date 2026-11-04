import React, { useState } from 'react';
import { AlertCircle, Layers, Loader2 } from 'lucide-react';
import { apiRequest } from '../services/api';

interface AuthResponse {
  token: string;
  user: { id: string; email: string; role: 'USER' | 'ADMIN' };
}

export const AuthForm: React.FC<{
  onAuthenticated: (token: string, email: string, role: 'USER' | 'ADMIN') => void;
}> = ({ onAuthenticated }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await apiRequest<AuthResponse>(
        isRegistering ? '/auth/register' : '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        }
      );
      onAuthenticated(response.token, response.user.email, response.user.role);
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div className="text-center">
          <Layers className="mx-auto h-9 w-9 text-blue-600" />
          <h1 className="mt-3 text-2xl font-bold text-slate-900">ContentFlow</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isRegistering ? 'Tạo tài khoản để bắt đầu' : 'Đăng nhập vào tài khoản của bạn'}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            autoComplete="email"
            required
            maxLength={191}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
          Mật khẩu
          <input
            type="password"
            autoComplete={isRegistering ? 'new-password' : 'current-password'}
            required
            minLength={8}
            maxLength={128}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {isRegistering && <span className="block text-xs font-normal text-slate-500">Tối thiểu 8 ký tự.</span>}
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isRegistering ? 'Tạo tài khoản' : 'Đăng nhập'}
        </button>

        <p className="text-center text-sm text-slate-500">
          {isRegistering ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
            }}
            className="font-medium text-blue-700 hover:text-blue-800"
          >
            {isRegistering ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </p>
      </form>
    </main>
  );
};
