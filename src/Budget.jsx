import React from 'react';
import { Plus, Trash2, Target } from 'lucide-react';

const Budget = ({ t, expenses, setExpenses, balance, totalSpent, totalLimit }) => {
  const addExpense = () => {
    const name = prompt(t.expenseNamePrompt);
    if (!name) return;
    setExpenses([...expenses, { id: Date.now(), name, amount: 0, limit: 100 }]);
  };

  const progressPercent = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
  const isOverTotal = totalSpent > totalLimit;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-3xl font-black text-white tracking-tight">{t.finances}</h2>
        <button onClick={addExpense} className="text-black bg-[#ccff00] font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_15px_rgba(204,255,0,0.3)]">
          <Plus size={16} strokeWidth={3} /> {t.add}
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-[#ccff00]/10 rounded-full blur-3xl pointer-events-none" />
         
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 relative z-10">{t.budgetLeft}</p>
         <h3 className={`text-5xl font-black tracking-tighter mb-6 relative z-10 ${balance < 0 ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'text-[#ccff00] drop-shadow-[0_0_15px_rgba(204,255,0,0.2)]'}`}>
           ${balance.toFixed(0)}
         </h3>
         
         <div className="flex justify-between items-end mb-3 relative z-10">
           <div>
             <p className="text-[9px] text-slate-500 font-bold uppercase mb-0.5 tracking-wider">{t.spent}</p>
             <p className="text-lg font-black text-white">${totalSpent}</p>
           </div>
           <div className="text-right">
             <p className="text-[9px] text-slate-500 font-bold uppercase mb-0.5 tracking-wider">{t.totalBudget}</p>
             <p className="text-lg font-black text-slate-300">${totalLimit}</p>
           </div>
         </div>
         
         <div className="h-2.5 bg-black rounded-full overflow-hidden border border-slate-800 relative z-10">
           <div 
             className={`h-full transition-all duration-700 ease-out ${isOverTotal ? 'bg-red-500' : 'bg-gradient-to-r from-[#ccff00]/60 to-[#ccff00]'}`} 
             style={{ width: `${Math.min(progressPercent, 100)}%` }} 
           />
         </div>
      </div>

      <div className="space-y-3">
        {expenses.map(exp => {
          const expProgress = Math.min((exp.amount / exp.limit) * 100, 100);
          const isExpOver = exp.amount > exp.limit;
          return (
            <div key={exp.id} className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 shadow-md transition-all hover:border-slate-600 group relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${isExpOver ? 'bg-red-500' : 'bg-[#ccff00]'}`} />
              
              <div className="flex justify-between items-center mb-3 pl-2">
                <div className="flex items-center gap-2">
                  <Target size={14} className={isExpOver ? 'text-red-400' : 'text-slate-400'} />
                  <span className="font-bold text-white text-sm">{exp.name}</span>
                </div>
                <button 
                  onClick={() => setExpenses(expenses.filter(e => e.id !== exp.id))}
                  className="text-slate-600 hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3 pl-2">
                <div className="bg-black/20 rounded-xl p-2 border border-slate-700/50">
                  <p className="text-[9px] text-slate-500 uppercase mb-1 font-bold tracking-wider">{t.spent}</p>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 text-sm">$</span>
                    <input 
                      type="number"
                      value={exp.amount}
                      onChange={(e) => setExpenses(expenses.map(x => x.id === exp.id ? {...x, amount: Number(e.target.value)} : x))}
                      className="bg-transparent text-white font-black w-full focus:outline-none placeholder-slate-600"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="bg-black/20 rounded-xl p-2 border border-slate-700/50">
                  <p className="text-[9px] text-slate-500 uppercase mb-1 font-bold tracking-wider">{t.limit}</p>
                  <div className="flex items-center gap-1">
                    <span className="text-[#ccff00]/50 text-sm">$</span>
                    <input 
                      type="number"
                      value={exp.limit}
                      onChange={(e) => setExpenses(expenses.map(x => x.id === exp.id ? {...x, limit: Number(e.target.value)} : x))}
                      className="bg-transparent text-[#ccff00] font-black w-full focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden ml-2 flex-1 max-w-[calc(100%-8px)] border border-black">
                <div 
                  className={`h-full transition-all duration-500 ${isExpOver ? 'bg-red-500' : 'bg-[#ccff00]'}`}
                  style={{ width: `${expProgress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Budget;
