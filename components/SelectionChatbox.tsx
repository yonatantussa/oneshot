'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SelectionChatboxProps {
  selectedText: string;
  onClose: () => void;
}

export function SelectionChatbox({ selectedText, onClose }: SelectionChatboxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastSelectedTextRef = useRef(selectedText);

  // Reset chat when selected text changes
  if (lastSelectedTextRef.current !== selectedText) {
    lastSelectedTextRef.current = selectedText;
    setMessages([]);
    setInput('');
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedText,
          question: userMessage,
          conversationHistory: messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      className="fixed right-8 top-32 w-96 max-h-[70vh] flex flex-col bg-black/20 backdrop-blur-2xl border border-blue-400/20 rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/10"
    >
      {/* Header */}
      <div className="flex items-start justify-between p-6 pb-4 border-b border-white/[0.06] bg-gradient-to-b from-blue-500/5 to-transparent">
        <div className="flex-1 pr-3">
          <div className="text-[10px] text-blue-400/60 uppercase tracking-wider mb-1.5">Selected</div>
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">&ldquo;{selectedText}&rdquo;</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-gray-600 hover:text-gray-300 hover:bg-white/[0.05] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-600 text-xs pt-12 pb-4">
            ask anything about this text
          </div>
        )}
        {messages.map((message, idx) => (
          <div key={idx} className="space-y-1">
            {message.role === 'user' && (
              <div className="text-xs text-gray-600 mb-1 text-right">you</div>
            )}
            <div
              className={cn(
                'text-sm leading-relaxed',
                message.role === 'user'
                  ? 'text-gray-200 bg-white/[0.03] rounded-2xl px-4 py-3 border border-white/[0.06]'
                  : 'text-gray-300 pl-1'
              )}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-600 text-xs pl-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-6 pt-4 border-t border-white/[0.06]">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ask..."
            disabled={isLoading}
            className="w-full px-4 py-3 pr-11 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-white/20 transition-all duration-200"
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-500 hover:text-gray-200 hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}
