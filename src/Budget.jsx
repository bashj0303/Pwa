import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Check, PieChart, Target, BarChart3 } from 'lucide-react';

const Budget = ({ t }) => {
  const isFr = t.month === 'mois';
  const currentYear = new Date().getFullYear();

  const vocab = {
    title: `📈 Budget ${currentYear}`,
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
    freq1: isFr ? '1 / mois' : '1 / month',
    freq2: isFr ? '2 / mois (Aux 2 sem)' : '2 / month (Bi-weekly)',
    freq4: isFr ? '4 / mois (Hebdo)' : '4 / month (Weekly)',
    varExpensesTitle: isFr ? '🛒 Variables (Clic & Ajoute)' : '🛒 Variables (Click & Add)',
    left: isFr ? 'Reste' : 'Left',
    total: 'Total',
    max: 'Max',
    fixedTitle: isFr ? '🔒 Charges Fixes' : '🔒 Fixed Costs',
    namePrompt: isFr ? 'Nom ? (Astuce: mets un emoji 🍕 au début)' : 'Name? (Tip: put an emoji 🍕 first)',
    
    // Valeurs par défaut générées selon la langue
    catSavings: isFr ? '💰 Épargne' : '💰 Savings',
    catInv: isFr ? '📈 Investissement' : '📈 Investment',
    catGroc: isFr ? '🛒 Épicerie' : '🛒 Groceries',
    catGas: isFr ? '⛽ Essence' : '⛽ Gas',
    catResto: isFr ? '🍔 Resto' : '🍔 Restaurants',
    catHome: isFr ? '🏠 Divers Maison' : '🏠 Home Misc',
    catLeisure: isFr ? '🎟️ Sortie / Loisirs' : '🎟️ Entertainment',
    catHealth: isFr ? '💊 Perso / Santé' : '💊 Health & Personal',
    catRent: isFr ? '🏠 Loyer' : '🏠 Rent',
    catPhone: isFr ? '📱 Cellulaire' : '📱 Phone',

    goalsTitle: isFr ? '🎯 Objectifs (Inter-mois)' : '🎯 Goals (Inter-month)',
    goalPrompt: isFr ? 'Objectif annuel ($) ? (Mettre 0 pour supprimer)' : 'Yearly goal ($)? (Set 0 to remove)',
    noGoals: isFr ? "Cliquez sur 🎯 à côté d'un virement auto pour créer un objectif." : "Click 🎯 next to an auto transfer to set a goal.",
    
    summaryMonth: isFr ? 'Sommaire du Mois' : 'Monthly Summary',
    summaryYear: isFr ? 'Sommaire de l\'Année' : 'Yearly Summary',
    btnMonth: isFr ? 'Mois' : 'Month',
    btnYear: isFr ? 'Année' : 'Year',
    sumIncome: isFr ? 'Revenus' : 'Income',
    sumSaved: isFr ? 'Mis de côté' : 'Saved',
    sumFixed: isFr ? 'Charges Fixes' : 'Fixed Costs',
    sumVar: isFr ? 'Variables' : 'Variables',
    sumTotalOut: isFr ? 'Total Sortant' : 'Total Outgoing',
  };

  const [activeMonth, setActiveMonth] = useState(new Date().getMonth());
  const [showSaved, setShowSaved] = useState(false);
  const [summaryView, setSummaryView] = useState('month');

  // NOUVEAU : Fréquence de paie et Objectifs globaux (sauvegardés indépendamment des mois)
  const [payFreq, setPayFreq] = useState(() => {
    const saved = localStorage.getItem('pos_pay_freq_v4');
    return saved ? Number(saved) : 2; // Par défaut : 2 paies / mois
  });

  const [targets, setTargets] = useState(() => {
    const saved = localStorage.getItem('pos_targets_v4');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => localStorage.setItem('pos_pay_freq_v4', payFreq.toString()), [payFreq]);
  useEffect(() => localStorage.setItem('pos_targets_v4', JSON.stringify(targets)), [targets]);

  // V4 : On reset pour avoir des données propres avec le nouveau système
  const loadMonthData = (monthIndex) => {
    const saved = localStorage.getItem(`pos_budget_v4_m${monthIndex}`);
    if (saved) return JSON.parse(saved);
    
    return {
      incomeBase: 0,
      incomeTS: 0,
      autoTransfers: [
        { id: 20, name: vocab.catSavings, amount: 0 },
        { id: 21, name: vocab.catInv, amount: 0 }
      ],
      variables: [
        { id: 1, name: vocab.catGroc, spent: 0, max: 0 },
        { id: 2, name: vocab.catGas, spent: 0, max: 0 },
        { id: 3, name: vocab.catResto, spent: 0, max: 0 },
        { id: 4, name: vocab.catHome, spent: 0, max: 0 },
        { id: 5, name: vocab.catLeisure, spent: 0, max: 0 },
        { id: 6, name: vocab.catHealth, spent: 0, max: 0 },
      ],
      fixed: [
        { id: 10, name: vocab.catRent, amount: 0 },
        { id: 12, name: vocab.catPhone, amount: 0 },
      ]
    };
  };

  const [monthData, setMonthData] = useState(() => loadMonthData(activeMonth));

  const handleSave = () => {
    localStorage.setItem(`pos_budget_v4_m${activeMonth}`, JSON.stringify(monthData));
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
  const totalAutoTransferMonthly = autoTransferPerPay * payFreq; // Dynamique selon la fréquence !
  const totalFixed = monthData.fixed.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalVariablesSpent = monthData.variables.reduce((sum, item) => sum + Number(item.spent), 0);
  
  const totalOutgoing = totalAutoTransferMonthly + totalFixed + totalVariablesSpent;
  const pocketMoney = totalIncome - totalOutgoing;

  let yearlyIncome = 0;
  let yearlySaved = 0;
  let yearlyFixed = 0;
  let yearlyVar = 0;

  for (let i = 0; i < 12; i++) {
    const dataToCalc = (i === activeMonth) ? monthData : loadMonthData(i);
    yearlyIncome += Number(dataToCalc.incomeBase) + Number(dataToCalc.incomeTS);
    yearlySaved += dataToCalc.autoTransfers.reduce((sum, item) => sum + Number(item.amount), 0) * payFreq;
    yearlyFixed += dataToCalc.fixed.reduce((sum, item) => sum + Number(item.amount), 0);
    yearlyVar += dataToCalc.variables.reduce((sum, item) => sum + Number(item.spent), 0);
  }
  const yearlyOutgoing = yearlySaved + yearlyFixed + yearlyVar;

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

  const setGoalTarget = (name) => {
    const current = targets[name] || '';
    const val = prompt(`${vocab.goalPrompt}\n[ ${name} ]`, current);
    if (val !== null) {
      const num = Number(val);
      const newTargets = { ...targets };
      if (num > 0) newTargets[name] = num;
      else delete newTargets[name]; // Supprime si 0
      setTargets(newTargets);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 pb-10 overflow-hidden">
      
      {/* HEADER */}
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
      <div className="flex overflow-x-auto gap-1.5 pb-2 no-scrollbar snap-x w-full">
        {vocab.months.map((m, i) => (
          <button
            key={i}
            onClick={() => changeMonth(i)}
            className={`shrink-0 snap-start whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold transition-colors ${activeMonth === i ? 'bg-[#ccff00] text-black' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
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
            className="bg-transparent text-white font-black text-[16px] w-full focus:outline-none placeholder-slate-600"
          />
        </div>
        <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700">
          <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">{vocab.ts}</p>
          <input 
            type="number" placeholder="0" value={monthData.incomeTS === 0 ? '' : monthData.incomeTS} 
            onChange={(e) => updateData('incomeTS', e.target.value)}
            className="bg-transparent text-white font-black text-[16px] w-full focus:outline-none placeholder-slate-600"
          />
        </div>
      </div>

      {/* VIREMENTS AUTO (AVEC FRÉQUENCE DE PAIE ET BOUTON TARGET) */}
      <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-white font-bold text-xs">{vocab.autoTransferTitle}</h4>
          {/* Sélecteur de Fréquence */}
          <select 
            value={payFreq} 
            onChange={(e) => setPayFreq(Number(e.target.value))}
            className="bg-black/50 border border-slate-700 text-[#ccff00] text-[10px] font-bold rounded-lg p-1.5 focus:outline-none"
          >
            <option value={1}>{vocab.freq1}</option>
            <option value={2}>{vocab.freq2}</option>
            <option value={4}>{vocab.freq4}</option>
          </select>
        </div>
        
        <div className="space-y-1.5">
          {monthData.autoTransfers.map(a => (
            <div key={a.id} className="flex items-center bg-black/20 p-1.5 rounded-lg border border-slate-700/30">
              <span className="text-xs font-bold text-slate-300 flex-1 ml-1 truncate">{a.name}</span>
              <input 
                type="number" placeholder="0" value={a.amount === 0 ? '' : a.amount} 
                onChange={e => updateListItem('autoTransfers', a.id, 'amount', e.target.value)} 
                className="bg-transparent text-[#ccff00] font-black w-14 text-right text-[16px] focus:outline-none placeholder-slate-600" 
              />
              <span className="text-[10px] text-slate-500 ml-1 mr-2">$</span>
              
              {/* BOUTON CIBLE (GOAL) */}
              <button 
                onClick={() => setGoalTarget(a.name)} 
                className={`p-1.5 rounded-md transition-colors ${targets[a.name] ? 'bg-[#ccff00]/20 text-[#ccff00]' : 'text-slate-500 hover:text-[#ccff00] hover:bg-slate-800'}`}
                title="Lier à un objectif"
              >
                <Target size={14} />
              </button>
              
              <button onClick={() => deleteListItem('autoTransfers', a.id)} className="text-slate-600 hover:text-red-400 p-1.5 ml-1">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button onClick={() => addListItem('autoTransfers', {amount: 0})} className="w-full mt-2 py-1.5 border border-dashed border-slate-600 rounded-lg text-slate-500 hover:text-[#ccff00] hover:border-[#ccff00]/50 transition-colors flex justify-center">
            <Plus size={14}/>
          </button>
        </div>
      </div>

      {/* DÉPENSES VARIABLES */}
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
                      className="bg-transparent text-white font-bold w-full text-right focus:outline-none text-[16px] placeholder-slate-600" 
                    />
                  </div>
                  
                  {/* AJOUT RAPIDE AVEC CASE VIDE */}
                  <button onClick={() => {
                    const add = prompt(`+ ${v.name} ?`, "");
                    if(add) addVariableAmount(v.id, Number(add));
                  }} className="w-8 h-8 bg-[#ccff00]/10 text-[#ccff00] rounded-md flex items-center justify-center font-black text-sm hover:bg-[#ccff00] hover:text-black">
                    +
                  </button>

                  <div className="flex-1 bg-black/30 rounded-lg p-1.5 flex items-center border border-slate-700/30">
                    <span className="text-[9px] text-slate-500 font-bold w-6">{vocab.max}</span>
                    <input 
                      type="number" placeholder="0" value={v.max === 0 ? '' : v.max} 
                      onChange={(e) => updateListItem('variables', v.id, 'max', e.target.value)} 
                      className="bg-transparent text-[#ccff00] font-bold w-full text-right focus:outline-none text-[16px] placeholder-slate-600" 
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CHARGES FIXES */}
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
                  className="bg-transparent text-white font-black w-16 text-right focus:outline-none text-[16px] placeholder-slate-600"
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

      <div className="pt-4 border-t border-slate-800/80 mt-8 space-y-4">
        
        {/* NOUVEAU : OBJECTIFS MULTIPLES (GOALS) */}
        <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-2xl">
          <h4 className="text-white font-bold text-xs flex items-center gap-1.5 mb-3">
            <Target size={14} className="text-[#ccff00]" /> {vocab.goalsTitle}
          </h4>
          
          {Object.keys(targets).length === 0 ? (
            <p className="text-[10px] text-slate-500 italic text-center py-2">{vocab.noGoals}</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(targets).map(([goalName, goalTarget]) => {
                // Calculer tout l'argent mis de côté pour CE virement spécifique sur l'année
                let savedForThisGoal = 0;
                for (let i = 0; i < 12; i++) {
                  const mData = (i === activeMonth) ? monthData : loadMonthData(i);
                  const matchingTransfers = mData.autoTransfers.filter(a => a.name === goalName);
                  savedForThisGoal += matchingTransfers.reduce((sum, item) => sum + Number(item.amount), 0) * payFreq;
                }
                
                const progress = Math.min((savedForThisGoal / goalTarget) * 100, 100);

                return (
                  <div key={goalName}>
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-xs font-bold text-white truncate max-w-[50%]">{goalName}</span>
                      <div className="text-right">
                        <span className="text-sm font-black text-[#ccff00]">{savedForThisGoal} $</span>
                        <span className="text-[10px] text-slate-500 ml-1">/ {goalTarget} $</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
                      <div 
                        className="h-full bg-gradient-to-r from-[#ccff00]/50 to-[#ccff00] transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SOMMAIRE AVEC BOUTON BASCULE (MOIS / ANNÉE) */}
        <div className="bg-slate-900 border border-slate-700 p-5 rounded-[2rem] shadow-xl relative overflow-hidden mb-8">
          <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
            <BarChart3 size={140} />
          </div>
          
          <div className="flex justify-between items-center mb-4 relative z-10">
            <h4 className="text-white font-black text-sm flex items-center gap-2">
              <PieChart size={16} className="text-[#ccff00]" />
              {summaryView === 'month' ? vocab.summaryMonth : vocab.summaryYear}
            </h4>
            
            <div className="flex bg-black/40 p-1 rounded-lg border border-slate-700/50">
              <button 
                onClick={() => setSummaryView('month')}
                className={`text-[9px] font-bold px-3 py-1 rounded-md transition-colors ${summaryView === 'month' ? 'bg-[#ccff00] text-black' : 'text-slate-400 hover:text-white'}`}
              >
                {vocab.btnMonth}
              </button>
              <button 
                onClick={() => setSummaryView('year')}
                className={`text-[9px] font-bold px-3 py-1 rounded-md transition-colors ${summaryView === 'year' ? 'bg-[#ccff00] text-black' : 'text-slate-400 hover:text-white'}`}
              >
                {vocab.btnYear}
              </button>
            </div>
          </div>
          
          <div className="space-y-2 relative z-10">
            <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-xl border border-slate-800/50">
              <span className="text-[11px] font-bold text-emerald-400">{vocab.sumIncome}</span>
              <span className="text-sm font-black text-emerald-400">+{summaryView === 'month' ? totalIncome : yearlyIncome} $</span>
            </div>
            
            <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-xl border border-slate-800/50">
              <span className="text-[11px] font-bold text-[#ccff00]">{vocab.sumSaved}</span>
              <span className="text-sm font-black text-[#ccff00]">{summaryView === 'month' ? totalAutoTransferMonthly : yearlySaved} $</span>
            </div>

            <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-xl border border-slate-800/50">
              <span className="text-[11px] font-bold text-slate-300">{vocab.sumFixed}</span>
              <span className="text-sm font-black text-slate-300">{summaryView === 'month' ? totalFixed : yearlyFixed} $</span>
            </div>

            <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-xl border border-slate-800/50">
              <span className="text-[11px] font-bold text-slate-300">{vocab.sumVar}</span>
              <span className="text-sm font-black text-slate-300">{summaryView === 'month' ? totalVariablesSpent : yearlyVar} $</span>
            </div>

            <div className="h-px w-full bg-slate-700/50 my-3"></div>

            <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-red-500/20">
              <span className="text-xs font-black text-red-400 uppercase tracking-wider">{vocab.sumTotalOut}</span>
              <span className="text-base font-black text-red-400">
                {summaryView === 'month' ? totalOutgoing : yearlyOutgoing} $
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Budget;
