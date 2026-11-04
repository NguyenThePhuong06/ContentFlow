import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw, Shield, Users } from 'lucide-react';
import { apiRequest } from '../services/api';
import { Post } from '../store/postStore';

type AdminTab = 'overview' | 'users' | 'posts' | 'logs';

interface AdminSummary {
  users: number;
  activeUsers: number;
  suspendedUsers: number;
  posts: number;
  activityLast24Hours: number;
  postsByStatus: Record<string, number>;
}

interface AdminUser {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  lastLoginAt: string | null;
  _count: { posts: number; channels: number };
}

interface AuditLog {
  id: string;
  actorEmail: string | null;
  action: string;
  targetUserId: string | null;
  details: string | null;
  createdAt: string;
}

interface AdminPost extends Post {
  user: { id: string; email: string };
}

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'users', label: 'Người dùng' },
  { id: 'posts', label: 'Bài đăng' },
  { id: 'logs', label: 'Nhật ký' },
];

export const AdminPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [tab, setTab] = useState<AdminTab>('overview');
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [summaryData, postData, logData] = await Promise.all([
        apiRequest<AdminSummary>('/admin/summary'),
        apiRequest<{ posts: AdminPost[] }>('/admin/posts?limit=100'),
        apiRequest<{ logs: AuditLog[] }>('/admin/logs?limit=100'),
      ]);
      setSummary(summaryData);
      setPosts(postData.posts);
      setLogs(logData.logs);
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async (term: string) => {
    const query = new URLSearchParams({ limit: '100' });
    if (term.trim()) query.set('search', term.trim());
    const result = await apiRequest<{ users: AdminUser[] }>(`/admin/users?${query.toString()}`);
    setUsers(result.users);
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadUsers(search).catch((requestError: Error) => setError(requestError.message));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const updateStatus = async (user: AdminUser) => {
    const status = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const action = status === 'SUSPENDED' ? 'khóa' : 'mở khóa';
    if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản ${user.email}?`)) return;
    setError(null);
    try {
      await apiRequest(`/admin/users/${user.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await Promise.all([loadData(), loadUsers(search)]);
    } catch (requestError) {
      setError((requestError as Error).message);
    }
  };

  const filteredUsers = users;

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-700" />
            <h2 className="text-xl font-semibold text-slate-900">Quản trị hệ thống</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">Quản lý tài khoản, nội dung và hoạt động.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void loadData()} disabled={isLoading} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-white disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Làm mới
          </button>
          <button onClick={onBack} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">
            Về trang người dùng
          </button>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-3" aria-label="Điều hướng quản trị">
        {tabs.map((item) => (
          <button key={item.id} onClick={() => setTab(item.id)} className={`rounded-lg px-3 py-2 text-sm font-medium ${tab === item.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-white'}`}>
            {item.label}
          </button>
        ))}
      </nav>

      {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

      {tab === 'overview' && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Tổng tài khoản', value: summary?.users ?? '—', icon: Users },
            { label: 'Đang hoạt động', value: summary?.activeUsers ?? '—', icon: Users },
            { label: 'Bài đăng', value: summary?.posts ?? '—', icon: Activity },
            { label: 'Hoạt động 24 giờ', value: summary?.activityLast24Hours ?? '—', icon: Activity },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-sm text-slate-500">{card.label}<Icon className="h-4 w-4 text-blue-700" /></div>
                <div className="mt-3 text-3xl font-semibold text-slate-900">{card.value}</div>
              </article>
            );
          })}
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-4">
            <h3 className="font-semibold text-slate-800">Bài đăng theo trạng thái</h3>
            <div className="mt-3 flex flex-wrap gap-3">
              {Object.entries(summary?.postsByStatus || {}).map(([status, count]) => (
                <span key={status} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">{status}: {count}</span>
              ))}
              {summary && summary.suspendedUsers > 0 && <span className="rounded-full bg-rose-50 px-3 py-1.5 text-sm text-rose-700">Tài khoản bị khóa: {summary.suspendedUsers}</span>}
            </div>
          </article>
        </div>
      )}

      {tab === 'users' && (
        <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
            <h3 className="font-semibold text-slate-800">Quản lý người dùng</h3>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo email…" className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr><th className="px-4 py-3">Tài khoản</th><th className="px-4 py-3">Vai trò</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Bài đăng</th><th className="px-4 py-3">Đăng nhập gần nhất</th><th className="px-4 py-3">Thao tác</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-medium text-slate-800">{user.email}</td>
                    <td className="px-4 py-3 text-slate-600">{user.role === 'ADMIN' ? 'Admin' : 'Người dùng'}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{user.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}</span></td>
                    <td className="px-4 py-3 text-slate-600">{user._count.posts}</td>
                    <td className="px-4 py-3 text-slate-500">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('vi-VN') : 'Chưa đăng nhập'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => void updateStatus(user)} className={`text-xs font-medium ${user.status === 'ACTIVE' ? 'text-rose-700 hover:text-rose-900' : 'text-emerald-700 hover:text-emerald-900'}`}>
                        {user.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Không tìm thấy người dùng.</td></tr>}
              </tbody>
            </table>
          </div>
        </article>
      )}

      {tab === 'posts' && (
        <div className="space-y-3">
          {posts.map((post) => (
            <article key={post.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>{post.user.email}</span><span>{post.status}</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-800">{post.content}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {post.targets.map((target) => <span key={target.id} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">{target.channel.accountName}: {target.status}</span>)}
              </div>
            </article>
          ))}
          {posts.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Chưa có bài đăng.</p>}
        </div>
      )}

      {tab === 'logs' && (
        <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr><th className="px-4 py-3">Thời gian</th><th className="px-4 py-3">Tài khoản</th><th className="px-4 py-3">Sự kiện</th><th className="px-4 py-3">Chi tiết</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => <tr key={log.id}><td className="whitespace-nowrap px-4 py-3 text-slate-500">{new Date(log.createdAt).toLocaleString('vi-VN')}</td><td className="px-4 py-3 text-slate-700">{log.actorEmail || 'Không xác định'}</td><td className="px-4 py-3 font-medium text-slate-800">{log.action}</td><td className="max-w-sm truncate px-4 py-3 text-slate-500">{log.details || (log.targetUserId ? `Tài khoản: ${log.targetUserId}` : '—')}</td></tr>)}
                {logs.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Chưa có nhật ký.</td></tr>}
              </tbody>
            </table>
          </div>
        </article>
      )}
    </section>
  );
};
