"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateContent = generateContent;
const genai_1 = require("@google/genai");
const apiKey = process.env.GEMINI_API_KEY || '';
const isKeyValid = apiKey && !apiKey.includes('your_gemini_api_key');
const ai = isKeyValid ? new genai_1.GoogleGenAI({ apiKey }) : null;
/**
 * Generate or optimize social media post using Gemini or Smart Fallback
 */
async function generateContent(prompt, tone = 'engaging') {
    if (ai) {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `You are an expert social media copywriter. Tone: ${tone}. Write an engaging post with relevant hashtags for the following topic:\n${prompt}`,
            });
            if (response.text?.trim()) {
                return response.text.trim();
            }
        }
        catch (err) {
            console.warn('[Gemini AI] API call failed, falling back to smart template:', err);
        }
    }
    // Smart Mock Fallback when GEMINI_API_KEY is not configured or fails
    const toneAdjectives = {
        engaging: 'hào hứng và lôi cuốn',
        professional: 'chuyên nghiệp và bài bản',
        casual: 'thân thiện và gần gũi',
    };
    const toneDesc = toneAdjectives[tone] || 'ấn tượng';
    return `🚀 [ContentFlow AI Assistant - Giọng văn: ${toneDesc}]\n\n` +
        `💡 Chủ đề: "${prompt}"\n\n` +
        `Chúng tôi rất vui mừng được chia sẻ thông tin mới nhất cùng bạn! Đừng bỏ lỡ cơ hội khám phá giải pháp tự động hóa nội dung đa kênh tối ưu nhất hiện nay.\n\n` +
        `👉 Xem chi tiết tại bài viết hoặc để lại bình luận bên dưới nhé!\n\n` +
        `#ContentFlow #MarketingAutomation #SocialMedia #AIContent #GrowthHacking`;
}
