import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Post } from '../store/postStore';

const statusNames: Record<Post['status'], string> = {
  DRAFT: 'Bản nháp',
  SCHEDULED: 'Đã lên lịch',
  PUBLISHED: 'Đã đăng',
  FAILED: 'Thất bại',
};

export const AnalyticsPage: React.FC<{ posts: Post[] }> = ({ posts }) => {
  const statuses = ['PUBLISHED', 'SCHEDULED', 'FAILED', 'DRAFT'] as const;
  const totals = new Map<string, { total: number; published: number }>();
  for (const post of posts) {
    for (const target of post.targets) {
      const platform = target.channel?.platform || 'OTHER';
      const row = totals.get(platform) || { total: 0, published: 0 };
      row.total += 1;
      if (target.status === 'PUBLISHED') row.published += 1;
      totals.set(platform, row);
    }
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Thống kê nội dung</h2>
        <p className="mt-1 text-sm text-slate-500">Tổng hợp trạng thái bài đăng trên ContentFlow.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statuses.map((status) => {
          const count = posts.filter((post) => post.status === status).length;
          return (
            <article key={status} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-sm text-slate-500">
                {statusNames[status]} <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              <div className="mt-3 text-3xl font-semibold text-slate-900">{count}</div>
            </article>
          );
        })}
      </div>
      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800">Theo kênh</h3>
        {totals.size === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Chưa có dữ liệu phân phối.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {[...totals.entries()].map(([platform, row]) => (
              <div key={platform}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-700">{platform}</span>
                  <span className="text-slate-500">{row.published}/{row.total} đã đăng</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${row.total ? (row.published / row.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500">
          Số liệu hiện phản ánh trạng thái đăng trong ứng dụng; lượt xem và tương tác cần kết nối API thật của từng nền tảng.
        </p>
      </article>
    </section>
  );
};
