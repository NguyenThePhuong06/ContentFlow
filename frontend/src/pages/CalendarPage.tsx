import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Post } from '../store/postStore';

const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export const CalendarPage: React.FC<{ posts: Post[] }> = ({ posts }) => {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const mondayOffset = (first.getDay() + 6) % 7;
    const start = new Date(first);
    start.setDate(first.getDate() - mondayOffset);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [month]);

  const scheduledPosts = posts.filter((post) => post.scheduledAt);
  const postsByDay = new Map<string, Post[]>();
  for (const post of scheduledPosts) {
    const date = new Date(post.scheduledAt!);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    postsByDay.set(key, [...(postsByDay.get(key) || []), post]);
  }

  return (
    <section className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Lịch đăng bài</h2>
          <p className="mt-1 text-sm text-slate-500">Các bài đã được lên lịch đăng.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            className="rounded-lg border border-slate-200 p-2 hover:bg-white"
            aria-label="Tháng trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-32 text-center font-medium text-slate-700">
            {month.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
          </span>
          <button
            type="button"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            className="rounded-lg border border-slate-200 p-2 hover:bg-white"
            aria-label="Tháng sau"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {weekDays.map((day) => (
            <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((date) => {
            const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            const entries = postsByDay.get(key) || [];
            const isCurrentMonth = date.getMonth() === month.getMonth();
            return (
              <div key={key} className={`min-h-24 border-b border-r border-slate-100 p-2 ${isCurrentMonth ? '' : 'bg-slate-50/70'}`}>
                <span className={`text-xs ${isCurrentMonth ? 'text-slate-700' : 'text-slate-400'}`}>{date.getDate()}</span>
                <div className="mt-1 space-y-1">
                  {entries.map((post) => (
                    <div key={post.id} title={post.content} className="truncate rounded bg-blue-50 px-1.5 py-1 text-[10px] text-blue-700">
                      {new Date(post.scheduledAt!).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} {post.content}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {scheduledPosts.length === 0 && (
        <p className="text-center text-sm text-slate-500">Chưa có bài đăng nào được lên lịch.</p>
      )}
    </section>
  );
};
