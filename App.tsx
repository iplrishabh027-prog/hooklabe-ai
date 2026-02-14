
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateReelIdeasStream } from './services/gemini';
import { AppState, Niche, VideoTone, Language, Platform, GenerationConfig, HookStyle, ReelIdea } from './types';
import { ReelCard } from './components/ReelCard';

const NICHES: Niche[] = ['Business', 'Tech', 'Motivation', 'Humor', 'Lifestyle', 'Travel', 'Fitness', 'Generic', 'Story', 'Finance', 'Food', 'Education', 'Other'];
const TONES: VideoTone[] = ['Motivational', 'Educational', 'Shocking', 'Funny', 'Emotional', 'Relatable'];
const PLATFORMS: Platform[] = ['Instagram', 'TikTok', 'YouTube Shorts'];
const LANGUAGES: Language[] = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Hinglish'];
const DURATIONS = ['15s', '30s', '45s', '60s', 'Viral Length (Auto)'];
const HOOK_STYLES: HookStyle[] = ['Curious', 'Shocking', 'Emotional', 'Auto'];

const LOADING_MESSAGES = [
  "Analyzing viral patterns...",
  "Calibrating high-retention hooks...",
  "Engineering psychological triggers...",
  "Optimizing scroll-stopping power...",
  "Synthesizing creative blueprint...",
];

const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

const LogoIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
    <defs>
      <linearGradient id="viral-strat-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#00E5FF" />
        <stop offset="100%" stopColor="#E040FB" />
      </linearGradient>
    </defs>
    <rect width="36" height="36" rx="10" fill="url(#viral-strat-gradient)" />
    <path d="M11 11H15V17H21V11H25V25H21V20H15V25H11V11Z" fill="white" />
  </svg>
);

const AboutModal: React.FC<{ isOpen: boolean; onClose: () => void; isDark: boolean }> = ({ isOpen, onClose, isDark }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className={`relative w-full max-w-2xl p-8 md:p-12 rounded-[32px] shadow-2xl overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-300 ${isDark ? 'bg-[#12151B] border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-900'}`}>
        <button 
          onClick={onClose}
          className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'}`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <LogoIcon />
            <h2 className="text-2xl font-outfit font-bold tracking-tight">About Us</h2>
          </div>
          
          <div className={`space-y-6 text-base leading-relaxed ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>
            <p>
              HookLabe AI is a global creator-focused AI platform designed to help content creators generate high-retention short-form video scripts with ease.
            </p>
            <p>
              Our tool allows users to turn simple ideas into ready-to-record scripts optimized for platforms like Instagram Reels, TikTok, and YouTube Shorts. By combining strategy, pacing, and emotional hooks, we help creators save time and focus on creating impactful content.
            </p>
            <p>
              HookLabe AI is built for creators, entrepreneurs, and professionals who want faster results without complicated tools.
            </p>
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
              <p className={`font-bold italic ${isDark ? 'text-[#00E5FF]' : 'text-[#E040FB]'}`}>
                "We believe great content starts with a great idea — our AI helps you engineer it."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PrivacyModal: React.FC<{ isOpen: boolean; onClose: () => void; isDark: boolean }> = ({ isOpen, onClose, isDark }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className={`relative w-full max-w-2xl p-8 md:p-12 rounded-[32px] shadow-2xl overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-300 ${isDark ? 'bg-[#12151B] border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-900'}`}>
        <button 
          onClick={onClose}
          className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'}`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-outfit font-bold tracking-tight">Privacy Policy</h2>
          </div>
          
          <div className={`space-y-8 text-sm leading-relaxed ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>
            <p>
              Your privacy is important to us. This Privacy Policy explains how HookLabe AI collects, uses, and protects your information.
            </p>

            <div className="space-y-3">
              <h3 className={`font-bold uppercase tracking-widest text-xs ${isDark ? 'text-white' : 'text-black'}`}>Information We Collect</h3>
              <ul className="list-disc pl-5 space-y-1 marker:text-[#00E5FF]">
                <li>Basic usage data to improve tool performance</li>
                <li>Inputs provided by users for script generation</li>
                <li>We do not collect sensitive personal data</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className={`font-bold uppercase tracking-widest text-xs ${isDark ? 'text-white' : 'text-black'}`}>How We Use Information</h3>
              <ul className="list-disc pl-5 space-y-1 marker:text-[#00E5FF]">
                <li>To generate AI-powered scripts</li>
                <li>To improve product quality and user experience</li>
                <li>To maintain platform security and functionality</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className={`font-bold uppercase tracking-widest text-xs ${isDark ? 'text-white' : 'text-black'}`}>Data Protection</h3>
              <ul className="list-disc pl-5 space-y-1 marker:text-[#00E5FF]">
                <li>User inputs are not sold or shared with third parties</li>
                <li>We do not use user data for advertising purposes</li>
                <li>Reasonable security measures are in place to protect data</li>
              </ul>
            </div>

             <div className="space-y-3">
              <h3 className={`font-bold uppercase tracking-widest text-xs ${isDark ? 'text-white' : 'text-black'}`}>Third-Party Services</h3>
              <ul className="list-disc pl-5 space-y-1 marker:text-[#00E5FF]">
                <li>Payments may be processed by third-party platforms</li>
                <li>We are not responsible for third-party privacy practices</li>
              </ul>
            </div>

            <p className={`pt-4 text-xs font-bold ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
              By using HookLabe AI, you agree to this Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const TermsModal: React.FC<{ isOpen: boolean; onClose: () => void; isDark: boolean }> = ({ isOpen, onClose, isDark }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className={`relative w-full max-w-2xl p-8 md:p-12 rounded-[32px] shadow-2xl overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-300 ${isDark ? 'bg-[#12151B] border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-900'}`}>
        <button 
          onClick={onClose}
          className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'}`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-outfit font-bold tracking-tight">Terms & Conditions</h2>
          </div>
          
          <div className={`space-y-8 text-sm leading-relaxed ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>
            <p>
              By accessing or using HookLabe AI, you agree to the following terms.
            </p>

            <div className="space-y-3">
              <h3 className={`font-bold uppercase tracking-widest text-xs ${isDark ? 'text-white' : 'text-black'}`}>Use of Service</h3>
              <ul className="list-disc pl-5 space-y-1 marker:text-[#E040FB]">
                <li>HookLabe AI provides AI-generated scripts for creative purposes</li>
                <li>Generated content is for personal or commercial use at the user’s discretion</li>
                <li>We do not guarantee virality, growth, or specific results</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className={`font-bold uppercase tracking-widest text-xs ${isDark ? 'text-white' : 'text-black'}`}>User Responsibility</h3>
              <ul className="list-disc pl-5 space-y-1 marker:text-[#E040FB]">
                <li>Users are responsible for how generated content is used</li>
                <li>Users must not use the service for illegal or harmful activities</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className={`font-bold uppercase tracking-widest text-xs ${isDark ? 'text-white' : 'text-black'}`}>Payments & Access</h3>
              <ul className="list-disc pl-5 space-y-1 marker:text-[#E040FB]">
                <li>Some features may require payment</li>
                <li>Payments are non-refundable unless stated otherwise</li>
                <li>Access limits may apply based on the selected plan</li>
              </ul>
            </div>

             <div className="space-y-3">
              <h3 className={`font-bold uppercase tracking-widest text-xs ${isDark ? 'text-white' : 'text-black'}`}>Intellectual Property</h3>
              <ul className="list-disc pl-5 space-y-1 marker:text-[#E040FB]">
                <li>HookLabe AI retains ownership of the platform and technology</li>
                <li>Users own the content they generate using the tool</li>
              </ul>
            </div>

             <div className="space-y-3">
              <h3 className={`font-bold uppercase tracking-widest text-xs ${isDark ? 'text-white' : 'text-black'}`}>Limitation of Liability</h3>
              <ul className="list-disc pl-5 space-y-1 marker:text-[#E040FB]">
                <li>HookLabe AI is not liable for losses resulting from use of the service</li>
                <li>Use the tool at your own discretion</li>
              </ul>
            </div>

            <p className={`pt-4 text-xs font-bold ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
              These terms may be updated at any time without prior notice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactModal: React.FC<{ isOpen: boolean; onClose: () => void; isDark: boolean }> = ({ isOpen, onClose, isDark }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className={`relative w-full max-w-2xl p-8 md:p-12 rounded-[32px] shadow-2xl overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-300 ${isDark ? 'bg-[#12151B] border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-900'}`}>
        <button 
          onClick={onClose}
          className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'}`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-outfit font-bold tracking-tight">Contact Us</h2>
          </div>
          
          <div className={`space-y-6 text-base leading-relaxed ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>
            <p className="font-bold text-lg">We’re here to help.</p>
            <p>
              If you have any questions, feedback, support requests, or business inquiries,
              feel free to reach out to us anytime.
            </p>
            
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
              <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>Email</p>
              <a href="mailto:lavelup222@gmail.com" className={`text-xl font-bold hover:underline ${isDark ? 'text-[#00E5FF]' : 'text-[#E040FB]'}`}>
                lavelup222@gmail.com
              </a>
            </div>

            <p>
              We aim to respond to all messages as quickly as possible.
              Please include clear details in your message so we can assist you better.
            </p>
            
            <p className={`pt-4 text-xs font-bold ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
              Thank you for using HookLabe AI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [streamingText, setStreamingText] = useState("");
  const [showAbout, setShowAbout] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  
  const [state, setState] = useState<AppState>({
    ideas: [],
    loading: false,
    error: null,
    config: {
      niche: 'Business',
      audienceType: '',
      platform: 'Instagram',
      tone: 'Relatable',
      language: 'English',
      hookStyle: 'Auto',
      duration: '30s',
      count: 3
    }
  });

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [streamingText]);

  // Fast-rotating messages during loading
  useEffect(() => {
    if (state.loading) {
      const interval = window.setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [state.loading]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const updateConfig = (updates: Partial<GenerationConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...updates }
    }));
  };

  const handleGenerate = useCallback(async () => {
    // Immediate clear for fast feel
    setState(prev => ({ ...prev, loading: true, error: null, ideas: [] }));
    setStreamingText("");
    
    let fullText = "";
    try {
      const stream = generateReelIdeasStream(state.config);
      
      for await (const chunk of stream) {
        fullText += chunk;
        setStreamingText(fullText);
      }
      
      try {
        // Parse the final result
        const data = JSON.parse(fullText);
        const ideas: ReelIdea[] = data.scripts.map((s: any, index: number) => ({
          ...s,
          id: generateId(),
          title: `Script ${index + 1}`
        }));
        
        setState(prev => ({ ...prev, ideas, loading: false }));
      } catch (parseError) {
        console.error("JSON Parse Error", parseError);
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: "Analysis incomplete. The AI stream was interrupted or malformed. Please try again." 
        }));
      }

    } catch (err) {
      console.error("Creative Engine Error", err);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: "Engine calibration error. Please check your connection and try again." 
      }));
    }
  }, [state.config]);

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-500 flex flex-col ${isDark ? 'bg-black text-white' : 'bg-[#F8FAFC] text-slate-900'} pb-12`}>
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} isDark={isDark} />
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} isDark={isDark} />
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} isDark={isDark} />
      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} isDark={isDark} />
      
      <nav className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${isDark ? 'bg-black/80 border-white/5' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LogoIcon />
            <div className="flex flex-col">
              <h1 className="font-outfit font-bold text-xl tracking-tight leading-none">
                HookLabe <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#E040FB]">AI</span>
              </h1>
              <span className={`text-[10px] font-bold uppercase tracking-[0.25em] mt-1.5 ${isDark ? 'text-zinc-600' : 'text-slate-600'}`}>
                Premium Creator Edition
              </span>
            </div>
          </div>
          
          <button 
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl transition-all border ${isDark ? 'bg-zinc-900 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white shadow-sm'}`}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12 flex-grow w-full">
        <div className="space-y-16">
          
          <section className={`border rounded-[32px] p-8 lg:p-12 space-y-10 transition-all duration-500 shadow-2xl relative overflow-hidden ${isDark ? 'bg-[#111111] border-white/5' : 'bg-white border-slate-100 shadow-slate-200/20'}`}>
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <span className="w-2 h-6 bg-[#00E5FF] rounded-full"></span>
              <h2 className={`text-xl font-outfit font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Creative Blueprint</h2>
            </div>

            {/* Platform Selection */}
            <div className="space-y-4 relative z-10">
              <label className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-black'}`}>Target Platform</label>
              <div className="grid grid-cols-3 gap-3">
                {PLATFORMS.map(p => {
                  const label = p === 'YouTube Shorts' ? 'YouTube' : p;
                  const isSelected = state.config.platform === p;
                  return (
                    <button
                      key={p}
                      onClick={() => updateConfig({ platform: p })}
                      className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                        isSelected 
                          ? (isDark ? 'bg-[#00E5FF] border-[#00E5FF] text-black shadow-[0_0_20px_rgba(0,229,255,0.2)]' : 'bg-black border-black text-white shadow-lg')
                          : (isDark ? 'bg-white/5 border-transparent text-zinc-500' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100')
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hook Style */}
            <div className="space-y-4 relative z-10">
              <label className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-black'}`}>Hook Style</label>
              <div className="grid grid-cols-4 gap-3">
                {HOOK_STYLES.map(style => {
                  const isSelected = state.config.hookStyle === style;
                  return (
                    <button
                      key={style}
                      onClick={() => updateConfig({ hookStyle: style })}
                      className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                        isSelected 
                          ? 'bg-[#E0F7FA] border-[#00E5FF] text-[#00E5FF] dark:bg-[#00E5FF]/20'
                          : (isDark ? 'bg-white/5 border-transparent text-zinc-500' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100')
                      }`}
                    >
                      {style}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Video Duration */}
            <div className="space-y-4 relative z-10">
              <label className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-black'}`}>Video Duration</label>
              <div className="flex flex-wrap gap-2.5">
                {DURATIONS.map(d => {
                  const isSelected = state.config.duration === d;
                  return (
                    <button
                      key={d}
                      onClick={() => updateConfig({ duration: d })}
                      className={`px-6 py-2 rounded-xl text-xs font-bold transition-all border ${
                        isSelected 
                          ? 'bg-[#E0F7FA] border-[#00E5FF] text-[#00E5FF] dark:bg-[#00E5FF]/20'
                          : (isDark ? 'bg-white/5 border-transparent text-zinc-500' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100')
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Global Niche */}
            <div className="space-y-4 relative z-10">
              <label className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-black'}`}>Global Niche</label>
              <div className="flex flex-wrap gap-2.5">
                {NICHES.map(n => {
                  const isSelected = state.config.niche === n;
                  return (
                    <button
                      key={n}
                      onClick={() => updateConfig({ niche: n })}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        isSelected 
                          ? 'bg-[#E0F7FA] border-[#00E5FF] text-[#00E5FF] dark:bg-[#00E5FF]/20'
                          : (isDark ? 'bg-white/5 border-transparent text-zinc-500' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100')
                      }`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Audience Description */}
            <div className="space-y-4 relative z-10">
              <label className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-black'}`}>Audience Description</label>
              <input 
                type="text"
                value={state.config.audienceType}
                onChange={(e) => updateConfig({ audienceType: e.target.value })}
                placeholder="Describe your video idea or audience"
                className={`w-full border rounded-xl px-6 py-4 text-sm focus:outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}
              />
            </div>

            {/* Tone & Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-4">
                <label className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-black'}`}>Tone</label>
                <select 
                  value={state.config.tone}
                  onChange={(e) => updateConfig({ tone: e.target.value as VideoTone })}
                  className={`w-full border rounded-xl px-6 py-4 text-sm focus:outline-none appearance-none transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}
                >
                  {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-4">
                <label className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-black'}`}>Language</label>
                <select 
                  value={state.config.language}
                  onChange={(e) => updateConfig({ language: e.target.value as Language })}
                  className={`w-full border rounded-xl px-6 py-4 text-sm focus:outline-none appearance-none transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}
                >
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {/* Scripts Count Slider */}
            <div className="space-y-6 pt-4 relative z-10">
              <div className="flex justify-between items-center">
                <label className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-black'}`}>Scripts to Engineer</label>
                <span className="text-[11px] font-bold text-[#00E5FF] tracking-tight">{state.config.count} ideas</span>
              </div>
              <input 
                type="range"
                min="1"
                max="5"
                step="1"
                value={state.config.count}
                onChange={(e) => updateConfig({ count: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Action Section */}
            <div className="relative z-10 pt-4" aria-live="polite">
              {state.loading && (
                <div className="absolute inset-0 -top-20 flex items-center justify-center pointer-events-none opacity-40">
                  <div className="w-64 h-64 bg-gradient-to-tr from-[#00E5FF] to-[#E040FB] blur-3xl animate-pulse-glow animate-morph rounded-full" />
                </div>
              )}
              
              <button
                onClick={handleGenerate}
                disabled={state.loading}
                className={`w-full py-6 font-outfit font-bold rounded-2xl transition-all shadow-xl disabled:opacity-50 flex flex-col items-center justify-center gap-1 active:scale-[0.98] relative overflow-hidden ${
                  isDark 
                    ? 'bg-white text-black hover:bg-slate-100 shadow-white/5' 
                    : 'bg-black text-white hover:bg-zinc-900'
                }`}
              >
                {state.loading && <div className="scanline" />}
                {state.loading ? (
                  <div className="flex flex-col items-center gap-3 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-lg">Engineering...</span>
                    </div>
                    <span className="text-[12px] font-black text-[#00E5FF] uppercase tracking-[0.2em] animate-pulse">
                      {LOADING_MESSAGES[loadingMsgIdx]}
                    </span>
                  </div>
                ) : (
                  <span className="flex items-center gap-3 relative z-10">
                    Engineer Viral Scripts
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                )}
                {state.loading && (
                   <div className="absolute bottom-0 left-0 h-1.5 w-full bg-white/10 overflow-hidden">
                     <div className="h-full bg-gradient-to-r from-[#00E5FF] to-[#E040FB] animate-[shimmer_2s_infinite_linear]" style={{ width: '100%' }} />
                   </div>
                )}
              </button>
            </div>
          </section>

          {/* Results Section */}
          <div className="space-y-12" id="results">
            <header className="flex flex-col gap-3">
              <h2 className="text-4xl font-outfit font-bold tracking-tighter">
                <span className={isDark ? 'text-white' : 'text-slate-900'}>Content</span> <span className={isDark ? 'text-slate-300' : 'text-slate-500'}>Blueprint</span>
              </h2>
              <p className={`${isDark ? 'text-zinc-500' : 'text-slate-600'} text-sm font-medium`}>
                Scripts engineered with high-retention auto hooks.
              </p>
            </header>

            {state.error && (
              <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-2xl font-bold uppercase tracking-widest">
                {state.error}
              </div>
            )}

            <div className="space-y-12">
              {state.ideas.length > 0 ? (
                state.ideas.map((idea, index) => (
                  <div key={idea.id} className="animate-in fade-in slide-in-from-bottom-12 duration-700 fill-mode-both" style={{ animationDelay: `${index * 150}ms` }}>
                    <ReelCard idea={idea} platform={state.config.platform} theme={theme} />
                  </div>
                ))
              ) : !state.loading && (
                <div className={`py-40 flex flex-col items-center text-center px-12 border border-dashed rounded-[48px] ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white/40 border-slate-200'}`}>
                   <p className="text-slate-500 text-sm italic">Define your blueprint and deploy the AI engine.</p>
                </div>
              )}
              
              {/* Streaming Content Preview - Terminal Style */}
              {state.loading && streamingText && (
                <div className={`p-6 rounded-[24px] border relative overflow-hidden mb-8 transition-all duration-300 ${isDark ? 'bg-[#0A0A0A] border-[#00E5FF]/20' : 'bg-slate-900 border-slate-700'}`}>
                   <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#00E5FF] rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#00E5FF]">Live Intelligence Feed</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">{streamingText.length} bytes received</span>
                   </div>
                   <div 
                      ref={terminalRef}
                      className="font-mono text-[11px] leading-relaxed text-zinc-400 break-all overflow-y-auto max-h-[150px] opacity-80"
                   >
                     {streamingText}
                     <span className="inline-block w-2 h-4 bg-[#00E5FF] ml-1 animate-pulse align-middle" />
                   </div>
                </div>
              )}

              {/* Skeletons - Kept visible while loading to prevent layout shift */}
              {state.loading && (
                <div className="space-y-12 opacity-50">
                  {[...Array(state.config.count)].map((_, i) => (
                    <div key={i} className={`h-[520px] rounded-[48px] border relative overflow-hidden ${isDark ? 'bg-[#12151B] border-white/5' : 'bg-white border-slate-200'}`}>
                       <div className="absolute inset-0 animate-shimmer" />
                       <div className="p-12 space-y-12 relative z-10">
                          <div className="flex justify-between items-start">
                            <div className="space-y-4">
                              <div className="flex gap-2">
                                <div className="h-6 w-24 bg-white/10 rounded-full" />
                                <div className="h-6 w-16 bg-white/10 rounded-full" />
                              </div>
                              <div className="h-4 w-32 bg-white/5 rounded" />
                            </div>
                            <div className="h-10 w-28 bg-white/10 rounded-xl" />
                          </div>
                          <div className="space-y-4">
                            <div className="h-4 w-24 bg-white/5 rounded" />
                            <div className="space-y-2">
                              <div className="h-8 w-full bg-white/10 rounded-lg" />
                              <div className="h-8 w-3/4 bg-white/10 rounded-lg" />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="h-4 w-32 bg-white/5 rounded" />
                            <div className="h-32 w-full bg-white/5 rounded-[32px] border border-white/5" />
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <footer className={`mt-auto border-t py-12 px-6 transition-colors duration-300 ${isDark ? 'bg-black border-white/5' : 'bg-white border-slate-200'}`}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00E5FF] to-[#E040FB] flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-slate-600'}`}>
              © 2025 HookLabe AI
            </p>
          </div>
          <nav className="flex flex-wrap justify-center gap-6 md:gap-10">
            <button 
              onClick={() => setShowAbout(true)} 
              className={`text-xs font-bold uppercase tracking-widest transition-colors hover:text-[#00E5FF] ${isDark ? 'text-zinc-500' : 'text-slate-600'}`}
            >
              About
            </button>
            <button 
              onClick={() => setShowPrivacy(true)} 
              className={`text-xs font-bold uppercase tracking-widest transition-colors hover:text-[#00E5FF] ${isDark ? 'text-zinc-500' : 'text-slate-600'}`}
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => setShowTerms(true)} 
              className={`text-xs font-bold uppercase tracking-widest transition-colors hover:text-[#00E5FF] ${isDark ? 'text-zinc-500' : 'text-slate-600'}`}
            >
              Terms
            </button>
            <button 
              onClick={() => setShowContact(true)} 
              className={`text-xs font-bold uppercase tracking-widest transition-colors hover:text-[#00E5FF] ${isDark ? 'text-zinc-500' : 'text-slate-600'}`}
            >
              Contact
            </button>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default App;
