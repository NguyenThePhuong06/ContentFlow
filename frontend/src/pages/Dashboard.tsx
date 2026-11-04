import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  FileText,
  Home,
  Layers,
  RefreshCw,
  Share2,
  Shield,
  UserRound,
} from 'lucide-react';
import { PostForm } from '../components/PostForm';
import { PostCard } from '../components/PostCard';
import { usePostStore } from '../store/postStore';
import { AdminPage } from './AdminPage';
import { AnalyticsPage } from './AnalyticsPage';
import { CalendarPage } from './CalendarPage';
import { ChannelsPage } from './ChannelsPage';
import { ProfilePage } from './ProfilePage';

type Page = 'home' | 'posts' | 'calendar' | 'channels' | 'analytics' | 'profile' | 'admin';

export const Dashboard: React.FC<{
  userEmail: string;
  isAdmin: boolean;
  onLogout: () => void;
}> = ({ userEmail, isAdmin, onLogout }) => {
  const [page, setPage] = useState<Page>('home');
  const { posts, channels, fetchPosts, fetchChannels, isLoading, error } = usePostStore();

  useEffect(() => {
    void fetchPosts();
    void fetchChannels();
  }, [fetchPosts, fetchChannels]);

  const navigation: Array<{ id: Page; label: string; icon: typeof Home }> = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'posts', label: 'Bài đăng', icon: FileText },
    { id: 'calendar', label: 'Lịch', icon: CalendarDays },
    { id: 'channels', label: 'Kênh', icon: Share2 },
    { id: 'analytics', label: 'Thống kê', icon: BarChart3 },
    { id: 'profile', label: 'Tài khoản', icon: UserRound },
  ];

  const upcomingPosts = posts.filter(
    (post) => post.scheduledAt && new Date(post.scheduledAt).getTime() >= Date.now()
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <button onClick={() => setPage('home')} className="text-left">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
            <Layers className="h-7 w-7 text-blue-600" />
            ContentFlow
          </h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý nội dung và phân phối đa kênh</p>
        </button>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-500 sm:inline">{userEmail}</span>
          <button
            onClick={() => {
              void fetchPosts();
              void fetchChannels();
            }}
            disabled={isLoading}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-white disabled:opacity-50"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={onLogout} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-white">
            Đăng xuất
          </button>
        </div>
      </header>

      <nav className="my-5 flex gap-2 overflow-x-auto pb-2" aria-label="Điều hướng chính">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                page === item.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-white'
              }`}
            >
              <Icon className="h-4 w-4" /> {item.label}
            </button>
          );
        })}
        {isAdmin && (
          <button
            onClick={() => setPage('admin')}
            className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
              page === 'admin' ? 'bg-blue-700 text-white' : 'text-blue-700 hover:bg-blue-50'
            }`}
          >
            <Shield className="h-4 w-4" /> Admin
          </button>
        )}
      </nav>

      {error && page !== 'posts' && (
        <div role="alert" className="mb-5 flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <span>{error}</span>
          <button onClick={() => void fetchPosts()} className="font-medium">Thử lại</button>
        </div>
      )}

      {page === 'home' && (
        <main className="space-y-6">
          <section className="rounded-2xl bg-gradient-to-r from-slate-900 to-blue-900 p-6 text-white sm:p-8">
            <p className="text-sm text-blue-100">Xin chào, {userEmail}</p>
            <h2 className="mt-2 text-2xl font-bold">Nội dung của bạn, trên mọi kênh.</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-200">
              Tạo bài viết, lên lịch và theo dõi trạng thái phân phối tại một nơi.
            </p>
            <button onClick={() => setPage('posts')} className="mt-5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-blue-50">
              Soạn bài viết
            </button>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Tổng bài viết', value: posts.length },
              { label: 'Đã xuất bản', value: posts.filter((post) => post.status === 'PUBLISHED').length },
              { label: 'Đang lên lịch', value: upcomingPosts },
              { label: 'Kênh phân phối', value: channels.length },
            ].map((stat) => (
              <article key={stat.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{stat.value}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Bài viết gần đây</h3>
                <button onClick={() => setPage('posts')} className="text-sm font-medium text-blue-700">Xem tất cả</button>
              </div>
              <div className="mt-4 space-y-3">
                {posts.slice(0, 3).map((post) => <PostCard key={post.id} post={post} />)}
                {posts.length === 0 && <p className="py-5 text-center text-sm text-slate-500">Chưa có bài viết nào.</p>}
              </div>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">Kênh phân phối</h3>
              <div className="mt-4 space-y-3">
                {channels.map((channel) => (
                  <div key={channel.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3">
                    <span className="text-sm font-medium text-slate-700">{channel.accountName}</span>
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-700">Demo</span>
                  </div>
                ))}
                {channels.length === 0 && <p className="text-sm text-slate-500">Đang tải kênh…</p>}
              </div>
              <button onClick={() => setPage('channels')} className="mt-4 text-sm font-medium text-blue-700">Quản lý kênh</button>
            </article>
          </section>
        </main>
      )}

      {page === 'posts' && (
        <main className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6"><PostForm /></div>
          <section className="space-y-4 lg:col-span-6">
            <h2 className="text-lg font-semibold text-slate-800">Lịch sử & hàng đợi</h2>
            {posts.length === 0 && !isLoading && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                Chưa có bài đăng nào. Hãy soạn bài đầu tiên!
              </div>
            )}
            {posts.map((post) => <PostCard key={post.id} post={post} />)}
          </section>
        </main>
      )}

      {page === 'calendar' && <CalendarPage posts={posts} />}
      {page === 'channels' && <ChannelsPage />}
      {page === 'analytics' && <AnalyticsPage posts={posts} />}
      {page === 'profile' && <ProfilePage email={userEmail} />}
      {page === 'admin' && isAdmin && <AdminPage onBack={() => setPage('home')} />}
    </div>
  );
};
