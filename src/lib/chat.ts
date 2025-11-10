import type { Message, ChatState, ToolCall, WeatherResult, MCPResult, ErrorResult, SessionInfo } from '../../worker/types';
export interface ChatResponse {
  success: boolean;
  data?: ChatState;
  error?: string;
}
export interface SessionsResponse {
  success: boolean;
  data?: SessionInfo[];
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
  public getSessionId(): string {
    return this.sessionId;
  }
  private updateBaseUrl() {
    this.baseUrl = `/api/chat/${this.sessionId}`;
  }
  newSession(): void {
    this.sessionId = crypto.randomUUID();
    this.updateBaseUrl();
  }
  switchSession(sessionId: string): void {
    this.sessionId = sessionId;
    this.updateBaseUrl();
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
  async clearMessages(): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/clear`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to clear messages:', error);
      return { success: false, error: 'Failed to clear messages' };
    }
  }
  async updateModel(model: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to update model:', error);
      return { success: false, error: 'Failed to update model' };
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
  async listSessions(): Promise<SessionsResponse> {
    try {
      const response = await fetch('/api/sessions');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to list sessions:', error);
      return { success: false, error: 'Failed to list sessions' };
    }
  }
  async clearAllSessions(): Promise<{ success: boolean, data?: { deletedCount: number }, error?: string }> {
    try {
      const response = await fetch('/api/sessions', { method: 'DELETE' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to clear all sessions:', error);
      return { success: false, error: 'Failed to clear all sessions' };
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
export const generateSessionTitle = (message?: string): string => {
  const now = new Date();
  const dateTime = now.toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  if (message && message.trim()) {
    const cleanMessage = message.trim().replace(/\s+/g, ' ');
    const truncated = cleanMessage.length > 40 ? cleanMessage.slice(0, 37) + '...' : cleanMessage;
    return `${truncated} • ${dateTime}`;
  }
  return `Chat ${dateTime}`;
};