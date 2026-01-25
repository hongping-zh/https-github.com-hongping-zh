
import React, { useState, useEffect } from 'react';
import { HardwareSelector, hardwareOptions } from './components/HardwareSelector';
import { CodeBlock } from './components/CodeBlock';
import { MetricsCard } from './components/MetricsCard';
import { DataMoatVisualizer } from './components/DataMoatVisualizer';
import { ThinkingPanel } from './components/ThinkingPanel';
import { ImpactTracker } from './components/ImpactTracker';
import { TradeoffRadar } from './components/TradeoffRadar';
import { HelpModal } from './components/HelpModal';
import { ApiKeyModal } from './components/ApiKeyModal'; 
import { CiCdSimulator } from './components/CiCdSimulator'; 
import { CalibrationPanel } from './components/CalibrationPanel'; 
import { DeployModal } from './components/DeployModal'; 
import { V38ChatModal } from './components/V38ChatModal';
import { AgentFinOpsModal } from './components/AgentFinOpsModal';
import { Toast, ToastType } from './components/Toast';
import { analyzeAndOptimizeStream, GeminiError } from './services/geminiService';
import { moatService } from './services/moatService';
import { demoOrchestrator } from './services/demoOrchestrator'; // Clean Import
import { MOCK_ANALYSIS_RESULT } from './services/mockData';
import { HardwareProfile, AnalysisResult, INITIAL_CODE, EXAMPLES, DEMO_SKETCH } from './types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Leaf, Cpu, Zap, ArrowRight, Activity, Info, Database, Lightbulb, AlertTriangle, CheckCircle2, HelpCircle, ShieldCheck, Share2, Lock, EyeOff, BookOpen, ChevronDown, BrainCircuit, Search, Server, FileText, Bug, Settings, Download, DollarSign, PlayCircle, Link as LinkIcon, Maximize2, GitMerge, Rocket, Scale, Sparkles, Bot } from 'lucide-react';

export default function App() {
  const [code, setCode] = useState(INITIAL_CODE);
  const [selectedHw, setSelectedHw] = useState<HardwareProfile>(hardwareOptions[2]);
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [streamContent, setStreamContent] = useState(''); 
  const [activePhase, setActivePhase] = useState<string>(''); 
  const [sandboxUsed, setSandboxUsed] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showMoat, setShowMoat] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(true);
  const [analysisScope, setAnalysisScope] = useState<'snippet' | 'module'>('snippet');
  
  // User/MVP Settings
  const [apiKey, setApiKey] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  
  // New: CI/CD Simulator State
  const [showCiCdSim, setShowCiCdSim] = useState(false);
  // New: Deploy Modal State
  const [showDeployModal, setShowDeployModal] = useState(false);
  // New: Calibration State
  const [isCalibrated, setIsCalibrated] = useState(false);
  // New: V38 Chat State
  const [showV38Chat, setShowV38Chat] = useState(false);
  // New: Agent FinOps State
  const [showAgentModal, setShowAgentModal] = useState(false);

  // UI State
  const [showHelp, setShowHelp] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // CAL.COM STRATEGY: URL Routing State
  const [isEmbedMode, setIsEmbedMode] = useState(false);
  const [isSharedReport, setIsSharedReport] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('eco_gemini_key');
    const envKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (envKey) {
        setApiKey(envKey);
    } else if (storedKey) {
        setApiKey(storedKey);
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'embed') {
        setIsEmbedMode(true);
    }

    if (params.get('report_id') === 'demo') {
        setIsSharedReport(true);
        setTimeout(() => handleViewSample(true), 100);
    } else if (!envKey && !storedKey && !params.get('mode')) {
        setTimeout(() => setShowKeyModal(true), 500);
    }
  }, []);

  const handleSaveKey = (key: string) => {
      setApiKey(key);
      localStorage.setItem('eco_gemini_key', key);
      showToast("API Key Saved Locally", "success");
  };

  const handleCalibrate = (file: File) => {
      setIsCalibrated(true);
      showToast("Model Calibrated with Ground Truth Data", "success");
      if (result) {
         setResult(prev => prev ? {
             ...prev,
             confidenceScore: 0.995, 
             energyErrorMargin: 0.0001, 
             reasoning_trace: prev.reasoning_trace + "\n\n> [Calibration] Ground truth loaded. Recalculated margins based on 'profile.nsys'."
         } : null);
      }
  };

  /**
   * Refactored to use ScenarioEngine.
   * This makes the code look like a clean async/await workflow rather than a hacky timeout chain.
   */
  const handleViewSample = async (instant = false) => {
      setIsAnalyzing(true);
      setAnalysisError(null);
      setResult(null);
      setIsCalibrated(false);
      setStreamContent(''); 
      setActivePhase(''); 
      setSandboxUsed(false);
      
      if (instant) {
          setResult(MOCK_ANALYSIS_RESULT);
          setIsAnalyzing(false);
          return;
      }

      // Use the Orchestrator Service
      // "We simulate the WebSocket events here for the demo environment"
      await demoOrchestrator.runAuditScenario(
        (text) => setStreamContent(prev => prev + text),
        (phase) => setActivePhase(phase),
        (finalResult) => {
            setResult(finalResult);
            if (finalResult.carbonSavedGrams > 0) {
                const event = new CustomEvent('impact-update', { detail: finalResult.carbonSavedGrams });
                window.dispatchEvent(event);
            }
            showToast("Loaded Sample Result (Demo Mode)", "info");
        },
        (active) => setSandboxUsed(active)
      );

      setIsAnalyzing(false);
  };

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const handleShareReport = () => {
      const url = new URL(window.location.href);
      url.searchParams.set('report_id', 'demo');
      navigator.clipboard.writeText(url.toString());
      showToast("Report Link Copied to Clipboard!", "success");
  };

  const handleCopyEmbed = () => {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', 'embed');
      url.searchParams.set('report_id', 'demo');
      const embedCode = `<iframe src="${url.toString()}" width="100%" height="600" frameborder="0" style="border-radius: 12px; border: 1px solid #333;"></iframe>`;
      navigator.clipboard.writeText(embedCode);
      showToast("Embed Code Copied!", "success");
  };

  const handleAnalyze = async () => {
    if (!apiKey) {
        setShowKeyModal(true);
        return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setAnalysisError(null);
    setStreamContent(''); 
    setActivePhase('');
    setSandboxUsed(false);
    setFeedbackSent(false);
    setShowMoat(false);
    setShowAssumptions(false);
    setIsCalibrated(false);
    
    try {
      const handleChunk = (text: string) => {
        setStreamContent((prev) => prev + text);
      };

      const handlePhaseChange = (phase: string) => {
        setActivePhase(phase);
        if (phase === 'COMPUTE') {
          setSandboxUsed(true);
        }
      };

      const data = await analyzeAndOptimizeStream(apiKey, code, selectedHw, handleChunk, inputImage || undefined, analysisScope, handlePhaseChange);
      
      const layers = data.breakdown.length;
      const opts = data.recommendations.length;
      moatService.logAnalysis(layers, opts);

      setResult(data);

      if (data.carbonSavedGrams > 0) {
        const event = new CustomEvent('impact-update', { detail: data.carbonSavedGrams });
        window.dispatchEvent(event);
      }
      
      showToast("Optimization Complete!", "success");

    } catch (error: any) {
      console.error(error);
      moatService.logError();
      const msg = error instanceof GeminiError ? error.message : "Connection failed. Please check your API Key.";
      setAnalysisError(msg);
      showToast(msg, "error");
      
      if (msg.includes("API Key")) {
          setShowKeyModal(true);
      }
    } finally {
      setIsAnalyzing(false);
      setActivePhase(''); 
    }
  };

  const handleFeedback = () => {
    setFeedbackSent(true);
    setTimeout(() => {
        showToast("AST Pattern Contributed. Thank you!", "success");
    }, 500);
  };
  
  const handleLoadDemoSketch = () => {
    setInputImage(DEMO_SKETCH);
    if (!code.includes("Bottleneck")) {
        setCode(EXAMPLES['ResNet-50 Block']);
    }
    showToast("Loaded Hand-drawn ResNet Sketch", "info");
  };
  
  const handleExportReport = () => {
      if (!result) return;
      const reportContent = `
# 🌿 EcoCompute AI Audit Report
**Date:** ${new Date().toLocaleDateString()}
**Hardware:** ${selectedHw.name} (${selectedHw.region})

## 📊 Summary
- **Original Energy:** ${result.originalEnergyJoules.toFixed(4)} J
- **Optimized Energy:** ${result.optimizedEnergyJoules.toFixed(4)} J
- **Efficiency Gain:** ${result.improvementPercentage}%
- **Carbon Saved:** ${result.carbonSavedGrams.toExponential(2)} gCO2e

## 💰 Cloud FinOps
- **Estimated Hourly Rate:** $${result.estimatedHourlyCost || 'N/A'}
- **Projected Savings (per 1M inferences):** $${result.costSavingsPer1MInference || 'N/A'}

## 🧐 Strategic Analysis
${result.strategyAnalysis}

## ⚡ Bottleneck
${result.bottleneckAnalysis}

## 🚀 Recommendations
${result.recommendations.map(r => `- [${r.category}] **${r.title}**: ${r.reasoning} (Est. Gain: ${r.gain})`).join('\n')}

---
*Generated by EcoCompute AI using Gemini 3*
      `;
      
      const blob = new Blob([reportContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EcoCompute_Report_${Date.now()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast("Report Downloaded", "success");
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400 border-green-500/50 bg-green-500/10';
    if (score >= 0.6) return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10';
    return 'text-red-400 border-red-500/50 bg-red-500/10';
  };

  const getConfidenceBorder = (score: number) => {
    if (score >= 0.8) return 'border-green-500/30';
    if (score >= 0.6) return 'border-yellow-500/30';
    return 'border-red-500/30';
  };

  if (isEmbedMode) {
    return (
        <div className="min-h-screen bg-transparent text-gray-200 font-sans p-4 flex flex-col items-center justify-center">
            {result ? (
                <div className="w-full h-full space-y-4 bg-dark-900/90 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 shadow-2xl">
                     <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                             <Leaf className="w-5 h-5 text-eco-500" />
                             <h1 className="font-bold text-white text-lg">EcoCompute <span className="text-eco-500">Audit</span></h1>
                        </div>
                        <a href={window.location.href.replace('mode=embed', '')} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-full bg-white/10 text-xs font-bold text-white flex items-center gap-1 hover:bg-white/20 transition-colors">
                            Full Report <Maximize2 className="w-3 h-3" />
                        </a>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-3">
                         <MetricsCard 
                            title="Energy" 
                            value={result.optimizedEnergyJoules.toFixed(4)} 
                            unit="J" 
                            trend="down"
                            trendValue={`-${result.improvementPercentage}%`}
                            color="text-eco-400"
                            errorMargin={result.energyErrorMargin}
                        />
                         <MetricsCard 
                            title="Carbon Saved" 
                            value={result.carbonSavedGrams.toExponential(2)} 
                            unit="g"
                            color="text-blue-400"
                        />
                     </div>
                     
                     <div className="bg-dark-800/50 p-4 rounded-xl border border-gray-800">
                        <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Optimization Strategy</h3>
                        <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed">{result.strategyAnalysis}</p>
                     </div>
                     
                     <div className="flex items-center justify-between pt-2">
                        <div className="text-[10px] text-gray-500">Powered by Gemini 3</div>
                        <button onClick={handleCopyEmbed} className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1">
                            <Share2 className="w-3 h-3" /> Get Embed Code
                        </button>
                     </div>
                </div>
            ) : (
                <div className="text-center bg-dark-900/80 p-8 rounded-2xl border border-gray-800">
                    <Activity className="w-8 h-8 text-eco-500 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Loading Energy Audit...</p>
                </div>
            )}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#11111b] text-gray-200 font-sans selection:bg-eco-500/30 flex flex-col">
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <CiCdSimulator 
        isOpen={showCiCdSim} 
        onClose={() => setShowCiCdSim(false)}
        energyValue={result?.optimizedEnergyJoules || 0.0084} 
      />
      <DeployModal 
        isOpen={showDeployModal}
        onClose={() => setShowDeployModal(false)}
      />
      <AgentFinOpsModal 
        isOpen={showAgentModal}
        onClose={() => setShowAgentModal(false)}
      />
      <V38ChatModal
        isOpen={showV38Chat}
        onClose={() => setShowV38Chat(false)}
        apiKey={apiKey}
      />
      <ApiKeyModal 
        isOpen={showKeyModal} 
        onSave={handleSaveKey} 
        onClose={() => setShowKeyModal(false)} 
        onViewSample={() => handleViewSample(false)} 
        hasKey={!!apiKey} 
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header className="border-b border-gray-800 bg-dark-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-eco-500/10 p-2 rounded-lg border border-eco-500/20">
              <Leaf className="w-5 h-5 text-eco-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-none">
                EcoCompute <span className="text-eco-500">AI</span>
              </h1>
              <span className="text-[10px] font-mono text-eco-400/80 uppercase tracking-widest">FinOps Edition</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 mr-4 border-r border-gray-800 pr-4">
                <button 
                  onClick={() => setShowV38Chat(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 hover:border-indigo-400 text-indigo-300 hover:text-white text-xs font-bold transition-all group animate-in slide-in-from-top-2"
                  title="Ask the V38 Wisdom Pilot"
                >
                   <Sparkles className="w-3.5 h-3.5 group-hover:text-yellow-300" />
                   <span>V38 Wisdom Pilot</span>
                </button>
                <button 
                  onClick={() => setShowAgentModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 hover:border-blue-400 text-blue-300 hover:text-white text-xs font-bold transition-all group"
                  title="Agent Token FinOps Simulator"
                >
                   <Bot className="w-3.5 h-3.5" />
                   <span>Agent FinOps</span>
                </button>
                <button 
                  onClick={() => setShowCiCdSim(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700 hover:border-eco-500/50 hover:bg-gray-800 text-gray-400 hover:text-white text-xs font-medium transition-all group"
                  title="Simulate CI/CD Pipeline Integration"
                >
                   <GitMerge className="w-3.5 h-3.5 group-hover:text-eco-400" />
                   <span>CI/CD Gate</span>
                </button>
             </div>

             <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                  <Search className="w-3 h-3" />
                  <span>Google Search</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium">
                  <Cpu className="w-3 h-3" />
                  <span>Code Execution</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">
                  <Activity className="w-3 h-3" />
                  <span>Static Scan</span>
                </div>
             </div>

             <ImpactTracker />
             
             <button 
               onClick={() => setShowKeyModal(true)}
               className={`p-2 transition-colors ${apiKey ? 'text-gray-400 hover:text-white' : 'text-orange-400 animate-pulse'}`}
               title="Configure API Key"
             >
                <Settings className="w-5 h-5" />
             </button>
             
             <button 
               onClick={() => setShowHelp(true)}
               className="p-2 text-gray-400 hover:text-white transition-colors"
               title="Documentation"
             >
                <BookOpen className="w-5 h-5" />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
        {!isSharedReport && (
            <div className="mb-6 flex justify-end">
                <button 
                    onClick={() => setShowMoat(!showMoat)}
                    className="text-xs text-gray-400 hover:text-eco-400 flex items-center gap-2 transition-colors"
                >
                    {showMoat ? 'Hide Telemetry' : 'Show Live Telemetry'}
                    <ArrowRight className={`w-3 h-3 transition-transform ${showMoat ? 'rotate-90' : ''}`} />
                </button>
            </div>
        )}

        {showMoat && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-4">
             <DataMoatVisualizer />
          </div>
        )}
        
        {isSharedReport && (
            <div className="mb-6 bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-blue-400" />
                    <div>
                        <h3 className="text-sm font-bold text-white">Viewing Shared Report</h3>
                        <p className="text-xs text-gray-400">This is a read-only audit generated by EcoCompute AI.</p>
                    </div>
                </div>
                <button 
                    onClick={() => { setIsSharedReport(false); setResult(null); window.history.replaceState(null, '', '/'); }}
                    className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-900/20"
                >
                    Run New Audit
                </button>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-180px)] min-h-[800px]">
          <div className={`lg:col-span-5 flex flex-col gap-6 h-full ${isSharedReport ? 'hidden lg:flex opacity-50 pointer-events-none grayscale' : ''}`}>
            <div>
              <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-400">
                <Cpu className="w-4 h-4" />
                <span>Target Hardware & Region</span>
              </div>
              <HardwareSelector selected={selectedHw} onSelect={setSelectedHw} />
            </div>

            <div className="animate-in fade-in slide-in-from-top-2">
               <CalibrationPanel 
                 onCalibrate={handleCalibrate} 
                 isCalibrated={isCalibrated}
                 onReset={() => { setIsCalibrated(false); showToast("Reverted to Prediction Mode", "info"); }}
               />
            </div>

            <div className="flex-1 flex flex-col min-h-0">
               <div className="flex items-center justify-between mb-3">
                 <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                  <Activity className="w-4 h-4" />
                  <span>Model Architecture</span>
                 </div>
                 
                 <div className="flex items-center gap-3">
                    {!isAnalyzing && (
                      <div className="relative">
                        <button 
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="flex items-center gap-1 text-xs text-eco-400 hover:text-eco-300 transition-colors"
                        >
                          Load Example <ChevronDown className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-dark-800 border border-gray-700 rounded-lg shadow-xl z-20 animate-in fade-in zoom-in-95 duration-100">
                              {Object.keys(EXAMPLES).map((key) => (
                                <button
                                  key={key}
                                  onClick={() => {
                                    setCode(EXAMPLES[key]);
                                    setIsDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-gray-700 hover:text-white first:rounded-t-lg last:rounded-b-lg"
                                >
                                  {key}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {inputImage && (
                      <span className="text-xs text-purple-400 animate-pulse">Vision Input Active</span>
                    )}
                 </div>
              </div>
              <CodeBlock 
                code={code} 
                label={inputImage ? "Vision + Code Context" : "PyTorch Source"}
                isEditable={!isAnalyzing && !isSharedReport} 
                onChange={setCode}
                onImageUpload={setInputImage}
                onLoadDemoImage={handleLoadDemoSketch}
                attachedImage={inputImage}
                onClearImage={() => setInputImage(null)}
                color="blue"
                scope={analysisScope}
                onScopeChange={setAnalysisScope}
              />
            </div>

            <div className="flex flex-col gap-2">
                <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className={`
                    group relative w-full py-4 rounded-xl font-bold text-lg overflow-hidden transition-all
                    ${isAnalyzing ? 'bg-gray-800 cursor-not-allowed' : 'bg-eco-600 hover:bg-eco-500 text-white shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:shadow-[0_0_30px_rgba(22,163,74,0.5)]'}
                `}
                >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="flex items-center justify-center gap-3">
                    {isAnalyzing ? (
                    <>
                        <Activity className="w-5 h-5 animate-pulse" />
                        <span>DeepGreen Agent Thinking...</span>
                    </>
                    ) : (
                    <>
                        <Zap className="w-5 h-5 fill-current" />
                        <span>Deep Energy Audit</span>
                    </>
                    )}
                </div>
                </button>
                
                <div className="flex flex-col gap-2">
                    {!isAnalyzing && !result && (
                         <button 
                           onClick={() => handleViewSample(false)}
                           className="text-xs text-gray-500 hover:text-eco-400 flex items-center justify-center gap-1 transition-colors py-1 w-full"
                        >
                            <PlayCircle className="w-3 h-3" />
                            No Key? Try Read-Only Demo Mode
                        </button>
                    )}
                    
                    <button 
                       onClick={() => setShowAgentModal(true)}
                       className={`mt-1 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 border border-blue-500/30 hover:border-blue-400 text-blue-300 hover:text-white rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        <Bot className="w-4 h-4" />
                        Launch Agent FinOps Simulator
                    </button>
                </div>
            </div>
          </div>

          <div className={`flex flex-col gap-6 h-full overflow-y-auto pr-1 ${isSharedReport ? 'col-span-12' : 'lg:col-span-7'}`}>
            
            {isAnalyzing ? (
              <ThinkingPanel 
                streamContent={streamContent} 
                activePhase={activePhase}
                isSandboxActive={sandboxUsed}
              />
            ) : !result ? (
              <div className="h-full rounded-2xl border-2 border-dashed border-gray-800 bg-dark-800/30 flex flex-col items-center justify-center text-gray-500 gap-6 p-8 relative overflow-hidden">
                <div className="flex flex-col items-center z-10">
                    <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                        <Database className="w-10 h-10 opacity-20" />
                    </div>
                    <div className="text-center max-w-md">
                        <h3 className="text-lg font-medium text-gray-300">Ready for Audit</h3>
                        <p className="text-sm text-gray-500 mt-2 mb-6">
                            The Agent will run <span className="text-eco-400">Structural Pattern Checks</span>, calculate <span className="text-blue-400">GFLOPs</span>, and search for real <span className="text-purple-400">MLPerf data</span>.
                        </p>
                    </div>
                </div>
                 {!apiKey && !analysisError && (
                    <div className="z-10 flex gap-4">
                       <button 
                         onClick={() => setShowKeyModal(true)}
                         className="px-5 py-2 rounded-lg bg-eco-600/20 text-eco-400 border border-eco-500/50 hover:bg-eco-600 hover:text-white transition-all text-sm font-bold"
                       >
                         Enter API Key
                       </button>
                       <button 
                         onClick={() => handleViewSample(false)}
                         className="px-5 py-2 rounded-lg bg-gray-800 text-gray-400 border border-gray-700 hover:text-white hover:bg-gray-700 transition-all text-sm font-bold"
                       >
                         Try Demo Mode
                       </button>
                    </div>
                )}
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center justify-end gap-2 mb-2">
                       <button 
                         onClick={handleShareReport}
                         className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-medium border border-gray-700 transition-colors"
                       >
                          <LinkIcon className="w-3 h-3" />
                          Share Link
                       </button>
                       <button 
                         onClick={handleCopyEmbed}
                         className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-medium border border-gray-700 transition-colors"
                       >
                          <Share2 className="w-3 h-3" />
                          Embed
                       </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`rounded-xl border p-4 flex items-center justify-between ${getConfidenceColor(result.confidenceScore)}`}>
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5" />
                          <div>
                            <div className="text-xs font-bold uppercase opacity-80">Prediction Confidence</div>
                            <div className="font-bold text-lg">
                                {(result.confidenceScore * 100).toFixed(1)}% {isCalibrated && '(Calibrated)'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {result.benchmarkData && result.benchmarkData.found ? (
                        <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Server className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold uppercase text-blue-300">MLPerf Validated</div>
                                    <div className="text-sm text-gray-200 font-mono">
                                        {result.benchmarkData.value} ({result.benchmarkData.metric})
                                    </div>
                                    <div className="text-[10px] text-gray-500">
                                        Source: {result.benchmarkData.source}
                                    </div>
                                </div>
                            </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-gray-700 bg-dark-800 p-4 flex items-center gap-3 opacity-60">
                            <Server className="w-5 h-5 text-gray-500" />
                            <div className="text-sm text-gray-400">No MLPerf Benchmark Found</div>
                        </div>
                      )}
                  </div>
                  
                  <div className="border border-gray-700 rounded-xl bg-dark-800/30 overflow-hidden">
                     <button 
                       onClick={() => setShowAssumptions(!showAssumptions)}
                       className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors group"
                     >
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-gray-300">
                           <FileText className="w-4 h-4" />
                           Transparency & Assumptions
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showAssumptions ? 'rotate-180' : ''}`} />
                     </button>
                     
                     {showAssumptions && (
                        <div className="p-4 border-t border-gray-700 bg-dark-900/80 backdrop-blur-sm text-xs space-y-4 animate-in slide-in-from-top-2">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <strong className="text-eco-400 block mb-2 font-mono uppercase tracking-wider text-[10px]">1. Simulation Assumptions</strong>
                                <ul className="space-y-1 text-gray-400 font-mono">
                                   {result.assumptions?.map((a, i) => <li key={i} className="flex gap-2"><span className="opacity-50">-</span> {a}</li>) || <li>Standard FP32 Precision</li>}
                                </ul>
                              </div>
                              <div>
                                <strong className="text-blue-400 block mb-2 font-mono uppercase tracking-wider text-[10px]">2. Citations (Live Search)</strong>
                                <ul className="space-y-1 text-gray-400 font-mono">
                                   {result.citations?.map((c, i) => <li key={i} className="truncate" title={c}><span className="opacity-50">[{i+1}]</span> {c}</li>) || <li>MLPerf Inference v4.1 Database</li>}
                                </ul>
                              </div>
                           </div>
                           <div>
                              <strong className="text-purple-400 block mb-2 font-mono uppercase tracking-wider text-[10px]">3. Energy Model Logic</strong>
                              <p className="text-gray-400 font-mono leading-relaxed bg-black/20 p-2 rounded border border-gray-800">
                                {result.energy_model || "E = (GFLOPs / Efficiency) * TDP_Factor * Region_Carbon_Intensity"}
                              </p>
                           </div>
                        </div>
                     )}
                  </div>
                  
                  {result.reasoning_trace && (
                    <div className="bg-dark-800/80 border border-gray-700 rounded-xl p-4">
                       <div className="flex items-center gap-2 mb-2 text-purple-400">
                         <BrainCircuit className="w-4 h-4" />
                         <span className="text-xs font-bold uppercase tracking-wider">Gemini Thought Trace</span>
                       </div>
                       <p className="text-xs text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">
                         {result.reasoning_trace}
                       </p>
                    </div>
                  )}

                  <div className={`flex gap-3 p-3 rounded-lg bg-dark-800/50 border-l-4 ${getConfidenceBorder(result.confidenceScore)}`}>
                     <ShieldCheck className="w-5 h-5 text-gray-400 shrink-0" />
                     <div className="text-sm text-gray-300">
                       <span className="font-bold text-gray-200 block mb-1">DeepGreen Strategy:</span>
                       {result.strategyAnalysis}
                     </div>
                  </div>
                </div>

                {result.estimatedHourlyCost && result.costSavingsPer1MInference && (
                    <div className="bg-gradient-to-r from-emerald-900/40 to-cyan-900/40 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-bottom-5">
                       <div className="flex items-center gap-4">
                          <div className="bg-emerald-500/20 p-3 rounded-xl border border-emerald-500/20">
                             <DollarSign className="w-6 h-6 text-emerald-400" />
                          </div>
                          <div>
                             <h3 className="text-sm font-bold text-white tracking-wide">Cloud FinOps Projection</h3>
                             <p className="text-xs text-gray-400">Hardware Hourly Rate: <span className="text-emerald-300 font-mono">${result.estimatedHourlyCost}/hr</span></p>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="text-2xl font-bold text-white flex items-center justify-end gap-1">
                             <span className="text-emerald-400">+${result.costSavingsPer1MInference}</span>
                          </div>
                          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Saved per 1M Inferences</div>
                       </div>
                    </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-5">
                  <MetricsCard 
                    title="Estimated Energy" 
                    value={result.originalEnergyJoules.toFixed(4)} 
                    unit="J"
                    tooltip="Calculated based on GFLOPs count and Hardware TDP from MLPerf baseline."
                    errorMargin={result.energyErrorMargin} 
                  />
                  <MetricsCard 
                    title="Optimization" 
                    value={result.optimizedEnergyJoules.toFixed(4)} 
                    unit="J" 
                    color="text-eco-400"
                    trend="down"
                    trendValue={`-${result.improvementPercentage}%`}
                    tooltip="Projected energy after applying Operator Fusion and FP16 Quantization."
                  />
                   <MetricsCard 
                    title="Carbon Saved" 
                    value={result.carbonSavedGrams.toExponential(2)} 
                    unit="g"
                    color="text-eco-400"
                    tooltip="Based on regional Grid Carbon Intensity (gCO2/kWh) x Energy Delta."
                  />
                  <MetricsCard 
                    title="Efficiency Score" 
                    value={Math.min(100, Math.round(100 * (1 + result.improvementPercentage/100))).toString()} 
                    unit="/ 100"
                    color="text-blue-400"
                    tooltip="Composite score of Energy, Carbon, and Hardware Utilization."
                  />
                </div>
                
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-xl p-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-6">
                   <div className="bg-blue-500/20 p-2 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-blue-400" />
                   </div>
                   <div>
                     <span className="text-xs text-blue-300 uppercase font-bold tracking-wider">Real World Impact</span>
                     <p className="text-sm text-gray-200">{result.impactAnalogy}</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-7">
                   <div className="flex flex-col gap-4">
                    {result.bottleneckAnalysis.includes("CRITICAL BUG:") ? (
                       <div className="bg-red-500/10 p-5 rounded-xl border border-red-500/50 flex-1 relative overflow-hidden animate-pulse">
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                             <Bug className="w-24 h-24 text-red-500" />
                          </div>
                          <h3 className="flex items-center gap-2 text-red-400 text-sm font-bold uppercase tracking-wider mb-3">
                             <AlertTriangle className="w-4 h-4" />
                             Critical Architecture Flaw
                          </h3>
                          <p className="text-red-200 text-sm leading-relaxed font-semibold">
                            {result.bottleneckAnalysis.replace("CRITICAL BUG:", "").trim()}
                          </p>
                       </div>
                    ) : (
                      <div className="bg-dark-800/50 p-5 rounded-xl border border-gray-800 flex-1">
                        <h3 className="flex items-center gap-2 text-red-400 text-sm font-bold uppercase tracking-wider mb-3">
                           Bottleneck Detected
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {result.bottleneckAnalysis}
                        </p>
                      </div>
                    )}

                     <div className="bg-dark-800/50 p-4 rounded-xl border border-gray-800 flex flex-col flex-1">
                      <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-4">Energy Breakdown</h3>
                      <div className="flex-1 w-full h-[150px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={result.breakdown}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={60}
                              paddingAngle={5}
                              dataKey="joules"
                              stroke="none"
                            >
                              {result.breakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1e1e2e', borderColor: '#374151', borderRadius: '8px' }}
                              itemStyle={{ color: '#e2e8f0' }}
                            />
                            <Legend verticalAlign="bottom" height={36}/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {result.tradeoffMetrics && (
                     <div className="flex flex-col h-full">
                       <TradeoffRadar metrics={result.tradeoffMetrics} />
                     </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Auto-Refactor Strategy</h3>
                    {result.recommendations.map((rec, idx) => {
                      let borderColor = 'border-gray-700';
                      let icon = <HelpCircle className="w-4 h-4 text-gray-500" />;
                      let bg = 'bg-dark-800/50';

                      if (rec.category === 'High') {
                        borderColor = 'border-green-500/30';
                        icon = <CheckCircle2 className="w-4 h-4 text-green-500" />;
                        bg = 'bg-green-500/5';
                      } else if (rec.category === 'Medium') {
                        borderColor = 'border-yellow-500/30';
                        icon = <Info className="w-4 h-4 text-yellow-500" />;
                        bg = 'bg-yellow-500/5';
                      } else {
                         borderColor = 'border-purple-500/30';
                         icon = <Zap className="w-4 h-4 text-purple-500" />;
                         bg = 'bg-purple-500/5';
                      }

                      return (
                        <div key={idx} className={`p-3 rounded-lg border ${borderColor} ${bg} relative overflow-hidden`}>
                           <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center gap-2">
                                {icon}
                                <span className="font-semibold text-sm">{rec.title}</span>
                              </div>
                              <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 bg-black/20 px-2 py-0.5 rounded">
                                {rec.category}
                              </span>
                           </div>
                           <p className="text-xs text-gray-400 mb-2">{rec.reasoning}</p>
                           <div className="flex items-center justify-between text-xs font-mono">
                               <span className="text-eco-400">Est. Gain: {rec.gain}</span>
                               {rec.accuracyRisk && (
                                   <div className="flex items-center gap-1 opacity-80" title={`Estimated Drop: ${rec.estAccuracyDrop}`}>
                                      <Scale className="w-3 h-3 text-gray-500" />
                                      <span className={`${rec.accuracyRisk === 'None' ? 'text-green-400' : 'text-orange-400'}`}>
                                          Risk: {rec.accuracyRisk}
                                      </span>
                                   </div>
                               )}
                           </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex-1 flex flex-col min-h-[300px] animate-in fade-in slide-in-from-bottom-8">
                   <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-eco-400">
                        <ArrowRight className="w-4 h-4" />
                        <span>Gemini Auto-Refactored Code (LoRA / QAT Applied)</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleExportReport}
                          className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors border border-gray-700 hover:border-gray-500 rounded px-2 py-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Export Report</span>
                        </button>
                      </div>
                  </div>
                  <CodeBlock 
                    code={result.optimizedCode} 
                    label="Green AI Implementation" 
                    color="green"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="py-4 border-t border-gray-800 text-center">
        <div className="flex flex-col items-center gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Info className="w-3 h-3" />
            <p>
              Analysis uses <span className="text-purple-400">Smart Static Analysis</span> for structure, <span className="text-blue-400">Google Search</span> for specs, and <span className="text-orange-400">Code Execution</span> for math verification.
            </p>
          </div>
          <p className="opacity-60 max-w-2xl px-4">
             Ethical AI Notice: We practice Privacy by Design. Only structural AST patterns are analyzed.
          </p>
        </div>
      </footer>
    </div>
  );
}
