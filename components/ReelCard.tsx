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
    // Cleaner copy format - only the script content
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
    <div className={`group relative rounded-[40px] border transition-all duration-500 ease-out overflow-hidden hover:scale-[1.02] ${
      isDark 
        ? 'bg-[#12151B] border-white/5 hover:border-[#00E5FF]/40 shadow-2xl shadow-black/50 hover:shadow-[#00E5FF]/10' 
        : 'bg-white border-slate-200 hover:border-[#E040FB]/40 shadow-2xl shadow-slate-200/50 hover:shadow-[#E040FB]/10'
    }`}>
      <div className="p-12 space-y-10">
        {/* Header Bar */}
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-colors ${
                isDark ? 'bg-zinc-800/50 border-white/10 text-zinc-500 group-hover:border-white/20' : 'bg-slate-50 border-slate-200 text-slate-600 group-hover:border-slate-300'
              }`}>
                {platform}
              </span>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${
                isDark ? 'bg-[#00E5FF]/10 border-[#00E5FF]/20 text-[#00E5FF]' : 'bg-cyan-50 border-cyan-100 text-cyan-700'
              }`}>
                {idea.duration}
              </span>
            </div>
            <div className={`text-[11px] font-bold uppercase tracking-[0.15em] pl-1.5 ${isDark ? 'text-zinc-600' : 'text-slate-600'}`}>
              Angle: <span className={isDark ? 'text-[#00E5FF]' : 'text-slate-800'}>{idea.style}</span>
            </div>
          </div>
          
          <button 
            onClick={copyToClipboard}
            className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2.5 active:scale-95 ${
              copied 
                ? 'bg-emerald-500 border-emerald-500 text-white' 
                : (isDark ? 'bg-zinc-900 border-white/10 text-zinc-400 hover:text-white hover:border-[#00E5FF]/50 hover:shadow-[0_0_15px_rgba(0,229,255,0.3)]' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:shadow-lg')
            }`}
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                Copied
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                Copy Script
              </>
            )}
          </button>
        </div>

        {/* The Hook */}
        <div className="space-y-4">
          <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-zinc-700' : 'text-black'}`}>Scroll Stopper (0-3s)</label>
          <blockquote className={`text-3xl font-outfit font-bold tracking-tight leading-[1.15] transition-colors group-hover:text-transparent group-hover:bg-clip-text ${
            isDark 
            ? 'text-white group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#00E5FF]' 
            : 'text-slate-900 group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-[#E040FB]'
          }`}>
            "{idea.hook}"
          </blockquote>
        </div>

        {/* Script Content */}
        <div className="space-y-5">
          <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-zinc-700' : 'text-black'}`}>Voiceover Flow</label>
          <div className={`p-8 rounded-[32px] border leading-relaxed text-base font-medium italic transition-all duration-300 ${
            isDark 
              ? 'bg-white/[0.01] border-white/5 text-zinc-300 group-hover:bg-white/[0.03] group-hover:border-white/10' 
              : 'bg-slate-50/50 border-slate-100 text-slate-800 group-hover:bg-slate-50 group-hover:border-slate-200'
          }`}>
            {idea.mainScript}
          </div>
        </div>

        {/* Visual & Conversion Meta */}
        <div className="grid sm:grid-cols-2 gap-10 pt-12 border-t border-dashed border-slate-200 dark:border-white/5">
          <div className="space-y-4">
            <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-zinc-700' : 'text-black'}`}>On-Screen Overlay</h4>
            <div className={`text-[12px] font-bold px-5 py-4 rounded-2xl border flex items-center min-h-[56px] transition-all duration-300 ${
              isDark ? 'bg-zinc-900 border-white/5 text-zinc-400 group-hover:border-white/20' : 'bg-white border-slate-200 text-slate-900 group-hover:border-slate-300'
            }`}>
              {idea.onScreenText}
            </div>
          </div>
          <div className="space-y-4">
            <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-zinc-700' : 'text-black'}`}>Retention CTA</h4>
            <div className={`text-[12px] font-bold px-5 py-4 rounded-2xl border flex items-center min-h-[56px] transition-all duration-300 ${
              isDark ? 'bg-[#E040FB]/5 border-[#E040FB]/10 text-[#E040FB] group-hover:bg-[#E040FB]/10' : 'bg-purple-50 border-purple-100 text-purple-700 group-hover:bg-purple-100'
            }`}>
              {idea.cta}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
