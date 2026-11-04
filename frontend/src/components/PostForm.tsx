import React, { useEffect, useState } from 'react';
import { CHANNEL_PLATFORM_LABELS, usePostStore } from '../store/postStore';
import { Sparkles, Send, Loader2, AlertCircle, CheckSquare, Square, RefreshCw } from 'lucide-react';

export const PostForm: React.FC = () => {
  const [content, setContent] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [tone, setTone] = useState('engaging');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    channels,
    fetchChannels,
    createPost,
    generateDraft,
    isLoading,
    isChannelsLoading,
    isAiGenerating,
    error,
    channelError,
  } = usePostStore();

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  // Auto-select all channels once loaded if none selected yet
  useEffect(() => {
    if (channels.length > 0 && selectedChannels.length === 0) {
      setSelectedChannels(channels.map((c) => c.id));
    }
  }, [channels, selectedChannels.length]);

  const toggleChannel = (id: string) => {
    setSelectedChannels((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;
    setLocalError(null);
    try {
      const generated = await generateDraft(aiPrompt, tone);
      setContent(generated);
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!content.trim()) {
      setLocalError('Vui lòng nhập nội dung bài viết.');
      return;
    }
    if (selectedChannels.length === 0) {
      setLocalError('Vui lòng chọn ít nhất một kênh để phân phối.');
      return;
    }

    try {
      await createPost({
        content,
        channelIds: selectedChannels,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      });

      setContent('');
      setAiPrompt('');
      setScheduledAt('');
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">Tạo hoặc Lên lịch Bài đăng</h2>

      {(localError || error) && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{localError || error}</span>
        </div>
      )}

      {/* Gemini AI Assistant Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Hỗ trợ viết bài với Gemini AI
          </label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="text-xs border border-slate-200 bg-white rounded px-2 py-1 focus:outline-none"
          >
            <option value="engaging">Giọng văn Lôi cuốn</option>
            <option value="professional">Giọng văn Chuyên nghiệp</option>
            <option value="casual">Giọng văn Gần gũi</option>
          </select>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Gợi ý: Ra mắt tính năng tự động hóa nội dung đa kênh..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            disabled={isAiGenerating || !aiPrompt.trim()}
            onClick={handleGenerateAI}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isAiGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Sinh nội dung
          </button>
        </div>
      </div>

      {/* Content Editor */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Nội dung bài viết:</label>
        <textarea
          rows={5}
          placeholder="Viết nội dung bài đăng của bạn tại đây hoặc dùng Gemini AI để tạo..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Channel Selector */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-2">Chọn kênh phân phối:</label>
        {channelError && (
          <div className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <span>{channelError}</span>
            <button
              type="button"
              onClick={() => fetchChannels()}
              className="inline-flex shrink-0 items-center gap-1 font-medium hover:text-rose-900"
            >
              <RefreshCw className="h-3 w-3" />
              Thử lại
            </button>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {channels.map((channel) => {
            const isSelected = selectedChannels.includes(channel.id);
            return (
              <button
                key={channel.id}
                type="button"
                onClick={() => toggleChannel(channel.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  isSelected
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {isSelected ? <CheckSquare className="w-3.5 h-3.5 text-blue-600" /> : <Square className="w-3.5 h-3.5 text-slate-400" />}
                {channel.accountName} ({CHANNEL_PLATFORM_LABELS[channel.platform]})
              </button>
            );
          })}
          {channels.length === 0 && isChannelsLoading && (
            <span className="text-xs text-slate-400 italic">Đang tải danh sách kênh...</span>
          )}
          {channels.length === 0 && !isChannelsLoading && !channelError && (
            <span className="text-xs text-slate-400 italic">Chưa có kênh phân phối khả dụng.</span>
          )}
        </div>
      </div>

      {/* Schedule & Submit Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-600 font-medium">Lên lịch đăng:</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || isChannelsLoading || channels.length === 0 || !content.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {scheduledAt ? 'Lên lịch ngay' : 'Đăng ngay'}
        </button>
      </div>
    </form>
  );
};
