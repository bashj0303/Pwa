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
    perPay: isFr ? '/ paie' : '/ pay',
    varExpensesTitle: isFr ? '🛒 Variables (Clic & Ajoute)' : '🛒 Variables (Click & Add)',
    left: isFr ? 'Reste' : 'Left',
    total: 'Total',
    max: 'Max',
    fixedTitle: isFr ? '🔒 Charges Fixes' : '🔒 Fixed Costs',
    namePrompt: isFr ? 'Nom ? (Astuce: mets un emoji 🍕 au début)' : 'Name? (Tip: put an emoji 🍕 first)',
    
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

    // Vocabulaire Sommaire et Objectifs
    goalTitle: isFr ? '🎯 Objectif Annuel (Épargne/Investissement)' : '🎯 Yearly Goal (Savings/Investments)',
    goalPrompt: isFr ? 'Quel est ton objectif annuel en $ ?' : 'What is your yearly goal in $?',
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
  const [summaryView, setSummaryView] = useState('month'); // 'month' ou 'year'

  // Objectif Annuel
  const [yearlyGoal, setYearlyGoal] = useState(() => {
    const saved = localStorage.getItem('pos_yearly_goal_v1');
    return saved ? Number(saved) : 5000;
  });

  useEffect(() => localStorage.setItem('pos_yearly_goal_v1', yearlyGoal.toString()), [yearlyGoal]);

  const loadMonthData = (monthIndex) => {
    const saved = localStorage.getItem(`pos_budget_v3_m${monthIndex}`);
    if (saved) return JSON.parse(saved);
    
    return {
      incomeBase: 0,
      incomeTS: 0,
      autoTransfers: [
        { id: 20, nameKey: 'catSavings', amount: 0 },
        { id: 21, nameKey: 'catInv', amount: 0 }
      ],
      variables: [
        { id: 1, nameKey: 'catGroc', spent: 0, max: 0 },
        { id: 2, nameKey: 'catGas', spent: 0, max: 0 },
        { id: 3, nameKey: 'catResto', spent: 0, max: 0 },
        { id: 4, nameKey: 'catHome', spent: 0, max: 0 },
        { id: 5, nameKey: 'catLeisure', spent: 0, max: 0 },
        { id: 6, nameKey: 'catHealth', spent: 0, max: 0 },
      ],
      fixed: [
        { id: 10, nameKey: 'catRent', amount: 0 },
        { id: 12, nameKey: 'catPhone', amount: 0 },
      ]
    };
  };

  const [monthData, setMonthData] = useState(() => loadMonthData(activeMonth));

  const handleSave = () => {
    localStorage.setItem(`pos_budget_v3_m${activeMonth}`, JSON.stringify(monthData));
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const changeMonth = (index) => {
    handleSave();
    setActiveMonth(index);
    setMonthData(loadMonthData(index));
  };

  // --- CALCULS DU MOIS ACTUEL ---
  const totalIncome = Number(monthData.incomeBase) + Number(monthData.incomeTS);
  const autoTransferPerPay = monthData.autoTransfers.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalAutoTransferMonthly = autoTransferPerPay * 2;
  const totalFixed = monthData.fixed.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalVariablesSpent = monthData.variables.reduce((sum, item) => sum + Number(item.spent), 0);
  
  const totalOutgoing = totalAutoTransferMonthly + totalFixed + totalVariablesSpent;
  const pocketMoney = totalIncome - totalOutgoing;

  // --- CALCULS DE L'ANNÉE COMPLÈTE ---
  let yearlyIncome = 0;
  let yearlySaved = 0;
  let yearlyFixed = 0;
  let yearlyVar = 0;

  for (let i = 0; i < 12; i++) {
    // Prendre les données en direct pour le mois actif, ou lire la sauvegarde pour les autres mois
    const dataToCalculate = (i === activeMonth) ? monthData : loadMonthData(i);
    
    yearlyIncome += Number(dataToCalculate.incomeBase) + Number(dataToCalculate.incomeTS);
    yearlySaved += dataToCalculate.autoTransfers.reduce((sum, item) => sum + Number(item.amount), 0) * 2;
    yearlyFixed += dataToCalculate.fixed.reduce((sum, item) => sum + Number(item.amount), 0);
    yearlyVar += dataToCalculate.variables.reduce((sum, item) => sum + Number(item.spent), 0);
  }
  
  const yearlyOutgoing = yearlySaved + yearlyFixed + yearlyVar;

  // Calcul progression objectif
  const goalProgress = yearlyGoal > 0 ? Math.min((yearlySaved / yearlyGoal) * 100, 100) : 0;

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
    <div className="space-y-4 animate-in fade-in duration-300 pb-10 overflow-hidden">
      
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

      {/* SÉLECTEUR DE MOIS (Scrolable) */}
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
              <span className="text-xs font-bold text-slate-300 flex-1 ml-1 truncate">
                {a.nameKey ? vocab[a.nameKey] : a.name}
              </span>
              <input 
                type="number" placeholder="0" value={a.amount === 0 ? '' : a.amount} 
                onChange={e => updateListItem('autoTransfers', a.id, 'amount', e.target.value)} 
                className="bg-transparent text-[#ccff00] font-black w-14 text-right text-[16px] focus:outline-none placeholder-slate-600" 
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
                  <span className="font-bold text-white text-xs">
                    {v.nameKey ? vocab[v.nameKey] : v.name}
                  </span>
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
                  
                  <button onClick={() => {
                    const itemName = v.nameKey ? vocab[v.nameKey] : v.name;
                    const add = prompt(`+ ${itemName} ?`, "");
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
              <span className="font-bold text-slate-300 text-xs truncate flex-1">
                {f.nameKey ? vocab[f.nameKey] : f.name}
              </span>
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
        
        {/* NOUVEAU : OBJECTIF ANNUEL */}
        <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-2xl">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-white font-bold text-xs flex items-center gap-1.5">
              <Target size={14} className="text-[#ccff00]" /> {vocab.goalTitle}
            </h4>
            <button 
              onClick={() => {
                const newGoal = prompt(vocab.goalPrompt, yearlyGoal);
                if(newGoal) setYearlyGoal(Number(newGoal));
              }}
              className="text-[#ccff00] font-black text-xs px-2 py-1 bg-black/30 rounded-lg hover:bg-[#ccff00]/20"
            >
              / {yearlyGoal} $
            </button>
          </div>
          <div className="flex justify-between items-end mb-1">
            <span className="text-[10px] font-bold text-slate-400">{goalProgress.toFixed(1)}%</span>
            <span className="text-sm font-black text-[#ccff00]">{yearlySaved} $</span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-[#ccff00]/50 to-[#ccff00] transition-all duration-700"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>

        {/* NOUVEAU : SOMMAIRE AVEC BOUTON BASCULE (MOIS / ANNÉE) */}
        <div className="bg-slate-900 border border-slate-700 p-5 rounded-[2rem] shadow-xl relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
            <BarChart3 size={140} />
          </div>
          
          <div className="flex justify-between items-center mb-4 relative z-10">
            <h4 className="text-white font-black text-sm flex items-center gap-2">
              <PieChart size={16} className="text-[#ccff00]" />
              {summaryView === 'month' ? vocab.summaryMonth : vocab.summaryYear}
            </h4>
            
            {/* Boutons Bascule */}
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
