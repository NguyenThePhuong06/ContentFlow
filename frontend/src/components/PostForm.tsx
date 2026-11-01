import React, { useState } from 'react';
import { usePostStore } from '../store/postStore';
import { Sparkles, Send, Loader2 } from 'lucide-react';

export const PostForm: React.FC = () => {
  const [content, setContent] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['demo-channel-id']);
  const [scheduledAt, setScheduledAt] = useState('');

  const { createPost, generateDraft, isLoading, isAiGenerating } = usePostStore();

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;
    const generated = await generateDraft(aiPrompt);
    setContent(generated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await createPost({
      content,
      channelIds: selectedChannels,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
    });

    setContent('');
    setAiPrompt('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">Tạo hoặc Lên lịch Bài đăng</h2>

      {/* Gemini AI Assistant Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Hỗ trợ viết bài với Gemini AI
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ví dụ: Giới thiệu tính năng mới của sản phẩm..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            disabled={isAiGenerating || !aiPrompt}
            onClick={handleGenerateAI}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isAiGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Sinh nội dung
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div>
        <textarea
          rows={4}
          placeholder="Nội dung bài viết..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Schedule & Submit */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">Lên lịch (Tùy chọn):</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="px-2 py-1 text-xs border border-slate-200 rounded-md"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !content.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {scheduledAt ? 'Lên lịch đăng' : 'Đăng ngay'}
        </button>
      </div>
    </form>
  );
};

