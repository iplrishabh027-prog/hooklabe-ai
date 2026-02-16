
import React, { useState } from 'react';
import { ReelIdea } from '../types';

interface Props {
  idea: ReelIdea;
  platform: string;
  theme?: 'light' | 'dark';
}

export const ReelCard: React.FC<Props> = ({ idea, platform, theme = 'light' }) => {
  const [copied, setCopied] = useState(false);
  const isDark = theme === 'dark';

  const copyToClipboard = () => {
    const text = `
${idea.hook}

${idea.mainScript}

${idea.cta}

(Overlay: ${idea.onScreenText})
    `.trim();
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`group relative rounded-[40px] border transition-all duration-500 ease-out overflow-hidden shadow-2xl ${
      isDark 
        ? 'bg-[#121212] border-white/5' 
        : 'bg-white border-slate-200 shadow-slate-200/50'
    }`}>
      <div className="p-8 md:p-10 space-y-8">
        {/* Top Header Section */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className={`px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest ${
              isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-500'
            }`}>
              {platform.toUpperCase()}
            </span>
            <span className={`px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-colors ${
              isDark ? 'border-[#00E5FF] text-[#00E5FF] bg-[#00E5FF]/5' : 'border-cyan-500 text-cyan-600 bg-cyan-50'
            }`}>
              {idea.duration.toUpperCase()}
            </span>
          </div>
          
          <button 
            onClick={copyToClipboard}
            className={`px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95 ${
              copied 
                ? 'bg-emerald-500 text-white' 
                : (isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
            }`}
          >
            {copied ? 'COPIED' : 'COPY SCRIPT'}
          </button>
        </div>

        {/* Style Tagline */}
        <div className={`text-[11px] font-black uppercase tracking-[0.15em] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
          HOOK STYLE: <span className={isDark ? 'text-white' : 'text-slate-900'}>{idea.style.toUpperCase()}</span>
        </div>

        {/* The Hook Section */}
        <div className="space-y-3">
          <label className={`block text-[11px] font-bold uppercase tracking-[0.15em] ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
            HOOK (0-3 SEC)
          </label>
          <h3 className={`text-2xl md:text-3xl font-outfit font-bold tracking-tight leading-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            "{idea.hook}"
          </h3>
        </div>

        {/* Main Script Section */}
        <div className={`p-8 md:p-10 rounded-[32px] space-y-4 ${
          isDark ? 'bg-[#0A0A0A]' : 'bg-slate-50'
        }`}>
          <label className={`block text-[11px] font-bold uppercase tracking-[0.15em] ${isDark ? 'text-zinc-700' : 'text-slate-400'}`}>
            MAIN SCRIPT (PACED)
          </label>
          <p className={`text-sm md:text-base leading-relaxed italic font-medium ${
            isDark ? 'text-zinc-400' : 'text-slate-700'
          }`}>
            {idea.mainScript}
          </p>
        </div>

        {/* Visual & Conversion Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-3">
            <h4 className={`text-[11px] font-bold uppercase tracking-[0.15em] ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
              ON-SCREEN TEXT
            </h4>
            <div className={`p-6 rounded-[24px] text-sm font-bold min-h-[80px] flex items-center border transition-all ${
              isDark ? 'bg-[#1A1A1A] border-white/5 text-zinc-300' : 'bg-white border-slate-100 text-slate-900'
            }`}>
              {idea.onScreenText}
            </div>
          </div>
          <div className="space-y-3">
            <h4 className={`text-[11px] font-bold uppercase tracking-[0.15em] ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
              CTA
            </h4>
            <div className={`p-6 rounded-[24px] text-sm font-bold min-h-[80px] flex items-center border transition-all ${
              isDark ? 'bg-[#1A1A1A] border-[#00E5FF]/20 text-[#00E5FF]' : 'bg-cyan-50 border-cyan-200 text-cyan-700'
            }`}>
              {idea.cta}
            </div>
          </div>
        </div>

        {/* Analysis Footer - Integrated Discreetly */}
        {idea.strategicAnalysis && (
          <div className={`pt-4 border-t border-dashed ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest text-center ${isDark ? 'text-zinc-700' : 'text-slate-300'}`}>
              Engineered for maximum retention via neuromarketing protocol
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
