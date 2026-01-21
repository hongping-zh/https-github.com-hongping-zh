
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, MessageSquare, ExternalLink, Lock, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { sendV38Message, GeminiError } from '../services/geminiService';
import { ChatMessage } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    role: 'model',
    text: "Welcome to V38 Wisdom Pilot. I am the architect of EcoCompute's Green FinOps methodology. \n\nAsk me about our 'Hybrid Grounding Engine', 'Tiered Architecture', or how to cut your cloud bill by 30%.",
    timestamp: Date.now()
  }
];

// Daily message limit for free tier
const DAILY_MESSAGE_LIMIT = 7;
const STORAGE_KEY = 'v38_pilot_usage';

interface UsageData {
  date: string;
  count: number;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

const getUsageData = (): UsageData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as UsageData;
      // Reset if it's a new day
      if (data.date !== getTodayString()) {
        return { date: getTodayString(), count: 0 };
      }
      return data;
    }
  } catch (e) {
    console.warn('Failed to read usage data');
  }
  return { date: getTodayString(), count: 0 };
};

const incrementUsage = (): number => {
  const usage = getUsageData();
  usage.count += 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  return usage.count;
};

export const V38ChatModal: React.FC<Props> = ({ isOpen, onClose, apiKey }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyUsage, setDailyUsage] = useState<UsageData>(getUsageData());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const remainingMessages = DAILY_MESSAGE_LIMIT - dailyUsage.count;
  const isLimitReached = remainingMessages <= 0;

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    if (!apiKey) {
      setMessages(prev => [...prev, { role: 'model', text: "Please configure your Gemini API Key in the settings first to consult the V38 Pilot.", timestamp: Date.now() }]);
      return;
    }

    // Check daily limit
    if (isLimitReached) {
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "You've reached your daily limit of 7 free consultations. \n\n**Upgrade to V38 Pro** for unlimited access to the Wisdom Pilot and priority support.", 
        timestamp: Date.now() 
      }]);
      return;
    }

    // Increment usage
    const newCount = incrementUsage();
    setDailyUsage({ date: getTodayString(), count: newCount });

    const userMsg: ChatMessage = { role: 'user', text: inputText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Create a temporary model message for streaming
      const tempModelMsg: ChatMessage = { role: 'model', text: "", timestamp: Date.now() };
      setMessages(prev => [...prev, tempModelMsg]);

      // IMPORTANT: We pass 'messages' (the state representing history BEFORE this new message)
      // and 'userMsg.text' as the new message. The service handles the merge.
      // This prevents the "Double User Turn" error (400 Bad Request) from the API.
      await sendV38Message(apiKey, messages, userMsg.text, (chunk) => {
        setMessages(prev => {
           const newHistory = [...prev];
           const lastMsg = newHistory[newHistory.length - 1];
           lastMsg.text += chunk;
           return newHistory;
        });
      });

    } catch (error: any) {
      // Remove the empty streaming message if it failed completely
      setMessages(prev => {
          const newHistory = [...prev];
          const last = newHistory[newHistory.length - 1];
          if (last.role === 'model' && !last.text) {
              newHistory.pop();
          }
          return [...newHistory, { role: 'model', text: `Connection Error: ${error.message}`, timestamp: Date.now() }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#181825] border border-eco-500/30 w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex overflow-hidden relative">
        
        {/* Sidebar / CTA Panel */}
        <div className="hidden md:flex w-64 bg-[#11111b] border-r border-gray-800 p-6 flex-col justify-between">
            <div>
               <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-6 h-6 text-eco-400" />
                  <h2 className="font-bold text-white tracking-tight">V38 Pilot</h2>
               </div>
               
               <div className="space-y-4">
                  <div className="p-3 bg-dark-800 rounded-lg border border-gray-700">
                     <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Knowledge Base</h3>
                     <ul className="space-y-2 text-xs text-gray-300">
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-eco-500" /> Hybrid Grounding</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-eco-500" /> 2026 Hardware Specs</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-eco-500" /> FinOps Protocols</li>
                     </ul>
                  </div>

                  {/* Daily Usage Counter */}
                  <div className={`p-3 rounded-lg border ${isLimitReached ? 'bg-red-900/10 border-red-500/20' : 'bg-gray-800/50 border-gray-700'}`}>
                     <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase">Daily Quota</h3>
                        <Clock className={`w-3 h-3 ${isLimitReached ? 'text-red-400' : 'text-gray-500'}`} />
                     </div>
                     <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-bold ${isLimitReached ? 'text-red-400' : 'text-eco-400'}`}>
                           {Math.max(0, remainingMessages)}
                        </span>
                        <span className="text-xs text-gray-500">/ {DAILY_MESSAGE_LIMIT} left today</span>
                     </div>
                     {isLimitReached && (
                        <p className="text-[10px] text-red-300 mt-2">Resets at midnight UTC</p>
                     )}
                  </div>

                  <div className="p-3 bg-blue-900/10 rounded-lg border border-blue-500/20">
                     <h3 className="text-xs font-bold text-blue-400 uppercase mb-2">Unlock Experience</h3>
                     <p className="text-[10px] text-gray-400 leading-relaxed mb-3">
                        Get unlimited access to the V38 Consulting Engine for your team.
                     </p>
                     <button className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded shadow-lg shadow-blue-900/20 transition-all">
                        Upgrade to V38 Pro
                     </button>
                  </div>
               </div>
            </div>

            <div className="text-[10px] text-gray-600 text-center">
               Powered by Gemini 3 Flash
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-[#181825] relative">
            {/* Header */}
            <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#11111b]/50 backdrop-blur-md">
                <div>
                   <h3 className="text-white font-bold flex items-center gap-2">
                      V38 Wisdom Pilot
                      <span className="bg-eco-500 text-black text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">LIVE</span>
                   </h3>
                   <p className="text-xs text-gray-500">Consult the Architect of EcoCompute AI</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 transition-colors">
                   <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
               {messages.map((msg, idx) => {
                  const isError = msg.text.startsWith('Connection Error:');
                  return (
                    <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${isError ? 'bg-red-500/20 border-red-500/30' : 'bg-eco-500/20 border-eco-500/30'}`}>
                                {isError ? <AlertTriangle className="w-4 h-4 text-red-400" /> : <Bot className="w-4 h-4 text-eco-400" />}
                            </div>
                        )}
                        
                        <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                            msg.role === 'user' 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : isError 
                                ? 'bg-red-900/20 text-red-200 border border-red-500/30 rounded-tl-none'
                                : 'bg-[#1e1e2e] text-gray-200 border border-gray-700 rounded-tl-none'
                        }`}>
                            <div className="whitespace-pre-wrap">{msg.text}</div>
                        </div>

                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-gray-300" />
                            </div>
                        )}
                    </div>
                  );
               })}
               {isLoading && (
                  <div className="flex gap-4">
                     <div className="w-8 h-8 rounded-full bg-eco-500/20 flex items-center justify-center shrink-0 border border-eco-500/30">
                           <Bot className="w-4 h-4 text-eco-400" />
                     </div>
                     <div className="flex items-center gap-1 bg-[#1e1e2e] px-4 py-3 rounded-2xl rounded-tl-none border border-gray-700">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                     </div>
                  </div>
               )}
               <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-800 bg-[#11111b]">
               <div className="relative flex items-center gap-2 bg-[#1e1e2e] border border-gray-700 rounded-xl p-2 focus-within:border-eco-500 transition-colors">
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about the methodology, ROI, or technical architecture..."
                    className="flex-1 bg-transparent text-sm text-white px-3 focus:outline-none"
                    autoFocus
                  />
                  <button 
                    onClick={handleSend}
                    disabled={isLoading || !inputText.trim() || isLimitReached}
                    className="p-2 bg-eco-600 hover:bg-eco-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                     <Send className="w-4 h-4" />
                  </button>
               </div>
            </div>
        </div>

      </div>
    </div>
  );
};
