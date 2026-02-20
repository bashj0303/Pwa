import React from 'react';
import { Activity, CheckCircle2, Circle, Gift, ShoppingBag, PieChart, ArrowRight } from 'lucide-react';

const Dashboard = ({ t, balance, xp, setXp, protocols, setProtocols, setActiveTab }) => {
  const getNextTier = () => {
    if (xp < 500) return { name: t.freeShipping, target: 500 };
    if (xp < 1500) return { name: t.discount20, target: 1500 };
    return { name: t.freeHoodie, target: 5000 };
  };

  const currentTier = getNextTier();
  const xpProgress = Math.min((xp / currentTier.target) * 100, 100);

  const toggleProtocol = (id) => {
    setProtocols(protocols.map(p => {
      if (p.id === id) {
        const isNowDone = !p.done;
        setXp(prevXp => isNowDone ? prevXp + 10 : Math.max(0, prevXp - 10));
        return { ...p, done: isNowDone };
      }
      return p;
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* GRINDWEAR REWARDS */}
      <div className="bg-slate-800 border border-slate-700 p-5 rounded-[2rem] shadow-lg relative overflow-hidden">
        <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
          <Gift size={160} />
        </div>
        
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <h3 className="text-white font-black text-lg tracking-tight flex items-center gap-2">
              <Gift size={18} className="text-[#ccff00]" /> {t.rewardsTitle}
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{t.earnedXp}</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-[#ccff00]">{xp}</span>
            <span className="text-[10px] text-slate-400 ml-1 font-bold">{t.xpPoints}</span>
          </div>
        </div>

        <div className="mb-2 flex justify-between items-end relative z-10">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.nextTier}</span>
          <span className="text-xs font-black text-white">{currentTier.name} ({currentTier.target} XP)</span>
        </div>

        <div className="h-3 bg-slate-900 rounded-full overflow-hidden relative z-10 border border-slate-700/50">
          <div 
            className="h-full bg-gradient-to-r from-[#ccff00]/60 to-[#ccff00] transition-all duration-700 ease-out shadow-[0_0_10px_rgba(204,255,0,0.5)]"
            style={{ width: `${xpProgress}%` }}
          />
        </div>

        <button className="w-full mt-5 bg-slate-900 border border-slate-700 hover:border-[#ccff00]/50 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors relative z-10">
          <ShoppingBag size={14} className="text-[#ccff00]" />
          {t.visitStore}
        </button>
      </div>

      {/* BUDGET CONNECTÉ */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 p-6 rounded-[2rem] shadow-lg flex justify-between items-center relative overflow-hidden">
        <div className="absolute -bottom-8 -left-8 opacity-10"><PieChart size={120}/></div>
        <div className="relative z-10">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{t.budgetLeft}</p>
          <h2 className={`text-4xl font-black ${balance < 0 ? 'text-red-500' : 'text-white'}`}>
            ${balance.toFixed(0)}
          </h2>
        </div>
        <button onClick={() => setActiveTab('budget')} className="p-3 bg-[#ccff00]/10 rounded-2xl text-[#ccff00] hover:bg-[#ccff00]/20 transition-colors z-10">
          <ArrowRight size={20} />
        </button>
      </div>

      <section>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity size={18} className="text-[#ccff00]" /> {t.biohacking}
        </h3>
        <div className="space-y-3">
          {protocols.map(p => (
            <button 
              key={p.id}
              onClick={() => toggleProtocol(p.id)}
              className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all ${
                p.done 
                ? 'bg-[#ccff00]/10 border-[#ccff00] text-[#ccff00]' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              {p.done ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              <span className="font-bold text-sm text-left flex-1">{p.name}</span>
              <span className={`text-[10px] font-black transition-opacity ${p.done ? 'opacity-100 text-[#ccff00]' : 'opacity-0'}`}>+10 XP</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
