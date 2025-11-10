import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bot, Clock, Send, User, Wrench, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { chatService, formatTime, renderToolCall } from '@/lib/chat';
import type { ChatState } from '../../../worker/types';
import { ScrollArea } from '@/components/ui/scroll-area';
interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onNewMessage: (message: string) => void;
}
export function AIAssistant({ isOpen, onClose, onNewMessage }: AIAssistantProps) {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    sessionId: chatService.getSessionId(),
    isProcessing: false,
    model: 'google-ai-studio/gemini-2.5-flash',
    streamingMessage: ''
  });
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, chatState.streamingMessage]);
  const loadCurrentSession = useCallback(async () => {
    const response = await chatService.getMessages();
    if (response.success && response.data) {
      setChatState(prev => ({ ...prev, ...response.data }));
    }
  }, []);
  useEffect(() => {
    if (isOpen) {
      loadCurrentSession();
    }
  }, [isOpen, loadCurrentSession]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatState.isProcessing) return;
    const message = input.trim();
    setInput('');
    onNewMessage(message);
    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: message,
      timestamp: Date.now()
    };
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      streamingMessage: ''
    }));
    await chatService.sendMessage(message, chatState.model, (chunk) => {
      setChatState(prev => ({
        ...prev,
        streamingMessage: (prev.streamingMessage || '') + chunk
      }));
    });
    await loadCurrentSession();
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full md:w-[450px] flex flex-col p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Bot className="text-blue-600" /> VietRide AI Assistant
          </SheetTitle>
          <SheetDescription>
            Ask me to find tickets, like "bus from Hanoi to Sapa tomorrow".
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="p-4 space-y-4">
            {chatState.messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>How can I help you plan your trip in Vietnam today?</p>
              </div>
            )}
            {chatState.messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-muted'}`}>
                  <div className="flex items-center gap-2 mb-1 text-xs opacity-80">
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    <Clock className="w-3 h-3 inline mr-1" />{formatTime(msg.timestamp)}
                  </div>
                  <p className="whitespace-pre-wrap mb-2">{msg.content}</p>
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-current/20">
                      <div className="flex items-center gap-1 mb-2 text-xs opacity-80">
                        <Wrench className="w-3 h-3" /> Tools used:
                      </div>
                      {msg.toolCalls.map((tool, idx) => (
                        <Badge key={idx} variant={msg.role === 'user' ? 'secondary' : 'outline'} className="mr-1 mb-1 text-xs">{renderToolCall(tool)}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {chatState.streamingMessage && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-2xl max-w-[85%]">
                  <p className="whitespace-pre-wrap">{chatState.streamingMessage}<span className="animate-pulse">|</span></p>
                </div>
              </div>
            )}
            {chatState.isProcessing && !chatState.streamingMessage && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-2xl">
                  <div className="flex space-x-1">
                    {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message VietRide AI..."
              className="pr-12 min-h-[48px] max-h-32 resize-none"
              rows={1}
              disabled={chatState.isProcessing}
            />
            <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8" disabled={!input.trim() || chatState.isProcessing}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            AI can make mistakes. Verify important information.
          </p>
        </form>
      </SheetContent>
    </Sheet>
  );
}