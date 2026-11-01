import React, { useEffect } from 'react';
import { usePostStore } from '../store/postStore';
import { PostForm } from '../components/PostForm';
import { PostCard } from '../components/PostCard';
import { RefreshCw, Layers } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { posts, fetchPosts, isLoading } = usePostStore();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Layers className="w-7 h-7 text-blue-600" />
            ContentFlow
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Nền tảng Tự động hóa & Phân phối Nội dung Đa kênh (Lean Architecture)
          </p>
        </div>

        <button
          onClick={() => fetchPosts()}
          disabled={isLoading}
          className="p-2 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          title="Tải lại danh sách"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-6">
          <PostForm />
        </div>

        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Lịch sử & Hàng đợi</h2>

          {posts.length === 0 && !isLoading && (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400 text-sm">
              Chưa có bài đăng nào. Hãy soạn bài đầu tiên!
            </div>
          )}

          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

