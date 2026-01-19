import React, { useState } from 'react';
import { Key, ExternalLink, ShieldCheck, Save, AlertTriangle, PlayCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onSave: (key: string) => void;
  onClose: () => void;
  onViewSample: () => void; // New prop for demo mode
  hasKey: boolean;
}

export const ApiKeyModal: React.FC<Props> = ({ isOpen, onSave, onClose, onViewSample, hasKey }) => {
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!inputKey.trim().startsWith('AIza')) {
      setError('Invalid API Key format. It usually starts with "AIza".');
      return;
    }
    onSave(inputKey.trim());
    onClose();
  };

  const handleDemoMode = () => {
    onViewSample();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#181825] border border-gray-700 w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden">
        
        {/* Decorative Header */}
        <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-eco-500 to-purple-500" />
        
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-eco-500/20 p-3 rounded-xl border border-eco-500/30">
               <Key className="w-6 h-6 text-eco-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Setup Gemini 3</h2>
              <p className="text-xs text-gray-400">Bring Your Own Key (BYOK)</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-lg">
                <p className="text-sm text-blue-200 leading-relaxed flex gap-2">
                    <ShieldCheck className="w-5 h-5 shrink-0 text-blue-400" />
                    <span>
                        For security, this demo runs <strong>entirely in your browser</strong>. 
                        Your API Key is saved to local storage and never sent to our servers.
                    </span>
                </p>
            </div>
            
            {/* Rate Limit Warning */}
            <div className="bg-orange-900/20 border border-orange-500/20 p-3 rounded-lg flex gap-2 items-start">
                 <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                 <p className="text-xs text-orange-200">
                    <strong>Note:</strong> Free tier keys have strictly limited quotas (RPM/TPM). 
                    If you see "Quota Exceeded" errors, please wait a minute or use a paid key.
                 </p>
            </div>

            <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Gemini API Key</label>
                <input 
                    type="password" 
                    value={inputKey}
                    onChange={(e) => {
                        setInputKey(e.target.value);
                        setError('');
                    }}
                    placeholder="AIzaSy..."
                    className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-eco-500 focus:outline-none focus:ring-1 focus:ring-eco-500/50 placeholder-gray-600 font-mono text-sm"
                />
                {error && <p className="text-red-400 text-xs mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {error}</p>}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Don't have a key?</span>
                <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1 text-eco-400 hover:text-eco-300 hover:underline"
                >
                    Get one free from AI Studio <ExternalLink className="w-3 h-3" />
                </a>
            </div>
          </div>

          <div className="flex flex-col gap-3">
             <button 
                onClick={handleSave}
                disabled={!inputKey}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all
                    ${inputKey 
                        ? 'bg-eco-600 hover:bg-eco-500 text-white shadow-lg shadow-eco-900/20' 
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
                `}
             >
                <Save className="w-4 h-4" />
                Save Key & Start
             </button>
             
             <div className="flex gap-3">
                <button 
                    onClick={handleDemoMode}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-colors text-xs font-medium"
                >
                    <PlayCircle className="w-3 h-3" />
                    Try Demo (No Key)
                </button>
                {hasKey && (
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-xs font-medium"
                    >
                        Cancel
                    </button>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};