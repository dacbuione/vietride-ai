import type { Message, ChatState, ToolCall, WeatherResult, MCPResult, ErrorResult, SessionInfo } from '../../worker/types';
export interface ChatResponse {
  success: boolean;
  data?: ChatState;
  error?: string;
}
export const MODELS = [
  { id: 'google-ai-studio/gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'google-ai-studio/gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
];
class ChatService {
  private sessionId: string;
  private baseUrl: string;
  constructor() {
    this.sessionId = crypto.randomUUID();
    this.baseUrl = `/api/chat/${this.sessionId}`;
    this.createSession(undefined, this.sessionId);
  }
  async sendMessage(
    message: string,
    model?: string,
    onChunk?: (chunk: string) => void
  ): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, model }),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const jsonResponse: ChatResponse = await response.json();
      if (jsonResponse.success && jsonResponse.data) {
        const lastMessage = jsonResponse.data.messages[jsonResponse.data.messages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant' && lastMessage.toolCalls) {
          lastMessage.toolCalls.forEach(tc => {
            if (tc.name === 'search_routes' && tc.result) {
              window.dispatchEvent(new CustomEvent('tool-result', {
                detail: { toolName: tc.name, result: tc.result }
              }));
            }
          });
        }
      }
      return jsonResponse;
    } catch (error) {
      console.error('Failed to send message:', error);
      return { success: false, error: 'Failed to send message' };
    }
  }
  async getMessages(): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get messages:', error);
      return { success: false, error: 'Failed to load messages' };
    }
  }
  async createSession(title?: string, sessionId?: string, firstMessage?: string): Promise<{ success: boolean; data?: { sessionId: string; title: string }; error?: string }> {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, sessionId, firstMessage })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Failed to create session' };
    }
  }
}
export const chatService = new ChatService();
export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
export const renderToolCall = (toolCall: ToolCall): string => {
  const result = toolCall.result as WeatherResult | MCPResult | ErrorResult | undefined;
  if (!result) return `⚠️ ${toolCall.name}: No result`;
  if (Array.isArray(result)) return `✅ ${toolCall.name}: Found ${result.length} results`;
  if (typeof result === 'object' && result !== null && 'error' in result) return `❌ ${toolCall.name}: ${(result as ErrorResult).error}`;
  if (typeof result === 'object' && result !== null && 'content' in result) return `🔧 ${toolCall.name}: Executed`;
  if (toolCall.name === 'get_weather') {
    const weather = result as WeatherResult;
    return `🌤️ Weather in ${weather.location}: ${weather.temperature}°C, ${weather.condition}`;
  }
  return `🔧 ${toolCall.name}: Done`;
};