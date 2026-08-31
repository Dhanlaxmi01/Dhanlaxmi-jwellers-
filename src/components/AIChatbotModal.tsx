import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Crown, 
  MessageCircle, 
  RotateCcw, 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  User, 
  Bot, 
  Loader2,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { ChatMessage, JewelryProduct, LiveRates, SiteSettings } from '../types';
import { formatINR } from '../utils/pricing';

interface AIChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  rates: LiveRates;
  settings: SiteSettings;
  products: JewelryProduct[];
  onSelectProduct: (product: JewelryProduct) => void;
  onOpenCalculator: () => void;
}

const STORAGE_CHAT_KEY = 'dlx_ai_concierge_history_v1';

const INITIAL_GREETING_MESSAGE: ChatMessage = {
  id: 'msg-welcome-01',
  sender: 'assistant',
  text: `Namaste and welcome to **DHANLAXMI JWELLERS** Haldwani. 👑\n\nI am your Royal AI Jewelry Concierge. I can assist you with today's live 24K & 22K gold rates, custom bridal choker designing, BIS 916 hallmarking guidance, or finding the perfect heirloom piece. How may I serve you today?`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

const SUGGESTED_QUESTIONS = [
  "✨ Today's Live 22K & 24K Gold Rates",
  "👑 Recommend a Bridal Kundan Choker",
  "💎 Solitaire Diamond Rings & Offers",
  "🏷️ What are the active discount coupons?",
  "📍 Showroom timings & Nanda Vihar address"
];

export const AIChatbotModal: React.FC<AIChatbotModalProps> = ({
  isOpen,
  onClose,
  rates,
  settings,
  products,
  onSelectProduct,
  onOpenCalculator,
}) => {
  if (!isOpen) return null;

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CHAT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load chat history', e);
    }
    return [INITIAL_GREETING_MESSAGE];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Sync messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [messages]);

  // Smooth Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg-user-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6)
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: 'msg-ast-' + Date.now(),
        sender: 'assistant',
        text: data.reply || "Namaste! Thank you for your inquiry with Dhanlaxmi Jwellers.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        productSuggestions: data.suggestions && data.suggestions.length > 0 ? data.suggestions : undefined
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat API Error:', err);
      // Seamless Fallback
      const fallbackMsg: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        sender: 'assistant',
        text: `Namaste! I am currently operating on our verified offline boutique knowledge base.\n\nToday's live 22K gold rate is **${formatINR(rates.gold22k)}/10g** and 24K is **${formatINR(rates.gold24k)}/10g**. For immediate VIP booking, you may also call our master showroom directly at **${settings.storePhone}**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to reset your concierge conversation?')) {
      setMessages([INITIAL_GREETING_MESSAGE]);
      localStorage.removeItem(STORAGE_CHAT_KEY);
    }
  };

  // Helper to format markdown-style bold and bullet text
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          // Parse bold **text**
          const parts = line.split(/(\*\*.*?\*\*)/g);
          const formattedLine = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-amber-200">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });

          if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-2">
                <span className="text-[#DFB76C] font-bold shrink-0">•</span>
                <span className="text-stone-200">{formattedLine}</span>
              </div>
            );
          }

          return <p key={idx} className="text-stone-200">{formattedLine}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div 
        className="relative bg-[#081816] text-[#E8D5B5] rounded-3xl max-w-xl w-full h-[90vh] max-h-[700px] flex flex-col shadow-2xl border-2 border-[#C59B27]/70 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-[#051110] p-4 border-b border-[#C59B27]/40 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#DFB76C] to-[#996515] p-0.5 flex items-center justify-center shadow-lg">
              <div className="w-full h-full bg-[#081816] rounded-2xl flex items-center justify-center">
                <Crown className="w-5 h-5 text-[#DFB76C]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-luxury font-bold text-white text-base sm:text-lg tracking-wide">
                  DHANLAXMI AI CONCIERGE
                </h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Gemini 3.7 Online
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Bespoke Bridal Consultations • Live Haldwani Bullion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearHistory}
              className="p-2 rounded-xl text-stone-400 hover:text-rose-400 hover:bg-black/40 transition"
              title="Clear chat history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-black/40 transition"
              title="Close Concierge"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Rates Snapshot Bar */}
        <div className="bg-[#0A1F1C] px-4 py-2 border-b border-[#C59B27]/20 flex items-center justify-between text-xs text-stone-300 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#DFB76C]" />
            <span>22K: <strong className="text-white">{formatINR(rates.gold22k)}</strong></span>
            <span className="text-stone-500">|</span>
            <span>24K: <strong className="text-white">{formatINR(rates.gold24k)}</strong></span>
          </div>
          <button 
            onClick={() => { onOpenCalculator(); onClose(); }}
            className="text-[#DFB76C] hover:underline text-[11px] font-medium"
          >
            Open Calculator &rarr;
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-[#081816] to-[#040D0C]">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#C59B27]/20 border border-[#C59B27]/50 flex items-center justify-center shrink-0 mt-1">
                    <Crown className="w-4 h-4 text-[#DFB76C]" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[80%] space-y-2 ${
                  isUser ? 'items-end' : 'items-start'
                }`}>
                  <div className={`p-3.5 rounded-2xl text-xs sm:text-sm shadow-md ${
                    isUser
                      ? 'bg-gradient-to-r from-[#DFB76C] to-[#C59B27] text-stone-950 font-medium rounded-tr-none'
                      : 'bg-[#0E2421] border border-[#C59B27]/30 text-stone-100 rounded-tl-none'
                  }`}>
                    {isUser ? msg.text : renderFormattedText(msg.text)}
                  </div>

                  {/* Product Suggestions Cards if attached */}
                  {!isUser && msg.productSuggestions && msg.productSuggestions.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#DFB76C] font-bold block">
                        Recommended Pieces:
                      </span>
                      <div className="grid grid-cols-1 gap-2">
                        {msg.productSuggestions.map((prod) => (
                          <div
                            key={prod.id}
                            onClick={() => {
                              onSelectProduct(prod);
                              onClose();
                            }}
                            className="p-2.5 rounded-xl bg-black/60 border border-[#C59B27]/40 hover:border-[#DFB76C] transition flex items-center justify-between gap-3 cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5">
                              <img
                                src={prod.images[0]}
                                alt={prod.name}
                                className="w-10 h-10 rounded-lg object-cover border border-stone-700"
                              />
                              <div>
                                <div className="text-xs font-bold text-[#DFB76C] group-hover:text-white transition">
                                  {prod.name}
                                </div>
                                <div className="text-[10px] text-stone-400">
                                  {prod.purity} • {prod.grossWeight}g • {prod.certification}
                                </div>
                              </div>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#DFB76C]" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={`text-[9px] font-mono text-stone-500 px-1 ${
                    isUser ? 'text-right' : 'text-left'
                  }`}>
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#DFB76C] text-stone-950 flex items-center justify-center shrink-0 mt-1 font-bold">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-start animate-fadeIn">
              <div className="w-8 h-8 rounded-full bg-[#C59B27]/20 border border-[#C59B27]/50 flex items-center justify-center shrink-0">
                <Crown className="w-4 h-4 text-[#DFB76C]" />
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0E2421] border border-[#C59B27]/30 text-stone-300 text-xs rounded-tl-none flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-[#DFB76C] animate-spin" />
                <span>Consulting master boutique records...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Suggestion Pills */}
        <div className="px-4 py-2 bg-[#051110] border-t border-[#C59B27]/20 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1.5 rounded-full bg-[#081816] hover:bg-[#C59B27]/20 border border-[#C59B27]/40 text-[11px] text-stone-300 hover:text-white whitespace-nowrap transition cursor-pointer disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#051110] border-t border-[#C59B27]/40 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-black/60 border border-[#C59B27]/50 rounded-2xl p-1.5 focus-within:border-[#DFB76C] transition"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about bridal sets, gold rates, diamond carats..."
              disabled={isLoading}
              className="flex-1 bg-transparent px-3 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-[#DFB76C] to-[#C59B27] text-stone-950 font-bold hover:brightness-110 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-stone-500 px-2 pt-2">
            <span>Showroom: HALDWANI NANDA VIHAR . PHASE -I</span>
            <span>Direct Call: <a href={`tel:${settings.storePhone}`} className="text-[#DFB76C] hover:underline">{settings.storePhone}</a></span>
          </div>
          
          <button
            onClick={onClose}
            className="w-full mt-2 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 font-semibold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition"
          >
            <span>Back To Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
