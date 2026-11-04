import React, { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';

interface Profile {
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  lastLoginAt: string | null;
}

export const ProfilePage: React.FC<{ email: string }> = ({ email }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    apiRequest<Profile>('/me').then(setProfile).catch((requestError: Error) => setError(requestError.message));
  }, []);

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSaving(true);
    try {
      const result = await apiRequest<{ message: string }>('/me/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setMessage(result.message);
      setCurrentPassword('');
      setNewPassword('');
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Hồ sơ tài khoản</h2>
        <dl className="mt-5 space-y-4 text-sm">
          <div><dt className="text-slate-500">Email</dt><dd className="mt-1 font-medium text-slate-900">{profile?.email || email}</dd></div>
          <div><dt className="text-slate-500">Vai trò</dt><dd className="mt-1 font-medium text-slate-900">{profile?.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}</dd></div>
          <div><dt className="text-slate-500">Ngày tham gia</dt><dd className="mt-1 font-medium text-slate-900">{profile ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : 'Đang tải…'}</dd></div>
        </dl>
      </article>
      <form onSubmit={changePassword} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Đổi mật khẩu</h2>
        {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        {message && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
        <label className="block space-y-1 text-sm text-slate-700">
          Mật khẩu hiện tại
          <input required type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
        </label>
        <label className="block space-y-1 text-sm text-slate-700">
          Mật khẩu mới
          <input required minLength={8} maxLength={128} type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2" />
        </label>
        <button disabled={isSaving} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {isSaving ? 'Đang lưu…' : 'Cập nhật mật khẩu'}
        </button>
      </form>
    </section>
  );
};
