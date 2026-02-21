import React from 'react';
import { Activity, CheckCircle2, Circle, PieChart, ArrowRight } from 'lucide-react';

const Dashboard = ({ t, balance, xp, setXp, protocols, setProtocols, setActiveTab }) => {
  
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
      
      {/* BUDGET CONNECTÉ */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 p-6 rounded-[2rem] shadow-lg flex justify-between items-center relative overflow-hidden">
        <div className="absolute -bottom-8 -left-8 opacity-10"><PieChart size={120}/></div>
        <div className="relative z-10">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{t.budgetLeft}</p>
          <h2 className={`text-4xl font-black ${balance < 0 ? 'text-red-500' : 'text-white'}`}>
            {balance.toFixed(0)} $
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
