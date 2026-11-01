import { create } from 'zustand';
import { apiRequest } from '../services/api';

export interface PostTarget {
  id: string;
  status: 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
  channel: {
    platform: 'FACEBOOK' | 'LINKEDIN' | 'TWITTER';
    accountName: string;
  };
}

export interface Post {
  id: string;
  content: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
  scheduledAt?: string;
  createdAt: string;
  targets: PostTarget[];
}

interface PostState {
  posts: Post[];
  isLoading: boolean;
  isAiGenerating: boolean;
  error: string | null;

  fetchPosts: () => Promise<void>;
  createPost: (data: { content: string; channelIds: string[]; scheduledAt?: string }) => Promise<void>;
  generateDraft: (prompt: string, tone?: string) => Promise<string>;
}

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  isLoading: false,
  isAiGenerating: false,
  error: null,

  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      const posts = await apiRequest<Post[]>('/posts');
      set({ posts, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  createPost: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await apiRequest<Post>('/posts', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      await get().fetchPosts();
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  generateDraft: async (prompt, tone = 'engaging') => {
    set({ isAiGenerating: true });
    try {
      const res = await apiRequest<{ content: string }>('/posts/ai-generate', {
        method: 'POST',
        body: JSON.stringify({ prompt, tone }),
      });
      return res.content;
    } finally {
      set({ isAiGenerating: false });
    }
  },
}));

