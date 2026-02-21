import React, { useState } from 'react';
import { Plus, Trash2, Save, Check } from 'lucide-react';

const Budget = ({ t }) => {
  // Astuce pour lier la langue directement avec ton bouton principal dans App.js
  const isFr = t.month === 'mois';

  const vocab = {
    title: isFr ? '📈 Budget 2026' : '📈 Budget 2026',
    save: isFr ? 'SAUVEGARDER' : 'SAVE',
    saved: isFr ? 'SAUVEGARDÉ!' : 'SAVED!',
    months: isFr 
      ? ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    pocket: isFr ? 'Reste en poche' : 'Left in Pocket',
    income: isFr ? 'Revenus' : 'Income',
    base: isFr ? 'Base' : 'Base',
    ts: isFr ? '+ TS' : '+ Overtime',
    autoTransferTitle: isFr ? '🏦 Virements Auto' : '🏦 Auto Transfers',
    perPay: isFr ? '/ paie' : '/ pay',
    varExpensesTitle: isFr ? '🛒 Variables (Clic & Ajoute)' : '🛒 Variables (Click & Add)',
    left: isFr ? 'Reste' : 'Left',
    total: 'Total',
    max: 'Max',
    fixedTitle: isFr ? '🔒 Charges Fixes' : '🔒 Fixed Costs',
    namePrompt: isFr ? 'Nom ?' : 'Name?'
  };

  const [activeMonth, setActiveMonth] = useState(new Date().getMonth());
  const [showSaved, setShowSaved] = useState(false);

  // Charger les données du mois actif (tout à 0 par défaut)
  const loadMonthData = (monthIndex) => {
    const saved = localStorage.getItem(`pos_budget_m${monthIndex}`);
    if (saved) return JSON.parse(saved);
    return {
      incomeBase: 0,
      incomeTS: 0,
      autoTransfers: [
        { id: 20, name: 'Épargne', amount: 0 },
        { id: 21, name: 'Investissement', amount: 0 }
      ],
      variables: [
        { id: 1, name: 'Épicerie', spent: 0, max: 0 },
        { id: 2, name: 'Essence', spent: 0, max: 0 },
        { id: 3, name: 'Resto', spent: 0, max: 0 },
        { id: 4, name: 'Divers Maison', spent: 0, max: 0 },
        { id: 5, name: 'Sortie / Loisirs', spent: 0, max: 0 },
        { id: 6, name: 'Perso / Santé', spent: 0, max: 0 },
      ],
      fixed: [
        { id: 10, name: '🏠 Loyer', amount: 0 },
        { id: 12, name: '📱 Cellulaire', amount: 0 },
      ]
    };
  };

  const [monthData, setMonthData] = useState(() => loadMonthData(activeMonth));

  const handleSave = () => {
    localStorage.setItem(`pos_budget_m${activeMonth}`, JSON.stringify(monthData));
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const changeMonth = (index) => {
    handleSave();
    setActiveMonth(index);
    setMonthData(loadMonthData(index));
  };

  // --- CALCULS ---
  const totalIncome = Number(monthData.incomeBase) + Number(monthData.incomeTS);
  const autoTransferPerPay = monthData.autoTransfers.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalAutoTransferMonthly = autoTransferPerPay * 2; // X2 pour 2 paies par mois
  const totalFixed = monthData.fixed.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalVariablesSpent = monthData.variables.reduce((sum, item) => sum + Number(item.spent), 0);
  
  const pocketMoney = totalIncome - totalAutoTransferMonthly - totalFixed - totalVariablesSpent;

  // --- FONCTIONS DE GESTION ---
  const updateData = (key, value) => setMonthData(prev => ({ ...prev, [key]: value }));

  const updateListItem = (listName, id, field, value) => {
    setMonthData(prev => ({
      ...prev,
      [listName]: prev[listName].map(item => item.id === id ? { ...item, [field]: Number(value) } : item)
    }));
  };

  const addListItem = (listName, defaultItem) => {
    const name = prompt(vocab.namePrompt);
    if (name) {
      setMonthData(prev => ({
        ...prev,
        [listName]: [...prev[listName], { ...defaultItem, id: Date.now(), name }]
      }));
    }
  };

  const deleteListItem = (listName, id) => {
    if(window.confirm(isFr ? "Supprimer ?" : "Delete?")) {
      setMonthData(prev => ({
        ...prev,
        [listName]: prev[listName].filter(item => item.id !== id)
      }));
    }
  };

  const addVariableAmount = (id, amountToAdd) => {
    setMonthData(prev => ({
      ...prev,
      variables: prev.variables.map(v => v.id === id ? { ...v, spent: v.spent + amountToAdd } : v)
    }));
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 pb-10">
      
      {/* HEADER SLIM */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-white">{vocab.title}</h2>
        <button 
          onClick={handleSave}
          className={`px-3 py-1.5 rounded-lg font-black text-[10px] flex items-center gap-1.5 transition-all ${showSaved ? 'bg-green-500 text-white' : 'bg-[#ccff00] text-black hover:scale-105'}`}
        >
          {showSaved ? <Check size={14} /> : <Save size={14} />}
          {showSaved ? vocab.saved : vocab.save}
        </button>
      </div>

      {/* SÉLECTEUR DE MOIS */}
      <div className="flex overflow-x-auto gap-1.5 pb-2 no-scrollbar">
        {vocab.months.map((m, i) => (
          <button
            key={i}
            onClick={() => changeMonth(i)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold transition-colors ${activeMonth === i ? 'bg-[#ccff00] text-black' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* RESTE EN POCHE COMPACT */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#ccff00]/10 rounded-full blur-2xl pointer-events-none" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 relative z-10">{vocab.pocket}</p>
        <h3 className={`text-4xl font-black tracking-tighter relative z-10 ${pocketMoney < 0 ? 'text-red-500' : 'text-[#ccff00]'}`}>
          {pocketMoney.toFixed(0)} $
        </h3>
      </div>

      {/* REVENUS SLIM */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700">
          <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">{vocab.base}</p>
          <input 
            type="number" placeholder="0" value={monthData.incomeBase === 0 ? '' : monthData.incomeBase} 
            onChange={(e) => updateData('incomeBase', e.target.value)}
            className="bg-transparent text-white font-black text-lg w-full focus:outline-none placeholder-slate-600"
          />
        </div>
        <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700">
          <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">{vocab.ts}</p>
          <input 
            type="number" placeholder="0" value={monthData.incomeTS === 0 ? '' : monthData.incomeTS} 
            onChange={(e) => updateData('incomeTS', e.target.value)}
            className="bg-transparent text-white font-black text-lg w-full focus:outline-none placeholder-slate-600"
          />
        </div>
      </div>

      {/* VIREMENTS AUTO SLIM */}
      <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-white font-bold text-xs">{vocab.autoTransferTitle}</h4>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#ccff00] font-black">{autoTransferPerPay} $ {vocab.perPay}</span>
            <button onClick={() => addListItem('autoTransfers', {amount: 0})} className="text-[#ccff00] p-1"><Plus size={14}/></button>
          </div>
        </div>
        <div className="space-y-1.5">
          {monthData.autoTransfers.map(a => (
            <div key={a.id} className="flex items-center bg-black/20 p-1.5 rounded-lg border border-slate-700/30">
              <span className="text-xs font-bold text-slate-300 flex-1 ml-1 truncate">{a.name}</span>
              <input 
                type="number" placeholder="0" value={a.amount === 0 ? '' : a.amount} 
                onChange={e => updateListItem('autoTransfers', a.id, 'amount', e.target.value)} 
                className="bg-transparent text-[#ccff00] font-black w-14 text-right text-xs focus:outline-none placeholder-slate-600" 
              />
              <span className="text-[10px] text-slate-500 ml-1">$</span>
              <button onClick={() => deleteListItem('autoTransfers', a.id)} className="text-slate-600 hover:text-red-400 p-1 ml-1"><Trash2 size={12}/></button>
            </div>
          ))}
        </div>
      </div>

      {/* DÉPENSES VARIABLES SLIM */}
      <div>
        <div className="flex justify-between items-center mb-2 mt-4">
          <h4 className="text-white font-bold text-xs">{vocab.varExpensesTitle}</h4>
          <button onClick={() => addListItem('variables', {spent: 0, max: 0})} className="text-[#ccff00] bg-slate-800 p-1.5 rounded-lg">
            <Plus size={14} />
          </button>
        </div>
        
        <div className="space-y-2">
          {monthData.variables.map(v => {
            const left = v.max - v.spent;
            const isOver = left < 0;
            return (
              <div key={v.id} className="bg-slate-800/40 border border-slate-700/50 p-2.5 rounded-xl">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-white text-xs">{v.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black ${isOver ? 'text-red-400' : 'text-emerald-400'}`}>
                      {vocab.left}: {left} $
                    </span>
                    <button onClick={() => deleteListItem('variables', v.id)} className="text-slate-600 hover:text-red-400">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-black/30 rounded-lg p-1.5 flex items-center border border-slate-700/30">
                    <span className="text-[9px] text-slate-500 font-bold w-8">{vocab.total}</span>
                    <input 
                      type="number" placeholder="0" value={v.spent === 0 ? '' : v.spent} 
                      onChange={(e) => updateListItem('variables', v.id, 'spent', e.target.value)} 
                      className="bg-transparent text-white font-bold w-full text-right focus:outline-none text-xs placeholder-slate-600" 
                    />
                  </div>
                  
                  <button onClick={() => {
                    const add = prompt(`+ ${v.name} ?`, "10");
                    if(add) addVariableAmount(v.id, Number(add));
                  }} className="w-7 h-7 bg-[#ccff00]/10 text-[#ccff00] rounded-md flex items-center justify-center font-black text-sm hover:bg-[#ccff00] hover:text-black">
                    +
                  </button>

                  <div className="flex-1 bg-black/30 rounded-lg p-1.5 flex items-center border border-slate-700/30">
                    <span className="text-[9px] text-slate-500 font-bold w-6">{vocab.max}</span>
                    <input 
                      type="number" placeholder="0" value={v.max === 0 ? '' : v.max} 
                      onChange={(e) => updateListItem('variables', v.id, 'max', e.target.value)} 
                      className="bg-transparent text-[#ccff00] font-bold w-full text-right focus:outline-none text-xs placeholder-slate-600" 
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CHARGES FIXES SLIM */}
      <div>
        <div className="flex justify-between items-center mb-2 mt-4">
          <h4 className="text-white font-bold text-xs">{vocab.fixedTitle}</h4>
          <button onClick={() => addListItem('fixed', {amount: 0})} className="text-[#ccff00] bg-slate-800 p-1.5 rounded-lg">
            <Plus size={14} />
          </button>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden divide-y divide-slate-700/50">
          {monthData.fixed.map(f => (
            <div key={f.id} className="p-2.5 flex justify-between items-center">
              <span className="font-bold text-slate-300 text-xs truncate flex-1">{f.name}</span>
              <div className="flex items-center gap-2">
                <input 
                  type="number" placeholder="0" value={f.amount === 0 ? '' : f.amount} 
                  onChange={(e) => updateListItem('fixed', f.id, 'amount', e.target.value)}
                  className="bg-transparent text-white font-black w-14 text-right focus:outline-none text-xs placeholder-slate-600"
                />
                <span className="text-[10px] text-slate-500">$</span>
                <button onClick={() => deleteListItem('fixed', f.id)} className="text-slate-600 hover:text-red-400 p-1">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Budget;
