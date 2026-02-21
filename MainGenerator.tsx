import React, { useState, useEffect } from 'react';
import { signUp, signIn, signOut, getCurrentUser } from './services/auth';
import { supabase } from './services/supabase';
import { User } from '@supabase/supabase-js';

// --- Main App Component ---
export default function MainGenerator() {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const [view, setView] = useState<'generator' | 'pricing'>('generator');
  const [isDark, setIsDark] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showRechargePopup, setShowRechargePopup] = useState(false);
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    // Load Razorpay Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    const initUser = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        fetchCredits(currentUser.id);
      }
    };
    initUser();
  }, []);

  const fetchCredits = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('credits').eq('id', userId).single();
    if (data) setCredits(data.credits);
  };

  const handlePayment = (plan: 'starter' | 'pro') => {
    const amount = plan === 'starter' ? 9900 : 19900;
    const creditReward = plan === 'starter' ? 500 : 1200;

    const options = {
      key: "YOUR_RAZORPAY_KEY_ID", // Yahan apni Razorpay Key daalna
      amount: amount,
      currency: "INR",
      name: "Hooklabe AI",
      description: `Recharge ${creditReward} Credits`,
      handler: async function (response: any) {
        const { error } = await supabase.rpc('increment_credits', { user_id: user?.id, amount: creditReward });
        if (!error) {
          setCredits(prev => prev + creditReward);
          setShowRechargePopup(false);
          alert("Payment Successful!");
        }
      },
      prefill: { email: user?.email },
      theme: { color: "#7C4DFF" }
    };
    const rzp = (window as any).Razorpay(options);
    rzp.open();
  };

  const handleGenerate = async () => {
    if (credits < 10) {
      setShowRechargePopup(true);
      return;
    }
    setIsGenerating(true);
    const { error } = await supabase.from('profiles').update({ credits: credits - 10 }).eq('id', user?.id);
    if (!error) setCredits(prev => prev - 10);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-white p-6">
      {/* Simple Header */}
      <nav className="flex justify-between items-center max-w-7xl mx-auto mb-10">
        <h1 className="text-xl font-black">HOOKLABE <span className="text-[#00E5FF]">AI</span></h1>
        <div className="flex gap-4 items-center">
          {user && <span className="text-[#00E5FF] font-bold">Credits: {credits}</span>}
          <button onClick={() => setView('pricing')} className="bg-[#7C4DFF] px-4 py-2 rounded-lg font-bold text-sm">PRICING</button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto pt-10">
        {view === 'generator' ? (
          <div className="space-y-8">
            <h2 className="text-5xl font-black text-center">Create <span className="text-[#00E5FF]">Viral</span> Scripts</h2>
            <div className="bg-white/5 p-8 rounded-[30px] border border-white/10">
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-transparent border-none text-2xl outline-none mb-6"
                placeholder="Describe your video idea..."
              />
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-5 bg-gradient-to-r from-[#00E5FF] to-[#7C4DFF] rounded-2xl font-black"
              >
                {isGenerating ? 'WRITING...' : 'GENERATE (-10 CREDITS)'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-10 rounded-[40px] bg-white/5 border border-white/10 text-center">
              <h3 className="font-bold mb-2">Starter Pack</h3>
              <p className="text-5xl font-black mb-6">₹99</p>
              <p className="mb-8 opacity-60">500 Credits (50 Scripts)</p>
              <button onClick={() => handlePayment('starter')} className="w-full py-4 bg-white text-black font-black rounded-xl">GET STARTED</button>
            </div>
            <div className="p-10 rounded-[40px] bg-[#7C4DFF]/20 border-2 border-[#7C4DFF] text-center">
              <h3 className="font-bold mb-2">Pro Pack</h3>
              <p className="text-5xl font-black mb-6">₹199</p>
              <p className="mb-8 opacity-60">1200 Credits (120 Scripts)</p>
              <button onClick={() => handlePayment('pro')} className="w-full py-4 bg-[#7C4DFF] text-white font-black rounded-xl">GET PRO</button>
            </div>
          </div>
        )}
      </main>

      {showRechargePopup && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="bg-[#12151B] p-10 rounded-[40px] text-center max-w-sm border border-white/10">
            <h2 className="text-2xl font-black mb-4">No Credits!</h2>
            <button onClick={() => { setView('pricing'); setShowRechargePopup(false); }} className="w-full py-4 bg-[#00E5FF] text-black font-black rounded-2xl">UPGRADE NOW</button>
          </div>
        </div>
      )}
    </div>
  );
              }

