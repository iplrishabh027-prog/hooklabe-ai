
import React, { useState, useCallback, useEffect } from 'react';
import { generateReelIdeasStream } from './services/gemini';
import { signUp, signIn, signOut, getCurrentUser } from './services/auth';
import { supabase } from './services/supabase';
import { AppState, Niche, VideoTone, Language, Platform, GenerationConfig, HookStyle, ReelIdea, UserPlan } from './types';
import { ReelCard } from './components/ReelCard';
import { User } from '@supabase/supabase-js';

const NICHES: Niche[] = ['Business', 'Tech', 'Motivation', 'Humor', 'Lifestyle', 'Travel', 'Fitness', 'Generic', 'Story', 'Finance', 'Food', 'Education', 'Other'];
const PLATFORMS: Platform[] = ['Instagram', 'TikTok', 'YouTube Shorts'];
const DURATIONS = ['15s', '30s', '45s', '60s', 'Viral Length (Auto)'];
const HOOK_STYLES: HookStyle[] = ['Curious', 'Shocking', 'Emotional', 'Auto'];
const TONES: VideoTone[] = ['Motivational', 'Educational', 'Shocking', 'Funny', 'Emotional', 'Relatable'];
const LANGUAGES: Language[] = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Hinglish', 'Arabic'];

const PLAN_FEATURES = {
  Free: { 
    maxScripts: 5, 
    price: '₹0', 
    header: '🆓 FREE PLAN',
    features: [
      '✅ 10 scripts on signup',
      '✅ 5 scripts per day',
      '✅ Basic tones (Relatable, Professional, Emotional, Curious)',
      '✅ Standard AI speed',
      '❌ No regenerate / improve',
      '❌ No script history',
      '❌ Basic AI depth'
    ] 
  },
  Starter: { 
    maxScripts: 5, 
    price: '₹199', 
    header: '🚀 STARTER PLAN',
    features: [
      '✅ 300 scripts per month',
      '✅ All basic + advanced tones (Relatable, Professional, Emotional, Curious, Bold, Persuasive, Inspirational)',
      '✅ Faster AI generation',
      '✅ Regenerate scripts',
      '✅ Script history (last 10)',
      '✅ Medium AI intelligence',
      '✅ No Ads 🚫',
      '❌ Rewrite / Improve hooks',
      '❌ Storytelling & High-Energy tones'
    ] 
  },
  Pro: { 
    maxScripts: 10, 
    price: '₹499', 
    header: '💎 PRO PLAN',
    features: [
      '✅ Unlimited scripts (fair usage)',
      '✅ All tones unlocked (Relatable, Professional, Emotional, Curious, Bold, Persuasive, Inspirational, Storytelling, High-Energy)',
      '✅ Priority AI speed (fastest)',
      '✅ Rewrite & improve hooks',
      '✅ Regenerate scripts',
      '✅ Unlimited script history',
      '✅ Highest AI intelligence',
      '✅ No Ads — ever 🚫',
      '✅ Best-performing outputs'
    ] 
  }
};

const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

const LogoIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
    <rect width="48" height="48" rx="16" fill="url(#logo-grad-vibrant)" />
    <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fill="white" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '28px', letterSpacing: '-0.02em' }}>H</text>
    <defs>
      <linearGradient id="logo-grad-vibrant" x1="0" y1="48" x2="48" y2="0" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00E5FF" />
        <stop offset="0.5" stopColor="#7C4DFF" />
        <stop offset="1" stopColor="#E040FB" />
      </linearGradient>
    </defs>
  </svg>
);

const AuthModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  initialType: 'login' | 'signup'; 
  isDark: boolean;
  onAuthSuccess: (user: User) => void;
}> = ({ isOpen, onClose, initialType, isDark, onAuthSuccess }) => {
  const [type, setType] = useState(initialType);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setEmail('');
      setPassword('');
      setError(null);
    }
  }, [isOpen, initialType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!email || !password) throw new Error('Please enter both email and password.');
      let result = type === 'login' ? await signIn(email, password) : await signUp(email, password);
      if (result.error) throw new Error(result.error);
      if (result.user) {
        onAuthSuccess(result.user);
        onClose();
      } else if(type === 'signup') {
        setError("Please check your email to confirm your account.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-[400px] p-8 rounded-[32px] shadow-2xl animate-in fade-in zoom-in-95 duration-300 ${isDark ? 'bg-[#12151B] border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-900'}`}>
        <button onClick={onClose} className={`absolute top-5 right-5 p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-outfit font-bold">{type === 'login' ? 'Welcome Back' : 'Get Started'}</h2>
            <p className={`text-xs mt-1 font-medium ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>{type === 'login' ? 'Enter your credentials' : 'Create an account'}</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl font-medium">{error}</div>}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="creator@example.com" className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${isDark ? 'bg-black/20 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${isDark ? 'bg-black/20 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} />
            </div>
            <button type="submit" disabled={loading} className={`w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${isDark ? 'bg-white text-black hover:bg-slate-200' : 'bg-black text-white hover:bg-zinc-800'}`}>
              {loading ? 'Processing...' : (type === 'login' ? 'Log In' : 'Sign Up')}
            </button>
          </form>
          <p className="text-center text-xs">
            <button onClick={() => setType(type === 'login' ? 'signup' : 'login')} className="text-[#00E5FF] hover:underline">
              {type === 'login' ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </button>
          </p>
          {/* Google Login Button */}
<div className="relative my-6">
  <div className="absolute inset-0 flex items-center">
    <span className="w-full border-t border-white/10"></span>
  </div>
  <div className="relative flex justify-center text-xs uppercase">
    <span className={`${isDark ? 'bg-[#12151B]' : 'bg-white'} px-2 text-zinc-500`}>Or continue with</span>
  </div>
</div>

<button 
  type="button"
  onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
  className="w-full py-3 px-4 border border-white/10 rounded-xl flex items-center justify-center gap-3 hover:bg-white/5 transition-all font-medium"
>
  <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
  <span className={isDark ? 'text-white' : 'text-slate-900'}>Sign in with Google</span>
</button>
        </div>
      </div>
    </div>
  );
};

const AboutView = () => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <h1 className="text-4xl md:text-5xl font-outfit font-bold tracking-tight">About <span className="text-[#00E5FF]">Hooklabe AI</span> 👋</h1>
    <div className="prose prose-invert max-w-none space-y-6 text-zinc-400">
      <p className="text-lg">Hooklabe AI is an AI-powered SaaS platform designed to help creators generate high-retention short-form video scripts for platforms like Instagram Reels, YouTube Shorts, and TikTok.</p>
      <p>We built Hooklabe AI to solve one simple problem: <strong className="text-white font-bold">creating engaging content consistently is hard and time-consuming.</strong></p>
      
      <div className="grid md:grid-cols-2 gap-8 pt-8">
        <div className="space-y-4">
          <h2 className="text-xl font-outfit font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF]"></span>
            What We Do
          </h2>
          <ul className="space-y-2 list-disc pl-5">
            <li>Generate scroll-stopping scripts in seconds</li>
            <li>Choose the right tone, hook, and style effortlessly</li>
            <li>Stay consistent without creative burnout</li>
            <li>Focus on growth instead of writing struggles</li>
          </ul>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-outfit font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E040FB]"></span>
            Who It's For
          </h2>
          <ul className="space-y-2 list-disc pl-5">
            <li>Content creators</li>
            <li>YouTubers and Instagram creators</li>
            <li>Freelancers and marketers</li>
            <li>Anyone who wants better content, faster</li>
          </ul>
        </div>
      </div>

      <div className="pt-8 space-y-4">
        <h2 className="text-2xl font-outfit font-bold text-white">Our Vision</h2>
        <p>We believe AI should be easy to use, affordable, and helpful, not complicated. Our goal is to make powerful AI tools accessible to creators everywhere.</p>
      </div>

      <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 space-y-4">
        <h2 className="text-xl font-outfit font-bold text-white">Transparency & Trust</h2>
        <ul className="space-y-2">
          <li>• We respect user privacy</li>
          <li>• We do not sell personal data</li>
          <li>• We focus on providing a secure and reliable platform</li>
        </ul>
      </div>

      <div className="pt-8 text-center">
        <p className="text-sm uppercase tracking-widest font-bold opacity-50">Contact Us</p>
        <p className="text-xl font-bold text-[#00E5FF]">lavelup222@gmail.com</p>
      </div>
    </div>
  </div>
);

const PrivacyView = () => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <h1 className="text-4xl md:text-5xl font-outfit font-bold tracking-tight">Privacy <span className="text-[#E040FB]">Policy</span></h1>
    <p className="text-xs font-bold uppercase tracking-widest opacity-50">Last updated: 2026</p>
    <div className="prose prose-invert max-w-none space-y-8 text-zinc-400">
      <section className="space-y-4">
        <h2 className="text-xl font-outfit font-bold text-white">Information We Collect</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-white font-bold mb-2">Personal Information</h3>
            <p>Email address (for account creation and communication)</p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-2">Usage Information</h3>
            <p>Number of scripts generated, feature usage, and preferences</p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-2">Technical Information</h3>
            <p>Browser type, device type, and IP address for security and abuse prevention.</p>
          </div>
        </div>
        <p className="text-rose-400 font-bold italic">We do not collect sensitive personal information such as passwords in plain text, financial details, or government IDs.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-outfit font-bold text-white">How We Use Your Information</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Create and manage user accounts</li>
          <li>Provide and improve AI-generated services</li>
          <li>Enforce usage limits and fair usage policies</li>
          <li>Communicate important updates and support messages</li>
          <li>Maintain platform security and prevent misuse</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-outfit font-bold text-white">Authentication & Data Storage</h2>
        <p>We use trusted third-party services (such as Supabase) for user authentication and secure data storage. Passwords are encrypted and never stored in readable form.</p>
      </section>

      <div className="p-8 rounded-[32px] bg-rose-500/5 border border-rose-500/10 text-center">
        <p className="text-sm font-bold text-white uppercase tracking-[0.2em] mb-2">Questions?</p>
        <p className="text-lg font-bold text-[#E040FB]">lavelup222@gmail.com</p>
      </div>
    </div>
  </div>
);

const TermsView = () => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <h1 className="text-4xl md:text-5xl font-outfit font-bold tracking-tight">Terms and <span className="opacity-40">Conditions</span></h1>
    <p className="text-xs font-bold uppercase tracking-widest opacity-50">Last updated: 2026</p>
    <div className="prose prose-invert max-w-none space-y-10 text-zinc-400">
      <p className="text-lg">Welcome to Hooklabe AI. By accessing or using our website and services, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use Hooklabe AI.</p>
      
      <section className="space-y-4">
        <h2 className="text-xl font-outfit font-bold text-white">1. Use of Service</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>You must be at least 13 years old to use Hooklabe AI.</li>
          <li>You agree to use the platform only for lawful purposes.</li>
          <li>You must not misuse, abuse, or attempt to disrupt the service, including but not limited to hacking, reverse engineering, or automated abuse.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-outfit font-bold text-white">2. User Accounts</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>You are responsible for maintaining the confidentiality of your account.</li>
          <li>All activity performed under your account is your responsibility.</li>
          <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-outfit font-bold text-white">3. AI-Generated Content</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>All content generated by Hooklabe AI is provided “as is.”</li>
          <li>We do not guarantee accuracy, originality, or suitability for any purpose.</li>
          <li>You are solely responsible for how you use the generated content.</li>
          <li>Hooklabe AI is not liable for outcomes resulting from the use of AI-generated content.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-outfit font-bold text-white">4. Free and Paid Plans</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Hooklabe AI offers free and paid subscription plans.</li>
          <li>Features and limits vary depending on the selected plan.</li>
          <li>Paid subscriptions are billed on a monthly basis unless stated otherwise.</li>
          <li>Subscription features may change to improve the service.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-outfit font-bold text-white">5. Fair Usage Policy</h2>
        <p>Plans that include “unlimited” usage are subject to fair usage. Fair usage means normal, human-level usage without automation or abuse. Excessive or abnormal usage may result in temporary limits or account review.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-outfit font-bold text-white">6. Payments and Refunds</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Payments are processed through secure third-party payment providers.</li>
          <li>All fees are non-refundable, unless explicitly stated in our Refund Policy.</li>
          <li>It is your responsibility to manage subscription renewals or cancellations.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-outfit font-bold text-white">7. Advertisements</h2>
        <p>Free users may see advertisements. Paid plans include an ad-free experience. Advertisement policies may change over time.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-outfit font-bold text-white">8. Service Availability</h2>
        <p>We strive to provide uninterrupted service, but we do not guarantee continuous availability. Temporary downtime may occur due to maintenance, updates, or technical issues.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-outfit font-bold text-white">9. Limitation of Liability</h2>
        <p>Hooklabe AI is not responsible for any loss of data or revenue, business decisions made using generated content, or indirect/consequential damages. Use of the service is at your own risk.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-outfit font-bold text-white">10. Termination</h2>
        <p>We reserve the right to suspend or terminate access to Hooklabe AI at any time if these terms are violated.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-outfit font-bold text-white">11. Changes to These Terms</h2>
        <p>We may update these Terms and Conditions from time to time. Any changes will be posted on this page with an updated date.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-outfit font-bold text-white">12. Governing Law</h2>
        <p>These Terms and Conditions are governed by the laws of <strong className="text-white">India</strong>.</p>
      </section>

      <div className="pt-10 border-t border-white/5 text-center">
        <p className="text-sm font-bold uppercase tracking-widest opacity-50">Contact Support</p>
        <p className="text-xl font-bold text-[#00E5FF]">lavelup222@gmail.com</p>
      </div>
    </div>
  </div>
);

const ContactView = () => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <h1 className="text-4xl md:text-5xl font-outfit font-bold tracking-tight">Contact <span className="text-[#00E5FF]">Us</span> 👋</h1>
    <p className="text-lg text-zinc-400">We’re here to help. If you have questions, feedback, or need support with Hooklabe AI, feel free to reach out to us.</p>
    
    <div className="grid md:grid-cols-2 gap-8 pt-4">
      <div className="p-8 rounded-[40px] bg-white/5 border border-white/10 space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-[#00E5FF]/20 flex items-center justify-center text-[#00E5FF]">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-outfit font-bold text-white">Email Support</h2>
          <p className="text-zinc-400 text-sm">We usually respond within 24–48 hours.</p>
          <a href="mailto:lavelup222@gmail.com" className="text-xl font-bold text-[#00E5FF] block hover:underline">lavelup222@gmail.com</a>
        </div>
      </div>

      <div className="p-8 rounded-[40px] bg-white/5 border border-white/10 space-y-4">
        <h2 className="text-xl font-outfit font-bold text-white flex items-center gap-2">
          <span className="text-[#E040FB]">💡</span> What You Can Contact Us About
        </h2>
        <ul className="space-y-2 text-sm text-zinc-400">
          <li>• Account or login issues</li>
          <li>• Subscription and billing questions</li>
          <li>• Feature requests or feedback</li>
          <li>• Technical problems or bug reports</li>
        </ul>
      </div>
    </div>

    <section className="p-8 rounded-[40px] bg-[#00E5FF]/5 border border-[#00E5FF]/10 space-y-4">
      <h2 className="text-xl font-outfit font-bold text-white flex items-center gap-2">
        <span className="text-[#00E5FF]">🧾</span> For Faster Support
      </h2>
      <p className="text-sm text-zinc-400">Please include the following in your message:</p>
      <ul className="grid md:grid-cols-3 gap-4 text-xs font-bold text-white uppercase tracking-wider">
        <li className="bg-white/5 p-4 rounded-2xl border border-white/5">Registered Email</li>
        <li className="bg-white/5 p-4 rounded-2xl border border-white/5">Issue Description</li>
        <li className="bg-white/5 p-4 rounded-2xl border border-white/5">Screenshots</li>
      </ul>
    </section>

    <div className="pt-12 text-center space-y-4">
      <p className="text-xl font-outfit font-bold">Thank you for choosing Hooklabe AI 🚀</p>
      <p className="text-sm opacity-40">We appreciate your trust.</p>
    </div>
  </div>
);

const RefundView = () => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <h1 className="text-4xl md:text-5xl font-outfit font-bold tracking-tight">Refund <span className="text-[#00E5FF]">Policy</span> 💸</h1>
    <p className="text-xs font-bold uppercase tracking-widest opacity-50">Last updated: 2026</p>
    <div className="prose prose-invert max-w-none space-y-10 text-zinc-400">
      <p className="text-lg">Hooklabe AI provides digital, AI-based services that are delivered instantly after payment. Once access is granted, the service is considered used.</p>
      
      <section className="space-y-4">
        <h2 className="text-xl font-outfit font-bold text-white">1. Digital Services</h2>
        <p>Because our platform utilizes high-cost compute resources for AI generation and provides immediate access to engineered scripts, we consider the service "delivered" at the point of subscription activation.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-outfit font-bold text-white">2. No Refund Policy</h2>
        <p>All payments made for Hooklabe AI plans are <strong className="text-white">non-refundable</strong>, including:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Monthly subscription fees</li>
          <li>Starter or Pro plan payments</li>
          <li>Promotional or discounted purchases</li>
        </ul>
        <p>We do not offer refunds for partially used billing periods.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-outfit font-bold text-white">3. Exceptions</h2>
        <p>Refunds may be considered only in rare cases, such as:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Duplicate payment made by mistake</li>
          <li>Technical issues from our side that completely prevent access to the service</li>
        </ul>
        <p>Any refund request must be made within <strong className="text-white">7 days</strong> of the payment date. Approval of refunds is at the sole discretion of Hooklabe AI.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-outfit font-bold text-white">4. Subscription Cancellation</h2>
        <p>You may cancel your subscription at any time. After cancellation:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>You will not be charged for the next billing cycle</li>
          <li>You will continue to have access until the end of the current billing period</li>
          <li>No refunds will be issued for the current cycle</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-outfit font-bold text-white">5. Changes to Plans & Pricing</h2>
        <p>Hooklabe AI reserves the right to modify subscription plans, pricing, or features at any time without prior notice.</p>
      </section>

      <div className="p-8 rounded-[40px] bg-white/5 border border-white/10 text-center space-y-4">
        <p className="text-sm font-bold uppercase tracking-widest opacity-50">Need assistance?</p>
        <p className="text-xl font-bold text-[#00E5FF]">lavelup222@gmail.com</p>
        <p className="text-xs italic opacity-40">By purchasing or using any paid service on Hooklabe AI, you acknowledge and agree to this Refund Policy.</p>
      </div>
    </div>
  </div>
);

const DisclaimerView = () => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <h1 className="text-4xl md:text-5xl font-outfit font-bold tracking-tight">Disclaimer ⚠️</h1>
    <p className="text-xs font-bold uppercase tracking-widest opacity-50">Last updated: 2026</p>
    <div className="prose prose-invert max-w-none space-y-10 text-zinc-400">
      <p className="text-lg">Hooklabe AI provides AI-generated content for informational and creative purposes only. All content generated by the platform is produced automatically using artificial intelligence.</p>

      <section className="space-y-4">
        <h2 className="text-xl font-outfit font-bold text-white">General Information</h2>
        <p>We do not guarantee that the information or scripts generated are accurate, complete, original, or suitable for any specific purpose.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-outfit font-bold text-white">AI-Generated Content</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>All scripts and outputs are generated by AI and provided <strong>“as is.”</strong></li>
          <li>Hooklabe AI does not guarantee results such as views, engagement, revenue, or growth.</li>
          <li>Users are solely responsible for reviewing, editing, and using the generated content.</li>
          <li>We are not responsible for any consequences resulting from the use of AI-generated content.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-outfit font-bold text-white">Professional Advice Disclaimer</h2>
        <p>The content generated by Hooklabe AI does <strong>not</strong> constitute:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Legal advice</li>
          <li>Financial advice</li>
          <li>Medical advice</li>
          <li>Professional consulting advice</li>
        </ul>
        <p>Always consult a qualified professional before making decisions based on generated content.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-outfit font-bold text-white">External Links</h2>
        <p>Hooklabe AI may contain links to third-party websites. We do not control or take responsibility for the content, policies, or practices of any third-party sites.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-outfit font-bold text-white">Limitation of Liability</h2>
        <p>Hooklabe AI shall not be held liable for any direct or indirect loss, loss of data or revenue, business or personal decisions made using generated content, or service interruptions. Use of the platform is at your own risk.</p>
      </section>

      <div className="pt-10 border-t border-white/5 text-center">
        <p className="text-sm font-bold uppercase tracking-widest opacity-50">Questions?</p>
        <p className="text-xl font-bold text-[#00E5FF]">lavelup222@gmail.com</p>
      </div>
    </div>
  </div>
);

type ViewType = 'home' | 'about' | 'privacy' | 'terms' | 'contact' | 'refund' | 'disclaimer';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [user, setUser] = useState<User | null>(null);
  const [authModal, setAuthModal] = useState<{isOpen: boolean; type: 'login' | 'signup'}>({ isOpen: false, type: 'login' });
  const [view, setView] = useState<ViewType>('home');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  const [state, setState] = useState<AppState>({
    ideas: [], loading: false, error: null, plan: 'Free',
    config: { 
      niche: 'Other', // Updated default
      audienceType: '', 
      platform: 'Instagram', 
      tone: 'Relatable', 
      language: 'English', 
      hookStyle: 'Auto', 
      duration: '30s', 
      count: 1, // Updated default
      plan: 'Free' 
    }
  });

  useEffect(() => { document.documentElement.className = theme; }, [theme]);
  useEffect(() => {
    const initAuth = async () => { const currentUser = await getCurrentUser(); setUser(currentUser); };
    initAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user || null); });
    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const updateConfig = (updates: Partial<GenerationConfig>) => { setState(prev => ({ ...prev, config: { ...prev.config, ...updates } })); };
  const handleLogout = async () => { await signOut(); };
  
  const handleGenerate = useCallback(async (forcedConfig?: GenerationConfig) => {
    const activeConfig = { ...(forcedConfig || state.config), plan: state.plan };
    
    if (activeConfig.count > PLAN_FEATURES[state.plan].maxScripts) {
      setState(prev => ({ ...prev, error: `Your ${state.plan} plan is limited to ${PLAN_FEATURES[state.plan].maxScripts} scripts per generation.` }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null, ideas: [] }));
    let fullText = "";
    try {
      const stream = generateReelIdeasStream(activeConfig);
      for await (const chunk of stream) { fullText += chunk; }
      const data = JSON.parse(fullText);
      if (data.error) throw new Error(data.error);
      const ideas: ReelIdea[] = data.scripts.map((s: any, idx: number) => ({ ...s, id: generateId(), title: `Script ${idx + 1}` }));
      setState(prev => ({ ...prev, ideas, loading: false }));
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err.message || "Engineering error. Please try again." }));
    }
  }, [state.config, state.plan]);

  const navigateTo = (newView: ViewType) => {
    setView(newView);
    setSidebarOpen(false);
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handlePricingScroll = () => {
    if (view !== 'home') {
      setView('home');
      setSidebarOpen(false);
      setTimeout(() => {
        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setSidebarOpen(false);
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-500 flex flex-col ${isDark ? 'bg-black text-white' : 'bg-[#F8FAFC] text-slate-900'} pb-12`}>
      <AuthModal isOpen={authModal.isOpen} onClose={() => setAuthModal(prev => ({...prev, isOpen: false}))} initialType={authModal.type} isDark={isDark} onAuthSuccess={setUser} />
      
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[100] flex animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className={`relative w-80 h-full p-8 shadow-2xl animate-in slide-in-from-left duration-500 overflow-y-auto ${isDark ? 'bg-[#0A0C10] border-r border-white/5 text-white' : 'bg-white border-r border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between mb-12">
               <div className="flex items-center gap-3">
                 <LogoIcon />
                 <h2 className="font-outfit font-bold text-xl tracking-tight leading-none">HookLabe <span className="text-[#00E5FF]">AI</span></h2>
               </div>
               <button onClick={() => setSidebarOpen(false)} className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
            
            <nav className="space-y-2">
              <button 
                onClick={() => navigateTo('home')}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${view === 'home' ? (isDark ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-black text-white') : (isDark ? 'hover:bg-white/5 text-zinc-400' : 'hover:bg-slate-100 text-slate-600')}`}
              >
                <span className="text-lg">⚡</span> Home
              </button>
              
              <button 
                onClick={handlePricingScroll}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${isDark ? 'hover:bg-white/5 text-zinc-400' : 'hover:bg-slate-100 text-slate-600'}`}
              >
                <span className="text-lg">💎</span> Pricing
              </button>

              <button 
                onClick={() => navigateTo('about')}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${view === 'about' ? (isDark ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-black text-white') : (isDark ? 'hover:bg-white/5 text-zinc-400' : 'hover:bg-slate-100 text-slate-600')}`}
              >
                <span className="text-lg">📖</span> About
              </button>

              <button 
                onClick={() => navigateTo('contact')}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${view === 'contact' ? (isDark ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-black text-white') : (isDark ? 'hover:bg-white/5 text-zinc-400' : 'hover:bg-slate-100 text-slate-600')}`}
              >
                <span className="text-lg">👋</span> Contact
              </button>

              {!user ? (
                <button 
                  onClick={() => { setSidebarOpen(false); setAuthModal({ isOpen: true, type: 'login' }); }}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${isDark ? 'hover:bg-white/5 text-zinc-400' : 'hover:bg-slate-100 text-slate-600'}`}
                >
                  <span className="text-lg">👤</span> Login / Sign up
                </button>
              ) : (
                <button 
                  onClick={() => { setSidebarOpen(false); handleLogout(); }}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${isDark ? 'hover:bg-white/5 text-zinc-400' : 'hover:bg-slate-100 text-slate-600'}`}
                >
                  <span className="text-lg">🚪</span> Sign Out
                </button>
              )}
            </nav>
          </aside>
        </div>
      )}

      <nav className={`sticky top-0 z-50 backdrop-blur-xl border-b h-20 flex items-center transition-all ${isDark ? 'bg-black/80 border-white/5' : 'bg-white/80 border-slate-200 shadow-sm'}`}>
        <div className="max-w-5xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-4 group">
            <button 
              onClick={() => setSidebarOpen(true)}
              className={`p-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 mr-2 ${isDark ? 'bg-zinc-900 border-white/10 text-white hover:bg-zinc-800' : 'bg-white border-slate-200 text-slate-600 shadow-sm hover:bg-slate-50'}`}
              aria-label="Open Menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h12M4 18h16" />
              </svg>
            </button>
            
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigateTo('home')}>
              <LogoIcon />
              <div className="flex flex-col hidden sm:flex">
                <h1 className="font-outfit font-bold text-xl tracking-tight leading-none group-hover:scale-[1.02] transition-transform">HookLabe <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#E040FB]">AI</span></h1>
                <div className="flex items-center gap-2 mt-1.5">
                   <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-zinc-600' : 'text-slate-600'}`}>CREATOR EDITION</span>
                   {user && (
                     <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${state.plan === 'Pro' ? 'bg-[#E040FB] text-white' : state.plan === 'Starter' ? 'bg-[#00E5FF] text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                       {state.plan}
                     </span>
                   )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {view !== 'home' && (
              <button onClick={() => navigateTo('home')} className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl border border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF]/5 transition-all hidden md:block`}>
                Back to Engine
              </button>
            )}
            {user ? (
               <button onClick={handleLogout} className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl border transition-all hidden sm:block ${isDark ? 'border-white/10 text-zinc-400 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Log Out</button>
            ) : (
                <button onClick={() => setAuthModal({isOpen: true, type: 'login'})} className={`text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-lg active:scale-95 transition-all ${isDark ? 'bg-white text-black hover:bg-slate-100' : 'bg-black text-white hover:bg-zinc-900'}`}>Sign Up</button>
            )}
            <button onClick={toggleTheme} className={`p-2.5 rounded-xl border transition-all active:rotate-12 ${isDark ? 'bg-zinc-900 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 shadow-sm hover:bg-slate-100'}`}>{isDark ? '☀️' : '🌙'}</button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-6 md:py-12 flex-grow w-full">
        {view === 'about' ? <AboutView /> : 
         view === 'privacy' ? <PrivacyView /> : 
         view === 'terms' ? <TermsView /> : 
         view === 'contact' ? <ContactView /> : 
         view === 'refund' ? <RefundView /> : 
         view === 'disclaimer' ? <DisclaimerView /> : (
          <div className="space-y-16">
            {/* Creative Blueprint Section */}
            <section className={`rounded-[32px] p-10 space-y-10 transition-all duration-500 shadow-2xl relative overflow-hidden ${isDark ? 'bg-[#0F1115] border border-white/5' : 'bg-white border border-slate-100 shadow-slate-200/20'}`}>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-1.5 h-6 bg-[#00E5FF] rounded-full"></span>
                <h2 className="text-xl font-outfit font-bold tracking-tight text-white uppercase tracking-[0.1em]">Creative Blueprint</h2>
              </div>

              {/* Target Platform */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 text-white">Target Platform</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PLATFORMS.map(p => (
                    <button key={p} onClick={() => updateConfig({ platform: p })} className={`py-4 rounded-xl text-xs font-bold border transition-all ${state.config.platform === p ? (isDark ? 'bg-[#00E5FF] border-[#00E5FF] text-black shadow-lg shadow-cyan-500/20' : 'bg-black border-black text-white shadow-lg') : (isDark ? 'bg-white/5 border-transparent text-[#52525B] hover:text-white' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100')}`}>
                      {p === 'YouTube Shorts' ? 'YouTube' : p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hook Style */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 text-white">Hook Style</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {HOOK_STYLES.map(style => (
                    <button key={style} onClick={() => updateConfig({ hookStyle: style })} className={`py-4 rounded-xl text-xs font-bold border transition-all ${state.config.hookStyle === style ? 'border-[#00E5FF] text-[#00E5FF] bg-[#00E5FF]/5' : (isDark ? 'bg-white/5 border-transparent text-[#52525B] hover:text-white' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100')}`}>
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video Duration */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 text-white">Video Duration</label>
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map(d => (
                    <button key={d} onClick={() => updateConfig({ duration: d })} className={`px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all border ${state.config.duration === d ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF]' : 'bg-white/5 border-transparent text-[#52525B] hover:bg-white/10'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Global Niche */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 text-white">Global Niche</label>
                <div className="flex flex-wrap gap-2">
                  {NICHES.map(n => (
                    <button key={n} onClick={() => updateConfig({ niche: n })} className={`px-5 py-2.5 rounded-full text-[11px] font-bold transition-all border ${state.config.niche === n ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF]' : 'bg-white/5 border-transparent text-[#52525B] hover:bg-white/10'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audience Description */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 text-white">Audience Description</label>
                <input type="text" value={state.config.audienceType} onChange={(e) => updateConfig({ audienceType: e.target.value })} placeholder="Describe your video idea or audience" className={`w-full border rounded-xl px-6 py-4 text-sm focus:outline-none transition-all ${isDark ? 'bg-white/[0.03] border-white/10 text-white placeholder-zinc-700' : 'bg-slate-50 border-slate-100 text-slate-900 shadow-inner'}`} />
              </div>

              {/* Tone Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 text-white">Tone Selection</label>
                <div className="flex flex-wrap gap-2">
                  {TONES.map(t => (
                    <button key={t} onClick={() => updateConfig({ tone: t })} className={`px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all border ${state.config.tone === t ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF]' : 'bg-white/5 border-transparent text-[#52525B] hover:bg-white/10'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 text-white">Language Selection</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(l => (
                    <button key={l} onClick={() => updateConfig({ language: l })} className={`px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all border ${state.config.language === l ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF]' : 'bg-white/5 border-transparent text-[#52525B] hover:bg-white/10'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scripts to Engineer */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 text-white">Scripts to Engineer</label>
                  <span className="text-[11px] font-bold text-[#00E5FF] uppercase tracking-[0.2em]">{state.config.count} idea{state.config.count > 1 ? 's' : ''}</span>
                </div>
                <input type="range" min="1" max="10" value={state.config.count} onChange={(e) => updateConfig({ count: parseInt(e.target.value) })} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00E5FF]" />
              </div>

              <div className="pt-4">
                <button 
onClick={async () => {
  if (!user) {
    setAuthModal({ isOpen: true, type: 'signup' });
    return;
  }

  // Supabase RPC ko call karke credits check aur use karna
  const { data: status, error } = await supabase.rpc('check_and_use_credit', { 
    user_uuid: user.id 
  });

  if (error) {
    console.error("Daya, error aaya:", error);
    return;
  }

  if (status === 'SUCCESS') {
    handleGenerate(); // Script generation shuru
  } else if (status === 'DAILY_LIMIT_REACHED') {
    alert("Free Plan: Aaj ke 5 scripts khatam! Kal aana ya upgrade karo.");
  } else if (status === 'NO_CREDITS') {
    alert("Bhai, Total Credits khatam! Plan khareedna padega.");
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
      }
    });

    return (
      <button
        disabled={state.loading}
        className={`w-full py-6 font-outfit font-bold rounded-2xl transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98] ${isDark ? 'bg-white text-black hover:bg-slate-100' : 'bg-black text-white hover:bg-zinc-900'}`}
      >



                  {state.loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>ENGINEERING CONTENT...</span>
                    </div>
                  ) : (
                    <>
                      <span>Engineer Viral Scripts</span>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </>
                  )}
                </button>
              </div>
              {state.error && <p className="text-center text-xs text-red-500 font-bold tracking-widest uppercase animate-pulse">{state.error}</p>}
            </section>

            {/* Results Section */}
            <div className="space-y-12" id="results">
              {state.ideas.length > 0 && (
                 <header className="flex flex-col gap-2">
                   <h2 className="text-4xl md:text-5xl font-outfit font-bold tracking-tighter">Content <span className="opacity-40">Blueprint</span></h2>
                   <p className="text-sm opacity-50 font-medium">Strategic scripts engineered with the {state.plan} engine.</p>
                 </header>
              )}
              {state.ideas.map((idea) => (
                <ReelCard key={idea.id} idea={idea} platform={state.config.platform} theme={theme} />
              ))}
            </div>

            {/* Pricing Section */}
            <section id="pricing" className="pt-20 space-y-12">
              <div className="text-center space-y-4">
                 <h2 className="text-4xl font-outfit font-bold tracking-tight">Strategic <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#E040FB]">Plans</span></h2>
                 <p className="text-sm opacity-50 max-w-lg mx-auto">Scale your content from hobby to viral sensation with specialized AI tiers.</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {(Object.keys(PLAN_FEATURES) as UserPlan[]).map(planKey => {
                  const p = (PLAN_FEATURES as any)[planKey];
                  const isActive = state.plan === planKey;
                  return (
                    <div key={planKey} className={`relative p-8 rounded-[40px] border transition-all duration-500 flex flex-col ${isActive ? (isDark ? 'bg-white/5 border-[#00E5FF] shadow-[0_0_40px_rgba(0,229,255,0.1)]' : 'bg-white border-black shadow-xl') : (isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-100')}`}>
                      {planKey === 'Starter' && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#00E5FF] to-[#E040FB] text-white text-[10px] font-black rounded-full shadow-lg">RECOMMENDED</span>
                      )}
                      <div className="space-y-6 flex-grow">
                        <div>
                          <h3 className="text-xl font-outfit font-bold">{p.header}</h3>
                          <div className="flex items-baseline gap-1 mt-2">
                            <span className="text-3xl font-black">{p.price}</span>
                            <span className="text-xs opacity-50 font-bold uppercase tracking-widest">/ month</span>
                          </div>
                        </div>
                        <ul className="space-y-4">
                          {p.features.map((f: string) => {
                            const isCheck = f.startsWith('✅');
                            const isCross = f.startsWith('❌');
                            const cleanText = f.replace(/^[✅❌]\s*/, '');
                            return (
                              <li key={f} className="flex items-start gap-4 text-xs font-semibold">
                                {isCheck ? (
                                  <svg className="w-5 h-5 text-[#00E5FF] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4.5} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : isCross ? (
                                  <svg className="w-5 h-5 text-rose-500/20 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4.5} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                ) : (
                                  <div className="w-5 shrink-0" />
                                )}
                                <span className={`leading-tight ${isCross ? 'opacity-30 line-through' : 'opacity-90'}`}>{cleanText}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                      onClick={() => {
  // 1. Agar user login nahi hai toh modal kholo
  if (!user) {
    setAuthModal({ isOpen: true, type: 'signup' });
    return;
  }

  // 2. Agar Free plan hai toh kuch mat karo (already current plan hai)
  if (planKey === 'Free') return;

  // 3. Razorpay Options
  const options = {
    key: "rzp_live_SITye3XApPTeQd", // <-- Yahan apni Key ID dalo
    amount: p.price * 100, // Amount in paise
    currency: "INR",
    name: "HookLabe AI",
    description: `${planKey} Plan Upgrade`,
    handler: async function (response: any) {
      // Payment success hone par credits update karein
      const { error } = await supabase
        .from('credits')
        .update({ 
          available_credits: planKey === 'Starter' ? 300 : 1000, 
          plan_type: planKey.toLowerCase() 
        })
        .eq('id', user.id);

      if (!error) {
        alert(`Mubarak ho! ${planKey} plan active ho gaya.`);
        window.location.reload(); 
      }
    },
    prefill: {
      email: user.email
    },
    theme: { color: "#00E5FF" }
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.open();
}}

                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className={`mt-auto border-t py-16 px-6 transition-colors duration-300 ${isDark ? 'bg-black border-white/5' : 'bg-white border-slate-200'}`}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigateTo('home')}>
            <LogoIcon />
            <p className="text-[11px] font-bold uppercase tracking-widest opacity-40 font-outfit">© 2026 HOOKLABE AI</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-8">
            {[
              { label: 'ABOUT', view: 'about' },
              { label: 'PRIVACY POLICY', view: 'privacy' },
              { label: 'TERMS', view: 'terms' },
              { label: 'REFUND POLICY', view: 'refund' },
              { label: 'DISCLAIMER', view: 'disclaimer' },
              { label: 'CONTACT', view: 'contact' }
            ].map(link => (
              <button 
                key={link.label} 
                onClick={() => navigateTo(link.view as ViewType)}
                className={`text-[11px] font-black uppercase tracking-widest transition-opacity ${view === link.view ? 'opacity-100 text-[#00E5FF]' : 'opacity-50 hover:opacity-100'}`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default App;
