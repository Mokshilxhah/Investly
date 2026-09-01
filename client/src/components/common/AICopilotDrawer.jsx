import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  X,
  Bot,
  User,
  Trash2,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import chatService from '../../services/chatService';

const QUICK_PROMPTS = [
  '🏆 Top Deal',
  '⚖️ Compare Aura vs TracePay',
  '🛡️ Risk Radar Alerts',
  '📊 Portfolio Summary',
  '👤 Top Founders',
  '📐 Scoring Formula',
];

export const AICopilotDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener('toggle-ai-copilot', handleToggle);
    return () => window.removeEventListener('toggle-ai-copilot', handleToggle);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const data = await chatService.sendMessage(query);
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data?.reply || 'No relevant data found.',
        suggestions: data?.suggestions || [],
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: `⚠️ **Error:** ${err.message || 'Unable to connect to server.'}`,
          suggestions: ['🏆 Top Deal', '📊 Portfolio Summary'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  // Minimal clean text parser
  const renderMessageContent = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return (
      <div className="space-y-1.5 text-[13px] leading-relaxed text-slate-800">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Header ###
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-sm font-bold text-slate-950 mt-2 mb-1">
                {trimmed.replace('### ', '')}
              </h3>
            );
          }

          // Bullet
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-emerald-600 font-bold mt-0.5">•</span>
                <span className="flex-1">{parseInlineStyles(trimmed.substring(2))}</span>
              </div>
            );
          }

          // Numbered item
          if (/^\d+\.\s/.test(trimmed)) {
            const match = trimmed.match(/^(\d+\.)\s(.*)/);
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="font-bold text-slate-950">{match[1]}</span>
                <span className="flex-1">{parseInlineStyles(match[2])}</span>
              </div>
            );
          }

          // Table row separator ---
          if (trimmed === '---') {
            return <hr key={idx} className="my-2 border-slate-100" />;
          }

          // Table row
          if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            if (trimmed.includes('---')) return null;
            const cells = trimmed.split('|').map((c) => c.trim()).filter(Boolean);
            const isHeader = idx > 0 && lines[idx + 1]?.includes('---');

            return (
              <div
                key={idx}
                className={`grid grid-cols-${cells.length} gap-2 p-1.5 rounded-lg text-xs ${
                  isHeader
                    ? 'bg-slate-50 font-bold text-slate-900 border border-slate-200/60'
                    : 'border-b border-slate-50 font-normal text-slate-700'
                }`}
                style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}
              >
                {cells.map((cell, cIdx) => (
                  <div key={cIdx} className="truncate">
                    {parseInlineStyles(cell)}
                  </div>
                ))}
              </div>
            );
          }

          return <p key={idx}>{parseInlineStyles(line)}</p>;
        })}
      </div>
    );
  };

  // Helper to parse markdown elements
  const parseInlineStyles = (content) => {
    const regex = /(\[.*?\]\(.*?\)|\*\*.*?\*\*|`.*?`)/g;
    const parts = content.split(regex);

    return parts.map((part, i) => {
      if (!part) return null;

      // Link [text](url)
      const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        const [_, label, url] = linkMatch;
        return (
          <Link
            key={i}
            to={url}
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center gap-0.5 text-emerald-600 hover:text-emerald-800 font-bold underline underline-offset-2 ml-1 cursor-pointer transition-colors"
          >
            <span>{label}</span>
            <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
          </Link>
        );
      }

      // Bold **text**
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-slate-950">
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Code `text`
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="bg-slate-100 text-slate-800 font-mono text-[11px] px-1.5 py-0.5 rounded border border-slate-200">
            {part.slice(1, -1)}
          </code>
        );
      }

      return part;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      {/* 🌟 Clean Minimal Modal */}
      <div
        className="w-full max-w-2xl h-[600px] max-h-[85vh] bg-white rounded-3xl shadow-xl border border-slate-200/80 flex flex-col overflow-hidden animate-in zoom-in-98 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 px-6 flex items-center justify-between border-b border-slate-100 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-[#9df5a9] flex items-center justify-center font-bold shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  AI Diligence Assistant
                </h3>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Live portfolio intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-xs"
                title="Clear Chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body: Feed or Empty Starter */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-slate-50/40">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  How can I help with your pipeline today?
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Ask about deal rankings, compare metrics, check risk alerts, or view portfolio averages.
                </p>
              </div>

              {/* Minimal Clean Prompt Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-md pt-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white hover:bg-slate-900 hover:text-white text-slate-700 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.sender === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-[#9df5a9] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-2xs ${
                      isUser
                        ? 'bg-slate-900 text-white rounded-tr-xs'
                        : 'bg-white text-slate-900 border border-slate-200/70 rounded-tl-xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="font-medium">{msg.text}</p>
                    ) : (
                      renderMessageContent(msg.text)
                    )}

                    {/* Suggestions */}
                    {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {msg.suggestions.map((sugg) => (
                          <button
                            key={sugg}
                            type="button"
                            onClick={() => handleSend(sugg)}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-slate-200/60 transition-colors cursor-pointer"
                          >
                            {sugg}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-[#9df5a9] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="bg-white border border-slate-200/70 rounded-2xl rounded-tl-xs p-3 shadow-2xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 px-4 bg-white border-t border-slate-100 flex items-center gap-2 flex-shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about any startup, score, or comparison..."
            className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1.5 focus:ring-emerald-500 font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-black text-[#9df5a9] disabled:opacity-40 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AICopilotDrawer;
