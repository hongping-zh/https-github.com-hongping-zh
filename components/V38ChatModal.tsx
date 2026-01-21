
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

// Demo Mode: Pre-defined responses for users without API Key
const DEMO_RESPONSES: Record<string, string> = {
  'default': `Great question! Let me explain the **V38 methodology**.

**The Core Problem**: Your engineers write PyTorch code that costs 30% more than it should. Monitoring tools like Datadog see the *symptoms* (high GPU usage), but we see the *root cause* (inefficient code).

**Our Solution**: A CI/CD Gatekeeper that intercepts expensive code *before* it merges.

**The Architecture**:
- **L1 Static Gate**: Free regex/AST scanning (catches 80% of issues)
- **L2 Flash Router**: Gemini Flash for simple fixes
- **L3 Deep Reasoning**: Gemini 3 Pro for complex architecture changes

Would you like to know more about our **ROI model** or **technical implementation**?`,
  
  'roi': `**ROI Analysis for V38**

Typical enterprise results:
- **30-50% reduction** in GPU cloud costs
- **$50K-200K/year** savings for mid-size AI teams
- **2-week payback period** on Growth tier ($299/mo)

**How we calculate savings**:
1. Scan your codebase for inefficiency patterns
2. Estimate FLOPs reduction from optimizations
3. Map to real cloud pricing (H100: $3.50/hr, B200: $5.00/hr)

The key insight: **1% efficiency improvement = 1% cost reduction**, compounded across millions of inferences.`,
  
  'architecture': `**V38 Hybrid Grounding Architecture**

We de-risk AI optimization with 4 verification layers:

1. **Static AST Analysis** (Deterministic)
   - Instant code topology mapping
   - Zero hallucination baseline

2. **Gemini 3 Reasoning** (1024-token thinking budget)
   - Plans audit strategy like a Senior Engineer
   - Cross-references physics equations

3. **Google Search Grounding** (Real-time)
   - 2026 hardware specs (B200, Edge TPU)
   - Live cloud pricing from AWS/GCP/Azure

4. **Code Execution Sandbox** (Math Verification)
   - Forces LLM to write Python to verify FLOPs
   - Eliminates arithmetic hallucinations

This is why we can provide **Error Bars** and **Confidence Scores** - we don't guess, we verify.`,
  
  'pricing': `**V38 Pricing Tiers**

| Tier | Price | Features |
|------|-------|----------|
| **Starter** | $49/mo | Basic code audits, 100 scans/mo |
| **Growth** | $299/mo | CI/CD Gatekeeper, FinOps Dashboard, Team Collaboration |
| **Enterprise** | Custom | Air-gapped deployment, Custom compliance reports, SLA |

**Why Growth is our most popular tier**:
- Pays for itself if you save just 2 GPU-hours/month
- Most teams see 10-20x ROI

Interested in a pilot program? Contact us at hello@ecocompute.ai`
};

const getDemoResponse = (userMessage: string): string => {
  const lowerMsg = userMessage.toLowerCase();
  if (lowerMsg.includes('roi') || lowerMsg.includes('cost') || lowerMsg.includes('save') || lowerMsg.includes('money') || lowerMsg.includes('价') || lowerMsg.includes('省')) {
    return DEMO_RESPONSES['roi'];
  }
  if (lowerMsg.includes('architect') || lowerMsg.includes('technical') || lowerMsg.includes('how') || lowerMsg.includes('work') || lowerMsg.includes('技术') || lowerMsg.includes('架构')) {
    return DEMO_RESPONSES['architecture'];
  }
  if (lowerMsg.includes('price') || lowerMsg.includes('pricing') || lowerMsg.includes('tier') || lowerMsg.includes('plan') || lowerMsg.includes('定价')) {
    return DEMO_RESPONSES['pricing'];
  }
  return DEMO_RESPONSES['default'];
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
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    // Demo Mode: If no API Key, use pre-defined responses
    if (!apiKey) {
      // Simulate typing delay for realism
      await new Promise(resolve => setTimeout(resolve, 800));
      const demoResponse = getDemoResponse(currentInput);
      
      // Simulate streaming effect
      const words = demoResponse.split(' ');
      let accumulated = '';
      setMessages(prev => [...prev, { role: 'model', text: '', timestamp: Date.now() }]);
      
      for (let i = 0; i < words.length; i++) {
        accumulated += (i === 0 ? '' : ' ') + words[i];
        setMessages(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].text = accumulated;
          return [...newHistory];
        });
        await new Promise(resolve => setTimeout(resolve, 20));
      }
      
      setIsLoading(false);
      return;
    }

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
