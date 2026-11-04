import React from 'react';
import { Facebook, Linkedin, Radio, Twitter } from 'lucide-react';
import { usePostStore } from '../store/postStore';

const platformIcons = {
  FACEBOOK: Facebook,
  LINKEDIN: Linkedin,
  TWITTER: Twitter,
} as const;

export const ChannelsPage: React.FC = () => {
  const { channels, isChannelsLoading, channelError, fetchChannels } = usePostStore();

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Kênh phân phối</h2>
        <p className="mt-1 text-sm text-slate-500">Các kênh khả dụng cho tài khoản của bạn.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {channels.map((channel) => {
          const Icon = platformIcons[channel.platform] || Radio;
          return (
            <article key={channel.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-blue-50 p-2.5 text-blue-700"><Icon className="h-5 w-5" /></div>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">Demo</span>
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{channel.accountName}</h3>
              <p className="mt-1 text-sm text-slate-500">{channel.platform}</p>
              <p className="mt-3 text-xs text-slate-500">Mô phỏng phân phối, chưa kết nối tài khoản thật.</p>
            </article>
          );
        })}
      </div>
      {isChannelsLoading && <p className="text-sm text-slate-500">Đang tải kênh…</p>}
      {channelError && (
        <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <span>{channelError}</span>
          <button onClick={() => fetchChannels()} className="font-medium">Thử lại</button>
        </div>
      )}
      <p className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        Để kết nối và đăng lên tài khoản Facebook, LinkedIn hoặc X thật, cần cấu hình OAuth credentials và quyền API tương ứng.
      </p>
    </section>
  );
};
