import { Agent } from 'agents';
import type { Env } from './core-utils';
import type { ChatState, ToolCall } from './types';
import { ChatHandler } from './chat';
import { API_RESPONSES } from './config';
import { createMessage, createStreamResponse, createEncoder } from './utils';
export class ChatAgent extends Agent<Env, ChatState> {
  private chatHandler?: ChatHandler;
  initialState: ChatState = {
    messages: [],
    sessionId: crypto.randomUUID(),
    isProcessing: false,
    model: 'google-ai-studio/gemini-2.5-flash'
  };
  async onStart(): Promise<void> {
    this.chatHandler = new ChatHandler(
      this.env.CF_AI_BASE_URL ,
      this.env.CF_AI_API_KEY,
      this.state.model
    );
    console.log(`ChatAgent ${this.name} initialized with session ${this.state.sessionId}`);
  }
  async onRequest(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const method = request.method;
      if (method === 'GET' && url.pathname === '/messages') {
        return this.handleGetMessages();
      }
      if (method === 'POST' && url.pathname === '/chat') {
        return this.handleChatMessage(await request.json());
      }
      if (method === 'DELETE' && url.pathname === '/clear') {
        return this.handleClearMessages();
      }
      if (method === 'POST' && url.pathname === '/model') {
        return this.handleModelUpdate(await request.json());
      }
      return Response.json({ success: false, error: API_RESPONSES.NOT_FOUND }, { status: 404 });
    } catch (error) {
      console.error('Request handling error:', error);
      return Response.json({ success: false, error: API_RESPONSES.INTERNAL_ERROR }, { status: 500 });
    }
  }
  private handleGetMessages(): Response {
    return Response.json({ success: true, data: this.state });
  }
  private async handleChatMessage(body: { message: string; model?: string; }): Promise<Response> {
    const { message, model } = body;
    if (!message?.trim()) {
      return Response.json({ success: false, error: API_RESPONSES.MISSING_MESSAGE }, { status: 400 });
    }
    if (model && model !== this.state.model) {
      this.setState({ ...this.state, model });
      this.chatHandler?.updateModel(model);
    }
    const userMessage = createMessage('user', message.trim());
    this.setState({
      ...this.state,
      messages: [...this.state.messages, userMessage],
      isProcessing: true
    });
    try {
      if (!this.chatHandler) throw new Error('Chat handler not initialized');
      const response = await this.chatHandler.processMessage(message, this.state.messages);
      // This is a custom event dispatch to notify the frontend of tool results.
      // This is a conceptual implementation. In a real-world scenario with separate client/server,
      // this would be handled via WebSockets or another push mechanism.
      // For this project, we'll simulate this by having the frontend check the tool call results.
      if (response.toolCalls) {
        response.toolCalls.forEach(tc => {
          if (tc.name === 'search_routes' && tc.result) {
            // This is a simplified way to pass structured data back.
            // A more robust solution might involve a separate endpoint or websocket message.
            const eventPayload = {
              toolName: tc.name,
              result: tc.result
            };
            // We can't directly dispatch DOM events from a worker.
            // Instead, we'll pass this structured data along with the response.
            // The frontend will need to be updated to handle this.
            // For now, we add it to the assistant message.
          }
        });
      }
      const assistantMessage = createMessage('assistant', response.content, response.toolCalls);
      this.setState({
        ...this.state,
        messages: [...this.state.messages, assistantMessage],
        isProcessing: false
      });
      return Response.json({ success: true, data: this.state });
    } catch (error) {
      console.error('Chat processing error:', error);
      this.setState({ ...this.state, isProcessing: false });
      const errorMessage = createMessage('assistant', 'Sorry, I encountered an error. Please try again.');
      this.setState({ ...this.state, messages: [...this.state.messages, errorMessage] });
      return Response.json({ success: false, error: API_RESPONSES.PROCESSING_ERROR }, { status: 500 });
    }
  }
  private handleClearMessages(): Response {
    this.setState({ ...this.state, messages: [] });
    return Response.json({ success: true, data: this.state });
  }
  private handleModelUpdate(body: { model: string }): Response {
    const { model } = body;
    this.setState({ ...this.state, model });
    this.chatHandler?.updateModel(model);
    return Response.json({ success: true, data: this.state });
  }
}