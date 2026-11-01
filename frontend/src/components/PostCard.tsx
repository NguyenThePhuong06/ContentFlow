import React from 'react';
import { Post } from '../store/postStore';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const statusBadgeMap = {
    PUBLISHED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
    SCHEDULED: { bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock },
    FAILED: { bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: AlertCircle },
    DRAFT: { bg: 'bg-slate-50 text-slate-700 border-slate-200', icon: Clock },
  };

  const statusBadge = statusBadgeMap[post.status] || statusBadgeMap.DRAFT;
  const Icon = statusBadge.icon;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge.bg}`}
        >
          <Icon className="w-3.5 h-3.5" />
          {post.status}
        </span>
        <span className="text-xs text-slate-400">
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
      </div>

      <p className="text-slate-800 text-sm whitespace-pre-wrap leading-relaxed mb-4">
        {post.content}
      </p>

      {post.targets?.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
          {post.targets.map((t) => (
            <span
              key={t.id}
              className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono"
            >
              {t.channel?.platform || 'CHANNEL'}: {t.status}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
