import React, { useState, useEffect } from 'react';
import { getCurrentUser } from './services/auth';
import { supabase } from './services/supabase';
import { User } from '@supabase/supabase-js';

export default function MainGenerator() {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showRechargePopup, setShowRechargePopup] = useState(false);

  useEffect(() => {
    // Razorpay Script Load
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    const initApp = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        fetchCredits(currentUser.id);
      }
    };
    initApp();
  }, []);

  const fetchCredits = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('credits').eq('id', userId).single();
    if (data) setCredits(data.credits);
  };

  // --- Razorpay Payment Function ---
  const handlePayment = (amountInInr: number, creditAmount: number) => {
    if (!user) return alert("Please Login First to Buy Credits!");

    const options = {
      key: "rzp_live_SITye3XApPTeQd", // 👈 YAHAN APNI RAZORPAY KEY DALO
      amount: amountInInr * 100, // Amount in paise
      currency: "INR",
      name: "HookLabe AI",
      description: `Upgrade: Add ${creditAmount} Credits`,
      handler: async function (response: any) {
        // Payment success hone par database update
        const { error } = await supabase.rpc('increment_credits', { 
          user_id: user.id, 
          amount: creditAmount 
        });
        
        if (!error) {
          setCredits(prev => prev + creditAmount);
          setShowRechargePopup(false);
          alert("Payment Successful! Credits Added to your account.");
        }
      },
      prefill: { email: user.email },
      theme: { color: "#00E5FF" }
    };
    const rzp = (window as any).Razorpay(options);
    rzp.open();
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-white font-sans selection:bg-[#00E5FF]/30">
      
      {/* --- PREMIUN NAVBAR --- */}
      <nav className="flex justify-between items-center px-8 py-5 border-b border-white/5 sticky top-0 z-50 bg-[#0A0C10]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="bg-[#7C4DFF] w-10 h-10 rounded-xl flex items-center justify-center font-black italic text-xl shadow-lg shadow-purple-500/20">H</div>
          <span className="font-bold text-2xl tracking-tighter italic">HookLabe <span className="text-xs uppercase text-zinc-600 not-italic tracking-widest font-black">AI</span></span>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex flex-col items-end">
             <span className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Available Credits</span>
             <span className="text-[#00E5FF] font-black text-xl tracking-tighter">{credits}</span>
           </div>
           <button className="bg-white text-black px-6 py-2 rounded-full font-black text-xs uppercase tracking-tighter hover:bg-[#00E5FF] transition-all">Sign Up</button>
        </div>
      </nav>

      {/* --- GENERATOR SECTION --- */}
      <div className="max-w-4xl mx-auto pt-24 px-6 text-center">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">Create <span className="text-[#00E5FF]">Viral</span> Scripts</h1>
        <div className="bg-[#12151B] p-10 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent opacity-50"></div>
          <textarea 
            className="w-full bg-transparent border-none text-2xl md:text-3xl focus:ring-0 placeholder-zinc-800 mb-8 min-h-[180px] font-medium"
            placeholder="Describe your video idea or audience..."
          />
          <button className="w-full py-6 rounded-3xl bg-white text-black font-black text-2xl flex items-center justify-center gap-3 hover:bg-[#00E5FF] transition-all group active:scale-[0.98]">
            Engineer Viral Scripts 
            <span className="group-hover:translate-x-2 transition-transform">→</span>
          </button>
        </div>
      </div>

      {/* --- STRATEGIC PLANS SECTION --- */}
      <div className="max-w-6xl mx-auto pt-32 px-6 pb-32">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-black mb-4 tracking-tighter">Strategic <span className="text-purple-500">Plans</span></h2>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px]">Scale your content from hobby to viral sensation</p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Starter Plan */}
          <div className="bg-[#12151B] p-12 rounded-[48px] border border-white/5 flex flex-col items-center text-center group hover:border-zinc-700 transition-all">
            <span className="text-[10px] font-black uppercase text-zinc-600 mb-6 tracking-widest bg-white/5 px-4 py-1 rounded-full">🚀 Starter Plan</span>
            <h3 className="text-6xl font-black mb-10 tracking-tighter">₹199<span className="text-sm font-normal text-zinc-700 uppercase tracking-widest ml-2">/ month</span></h3>
            <ul className="text-left space-y-4 text-zinc-500 font-bold text-sm mb-12 flex-grow">
              <li className="flex items-center gap-3"><span className="text-[#00E5FF]">✔</span> 300 Credits / month</li>
              <li className="flex items-center gap-3"><span className="text-[#00E5FF]">✔</span> Faster AI generation</li>
              <li className="flex items-center gap-3"><span className="text-[#00E5FF]">✔</span> Priority Support</li>
            </ul>
            <button 
              onClick={() => handlePayment(199, 300)}
              className="w-full py-5 bg-white text-black font-black rounded-2xl text-lg hover:bg-zinc-200 transition-all uppercase tracking-tighter"
            >
              Get Starter
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-[#12151B] p-12 rounded-[48px] border-2 border-[#00E5FF] flex flex-col items-center text-center relative shadow-[0_0_50px_-12px_rgba(0,229,255,0.2)]">
            <div className="absolute top-[-18px] bg-[#00E5FF] text-black px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Recommended</div>
            <span className="text-[10px] font-black uppercase text-[#00E5FF] mb-6 tracking-widest bg-[#00E5FF]/10 px-4 py-1 rounded-full">💎 Pro Plan</span>
            <h3 className="text-6xl font-black mb-10 tracking-tighter">₹499<span className="text-sm font-normal text-zinc-700 uppercase tracking-widest ml-2">/ month</span></h3>
            <ul className="text-left space-y-4 text-zinc-300 font-bold text-sm mb-12 flex-grow">
              <li className="flex items-center gap-3"><span className="text-[#00E5FF]">✔</span> Unlimited scripts (fair usage)</li>
              <li className="flex items-center gap-3"><span className="text-[#00E5FF]">✔</span> Highest AI Intelligence</li>
              <li className="flex items-center gap-3"><span className="text-[#00E5FF]">✔</span> No Ads — ever 🚫</li>
            </ul>
            <button 
              onClick={() => handlePayment(499, 1500)} // Example: 1500 credits for Pro
              className="w-full py-5 bg-[#00E5FF] text-black font-black rounded-2xl text-lg hover:opacity-90 transition-all uppercase tracking-tighter"
            >
              Get Pro
            </button>
          </div>
        </div>
      </div>
      
      {/* FOOTER */}
      <footer className="border-t border-white/5 py-10 px-8 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-600">
        <div className="flex gap-8">
          <span>About</span>
          <span>Privacy Policy</span>
          <span>Terms</span>
        </div>
        <span>© 2026 HookLabe AI</span>
      </footer>

    </div>
  );
}
