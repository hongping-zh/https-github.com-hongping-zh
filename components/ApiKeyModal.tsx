import React, { useState, useEffect } from 'react';
import { Key, Lock, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string) => void;
  onClose: () => void;
  hasKey: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave, onClose, hasKey }) => {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  
  // Clear input when modal opens
  useEffect(() => {
    if (isOpen) {
      setKey('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) {
      setError('Please enter a valid API key');
      return;
    }
    if (!key.startsWith('AIza')) {
      setError('That doesn\'t look like a valid Gemini API key (starts with AIza...)');
      return;
    }
    onSave(key.trim());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e1e2e] border border-gray-700 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-eco-900/50 to-purple-900/50 p-6 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-eco-500/20 rounded-lg border border-eco-500/30">
              <Key className="w-6 h-6 text-eco-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Setup Gemini API</h2>
          </div>
          <p className="text-sm text-gray-300">
            EcoCompute AI runs 100% in your browser. Bring your own key to get started.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
             <Lock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
             <div className="text-xs text-blue-200">
               <strong className="block mb-1 text-blue-100">Zero-Server Privacy</strong>
               Your API key is stored locally in your browser's <code className="bg-black/30 px-1 py-0.5 rounded">localStorage</code>. 
               It is never sent to our servers. We communicate directly with Google's API from your client.
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="apiKey" className="text-sm font-medium text-gray-300 block">
                Enter your Gemini API Key
              </label>
              <input
                id="apiKey"
                type="password"
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  setError('');
                }}
                placeholder="AIzaSy..."
                className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-eco-500 focus:ring-1 focus:ring-eco-500 transition-all font-mono text-sm"
              />
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs mt-2 animate-in slide-in-from-top-1">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-eco-600 hover:bg-eco-500 text-white font-semibold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(22,163,74,0.3)] hover:shadow-[0_0_25px_rgba(22,163,74,0.5)] flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save & Connect
            </button>
          </form>

          <div className="pt-4 border-t border-gray-800 text-center">
             <a 
               href="https://aistudio.google.com/app/apikey" 
               target="_blank" 
               rel="noreferrer"
               className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-eco-400 transition-colors"
             >
               Get a free Gemini API Key <ExternalLink className="w-3 h-3" />
             </a>
          </div>
        </div>
        
        {hasKey && (
           <button 
             onClick={onClose}
             className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
           >
             ✕
           </button>
        )}

      </div>
    </div>
  );
};
