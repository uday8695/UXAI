
import React, { useState, useEffect } from 'react';
import { Search, BarChart3, PieChart, Lightbulb, FileText, Upload, Globe, Play, CheckCircle2, Loader2, Download, LogOut, User as UserIcon, ShieldCheck, AlertCircle, Layers, TestTube2, Split, Database, Activity, RefreshCw, Zap, ExternalLink } from 'lucide-react';
import { AnalysisStep, BehaviorMetrics, UXAnalysisResponse, User } from './types';
import { performUXAnalysis } from './services/geminiService';
import MetricsDashboard from './components/MetricsDashboard';
import AgentCard from './components/AgentCard';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('uxsenseai_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLogin, setIsLogin] = useState(true);
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });

  const [step, setStep] = useState<AnalysisStep>(AnalysisStep.INPUT);
  const [url, setUrl] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<BehaviorMetrics>({
    ctr: 2.1,
    bounceRate: 42,
    sessionDuration: 95,
    scrollDepth: 55,
    pageViews: 12500,
    crawlingDepth: 0,
    ga4PropertyId: ''
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [result, setResult] = useState<UXAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('uxsenseai_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('uxsenseai_user');
    }
  }, [user]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({ email: authForm.email, name: authForm.name || authForm.email.split('@')[0].toUpperCase() });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setScreenshot(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const retrieveAutomatedData = async () => {
    if (!url) {
      setError("Provide a URL to initiate automated retrieval.");
      return;
    }
    setIsRetrieving(true);
    // Simulate API retrieval from GA4 and Crawler benchmarks
    await new Promise(r => setTimeout(r, 2000));
    setMetrics({
      ...metrics,
      ctr: parseFloat((Math.random() * 4 + 1).toFixed(2)),
      bounceRate: parseFloat((Math.random() * 30 + 30).toFixed(2)),
      sessionDuration: Math.floor(Math.random() * 200 + 60),
      scrollDepth: Math.floor(Math.random() * 40 + 40),
      pageViews: Math.floor(Math.random() * 50000 + 5000),
      isAutoRetrieved: true
    });
    setIsRetrieving(false);
  };

  const runAnalysis = async () => {
    if (!url) {
      setError("Please provide a valid URL");
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await performUXAnalysis(url, screenshot, metrics);
      setResult(data);
      setStep(AnalysisStep.ANALYSIS);
    } catch (err: any) {
      setError(err.message || "An error occurred during multi-agent analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadReport = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify({ metrics, analysis: result }, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `uxsenseai-report-${url.replace(/[^a-z0-9]/gi, '_')}.json`;
    link.click();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden p-8 border border-slate-700">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/20">
              <BarChart3 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">UXSenseAI</h1>
            <p className="text-slate-500 mt-1">AI-Powered Behavioral Optimization</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <input type="text" placeholder="Full Name" className="w-full px-4 py-2.5 rounded-xl border border-slate-200" value={authForm.name} onChange={(e) => setAuthForm({...authForm, name: e.target.value})} />
            )}
            <input type="email" placeholder="Business Email" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200" value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} />
            <input type="password" placeholder="Password" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200" value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} />
            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition">
              {isLogin ? 'Sign In to Analytics' : 'Start Free Audit'}
            </button>
          </form>
          <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4 text-indigo-600 text-sm font-bold">
            {isLogin ? "New user? Create an account" : "Existing user? Login"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 hidden sm:block tracking-tight">UXSENSE<span className="text-indigo-600">AI</span></span>
          </div>
          <nav className="hidden md:flex items-center space-x-1">
            {[
              { id: AnalysisStep.INPUT, label: 'Setup', icon: Globe },
              { id: AnalysisStep.ANALYSIS, label: 'Behavior', icon: PieChart },
              { id: AnalysisStep.INSIGHTS, label: 'Agents', icon: ShieldCheck },
              { id: AnalysisStep.RECOMMENDATIONS, label: 'Solutions', icon: Lightbulb },
              { id: AnalysisStep.REPORT, label: 'Audit', icon: FileText },
            ].map((navItem) => (
              <button
                key={navItem.id}
                disabled={!result && navItem.id !== AnalysisStep.INPUT}
                onClick={() => setStep(navItem.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition text-sm font-bold ${
                  step === navItem.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-600'
                }`}
              >
                <navItem.icon className="w-4 h-4" />
                <span>{navItem.label}</span>
              </button>
            ))}
          </nav>
          <button onClick={() => setUser(null)} className="p-2 text-slate-400 hover:text-rose-500 transition"><LogOut className="w-5 h-5" /></button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8">
        {isAnalyzing && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex flex-col items-center justify-center text-white">
            <div className="bg-white p-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm text-center">
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-4" />
              <h3 className="text-2xl font-black text-slate-900 mb-2">Multi-Agent Swarm</h3>
              <p className="text-slate-500 text-sm">Orchestrating crawler and analysis agents...</p>
            </div>
          </div>
        )}

        {step === AnalysisStep.INPUT && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-800">
                   <Globe className="text-indigo-600 w-8 h-8" /> Target Configuration
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-tight">Website URL</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
                      <input 
                        type="url"
                        placeholder="https://your-platform.com"
                        className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all font-medium text-lg"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-tight">Crawl Scope</label>
                      <div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-100 flex items-center gap-4">
                        <Layers className="text-indigo-600 w-6 h-6" />
                        <select 
                          className="bg-transparent w-full font-bold text-slate-800 focus:outline-none"
                          value={metrics.crawlingDepth}
                          onChange={(e) => setMetrics({...metrics, crawlingDepth: Number(e.target.value)})}
                        >
                          <option value={0}>Main Entry Only</option>
                          <option value={1}>Core Funnels (Depth 1)</option>
                          <option value={2}>Full Map (Depth 2)</option>
                        </select>
                      </div>
                    </div>
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-indigo-400 transition relative flex flex-col justify-center bg-slate-50/30">
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleFileUpload} />
                      {screenshot ? <p className="text-indigo-600 font-black">Visual Loaded ✓</p> : <p className="text-sm font-black text-slate-600 uppercase tracking-tight">Upload UI Context</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <h2 className="text-2xl font-black flex items-center gap-3 text-slate-800">
                    <Database className="text-indigo-600 w-8 h-8" /> Data Connectivity
                  </h2>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase border border-emerald-100">Live API Ready</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 border-2 border-slate-100 p-6 rounded-2xl">
                      <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                        <Activity className="w-4 h-4 text-indigo-500" /> GA4 Connection
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="GA4 Property ID (e.g. 12345678)"
                          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={metrics.ga4PropertyId}
                          onChange={(e) => setMetrics({...metrics, ga4PropertyId: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="bg-indigo-600 text-white p-6 rounded-2xl flex flex-col justify-center">
                       <h3 className="text-lg font-black mb-1 flex items-center gap-2 uppercase tracking-tight">
                          <Zap className="w-5 h-5 fill-white" /> Automated Retrieval
                       </h3>
                       <p className="text-xs text-indigo-100 mb-4 opacity-80">Sync metrics from GA4 and simulate crawler benchmarks.</p>
                       <button 
                        onClick={retrieveAutomatedData}
                        disabled={isRetrieving || !url}
                        className="bg-white text-indigo-600 font-black py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
                       >
                         {isRetrieving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                         {metrics.isAutoRetrieved ? 'Refresh Metrics' : 'Connect & Retrieve'}
                       </button>
                    </div>
                  </div>

                  {metrics.isAutoRetrieved && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 bg-emerald-50 p-6 rounded-2xl border border-emerald-100 animate-in fade-in slide-in-from-top-4">
                      {Object.entries(metrics).filter(([k]) => ['ctr', 'bounceRate', 'sessionDuration', 'scrollDepth', 'pageViews'].includes(k)).map(([key, val]) => (
                        <div key={key}>
                          <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">{key.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="text-lg font-black text-emerald-900">{val}{key === 'sessionDuration' ? 's' : key === 'pageViews' ? '' : '%'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                 <h2 className="text-3xl font-black mb-6 leading-tight">Audit Interface</h2>
                 <p className="text-slate-400 mb-10 leading-relaxed font-medium">Neural Crawler will now discover sub-pages and performance bottlenecks automatically.</p>
                 <button 
                  onClick={runAnalysis}
                  disabled={isAnalyzing || !url}
                  className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl flex items-center justify-center space-x-3 hover:bg-indigo-500 transition shadow-xl"
                 >
                   <Play className="w-6 h-6 fill-white" />
                   <span className="text-lg uppercase tracking-tight">Run Full Swarm</span>
                 </button>
              </div>
            </div>
          </div>
        )}

        {result && step === AnalysisStep.ANALYSIS && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
             <div className="flex flex-col md:flex-row items-center justify-between">
                <div>
                   <h2 className="text-3xl font-black text-slate-900">Analysis Dashboard</h2>
                   <p className="text-slate-500">Retrieval method: {metrics.isAutoRetrieved ? 'Hybrid Auto-Crawl' : 'Manual Setup'}</p>
                </div>
                <div className="bg-white border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-3xl flex items-center gap-6 shadow-sm">
                   <span className="text-5xl font-black">{result.overallScore}</span>
                </div>
             </div>
             
             <MetricsDashboard metrics={metrics} />

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                   <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                     <h3 className="text-xl font-black mb-6 flex items-center gap-3"><Globe className="w-6 h-6 text-indigo-600" /> Structure & Discovered Paths</h3>
                     <p className="text-slate-600 leading-relaxed font-medium italic">"{result.structuralAnalysis}"</p>
                     {result.groundingLinks && result.groundingLinks.length > 0 && (
                       <div className="mt-6 pt-6 border-t border-slate-100">
                          <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Crawler Sources</p>
                          <div className="flex flex-wrap gap-2">
                             {result.groundingLinks.map((link, i) => (
                               <a key={i} href={link} target="_blank" className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition">
                                  <ExternalLink className="w-3 h-3" /> {new URL(link).hostname}
                               </a>
                             ))}
                          </div>
                       </div>
                     )}
                   </div>
                </div>
                <div className="bg-indigo-600 text-white rounded-3xl p-8 shadow-xl">
                   <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight">Behavioral Audit</h3>
                   <div className="space-y-6 italic text-md leading-relaxed font-medium opacity-90 border-l-2 border-indigo-400 pl-6">
                      {result.behavioralAnalysis}
                   </div>
                </div>
             </div>
          </div>
        )}
        
        {result && step === AnalysisStep.INSIGHTS && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in zoom-in-95 duration-500">
            <AgentCard type="diagnostic" agent={result.diagnosticAgent} />
            <AgentCard type="validation" agent={result.validationAgent} />
          </div>
        )}

        {result && step === AnalysisStep.RECOMMENDATIONS && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AgentCard type="solution" agent={result.solutionAgent} />
              <AgentCard type="technical" agent={result.technicalAgent} />
            </div>
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
              <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><Split className="text-indigo-600 w-8 h-8" /> Validation Experiments</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {result.abTests.map((test, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden group hover:border-indigo-400 transition-colors">
                    <div className="p-5 border-b border-slate-200 bg-white flex items-center justify-between">
                      <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">Scenario #{idx + 1}</h4>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-tighter">
                        <TestTube2 className="w-3 h-3" /> Track: {test.metricToTrack}
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <p className="text-sm font-bold text-slate-700 leading-tight">Objective: {test.recommendation}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white border border-slate-200 rounded-xl">
                          <span className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Control</span>
                          <p className="text-xs font-semibold text-slate-600">{test.variantA}</p>
                        </div>
                        <div className="p-4 bg-indigo-600 border border-indigo-700 rounded-xl shadow-md">
                          <span className="block text-[10px] font-black text-indigo-300 mb-2 uppercase tracking-widest text-right">Variant</span>
                          <p className="text-xs font-bold text-white text-right">{test.variantB}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {result && step === AnalysisStep.REPORT && (
          <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-top-8 duration-700">
            <div className="bg-white rounded-[40px] shadow-2xl border border-slate-200 p-12 print:shadow-none print:border-none print:p-0">
              <div className="flex flex-col sm:flex-row justify-between items-start border-b-4 border-slate-100 pb-10 mb-10">
                <div className="mb-6 sm:mb-0">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-slate-900 rounded-lg"><BarChart3 className="text-white w-5 h-5" /></div>
                    <span className="font-black tracking-tighter text-slate-900 uppercase">UXSENSE<span className="text-indigo-600">AI</span></span>
                  </div>
                  <h1 className="text-5xl font-black text-slate-900 mb-3 tracking-tighter">Strategic Audit</h1>
                  <p className="text-slate-500 font-bold flex items-center gap-2 uppercase text-xs tracking-widest"><Globe className="w-3 h-3" /> Endpoint: {url}</p>
                </div>
                <div className="text-right">
                   <div className="inline-flex flex-col items-center bg-indigo-50 p-6 rounded-[32px] border-2 border-indigo-100">
                      <div className="text-7xl font-black text-indigo-600 tracking-tighter">{result.overallScore}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mt-2">Efficiency Rating</div>
                   </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                 <div>
                    <h3 className="text-xs font-black uppercase text-slate-400 mb-4 tracking-widest">Core Friction</h3>
                    <p className="text-slate-700 text-lg leading-relaxed font-bold border-l-8 border-indigo-600 pl-6 bg-indigo-50/30 py-4 italic">"{result.diagnosticAgent.content[0]}"</p>
                 </div>
                 <div>
                    <h3 className="text-xs font-black uppercase text-slate-400 mb-4 tracking-widest">Executive Summary</h3>
                    <p className="text-slate-700 text-lg leading-relaxed font-bold border-l-8 border-emerald-500 pl-6 bg-emerald-50/30 py-4 italic">"{result.solutionAgent.content[0]}"</p>
                 </div>
              </div>
            </div>
            <div className="flex justify-center gap-6">
              <button onClick={downloadReport} className="bg-indigo-600 text-white px-10 py-5 rounded-3xl font-black shadow-2xl flex items-center gap-4 hover:scale-105 transition"><Download className="w-6 h-6" /> EXPORT FULL DATA</button>
              <button onClick={() => window.print()} className="bg-white text-slate-900 px-10 py-5 rounded-3xl font-black border-2 border-slate-200 flex items-center gap-4 hover:bg-slate-50 transition"><FileText className="w-6 h-6" /> PRINT SUMMARY</button>
            </div>
          </div>
        )}
      </main>
      <footer className="bg-white border-t border-slate-200 p-8 mt-16 flex justify-center text-slate-400 font-black uppercase text-[10px] tracking-widest">
         © 2024 UXSENSEAI LABS. NEURAL-FLASH INFRASTRUCTURE
      </footer>
    </div>
  );
};

export default App;
