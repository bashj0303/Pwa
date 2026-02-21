
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ChevronRight, Check } from 'lucide-react';

const Budget = ({ t }) => {
  // Langue locale pour les nouveaux termes (détectée via localStorage)
  const [lang, setLang] = useState('en');
  useEffect(() => {
    const savedLang = localStorage.getItem('pos_lang');
    if (savedLang) setLang(JSON.parse(savedLang));
  }, []);

  const isFr = lang === 'fr';

  const vocab = {
    title: isFr ? '📈 Mon Budget 2026' : '📈 My Budget 2026',
    save: isFr ? 'SAUVEGARDER' : 'SAVE',
    saved: isFr ? 'SAUVEGARDÉ!' : 'SAVED!',
    months: isFr 
      ? ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    pocket: isFr ? 'Reste en poche' : 'Left in Pocket',
    income: isFr ? 'Revenus' : 'Income',
    base: isFr ? 'Base' : 'Base',
    ts: isFr ? '+ TS' : '+ Overtime',
    autoTransferTitle: '🏦 Virement Automatique',
    perPay: isFr ? '/ paie' : '/ pay',
    varExpensesTitle: isFr ? '🛒 Dépenses Variables (Clic & Ajoute)' : '🛒 Variable Expenses (Click & Add)',
    left: isFr ? 'Reste' : 'Left',
    total: 'Total',
    max: 'Max',
    fixedTitle: '🔒 Charges Fixes',
    addCategory: isFr ? 'Ajouter Catégorie' : 'Add Category',
    addFixed: isFr ? 'Ajouter Charge' : 'Add Fixed Cost',
    namePrompt: isFr ? 'Nom ?' : 'Name?'
  };

  // --- ÉTATS LOCAUX DU BUDGET ---
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth());
  const [showSaved, setShowSaved] = useState(false);

  // Charger les données du mois actif
  const loadMonthData = (monthIndex) => {
    const saved = localStorage.getItem(`pos_budget_m${monthIndex}`);
    if (saved) return JSON.parse(saved);
    // Valeurs par défaut basées sur ton exemple
    return {
      incomeBase: 2224,
      incomeTS: 0,
      autoTransfer: 155,
      variables: [
        { id: 1, name: 'Épicerie', spent: 0, max: 1000 },
        { id: 2, name: 'Essence', spent: 0, max: 200 },
        { id: 3, name: 'Resto', spent: 0, max: 50 },
        { id: 4, name: 'Divers Maison', spent: 0, max: 50 },
        { id: 5, name: 'Sortie / Loisirs', spent: 0, max: 150 },
        { id: 6, name: 'Perso / Santé', spent: 0, max: 400 },
        { id: 7, name: 'Pubs Shopify', spent: 0, max: 0 },
        { id: 8, name: 'Dev Shopify', spent: 0, max: 100 },
        { id: 9, name: 'Abonnements', spent: 0, max: 0 },
      ],
      fixed: [
        { id: 10, name: '🏠 Loyer Femme', amount: 0 },
        { id: 11, name: '💄 Dépenses Femme', amount: 0 },
        { id: 12, name: '📱 Cellulaire', amount: 0 },
        { id: 13, name: '🛍️ Shopify Abo', amount: 0 },
        { id: 14, name: "🏦 Virement 'Comptes'", amount: 0 },
      ]
    };
  };

  const [monthData, setMonthData] = useState(() => loadMonthData(activeMonth));

  // Sauvegarder manuellement
  const handleSave = () => {
    localStorage.setItem(`pos_budget_m${activeMonth}`, JSON.stringify(monthData));
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  // Changer de mois
  const changeMonth = (index) => {
    handleSave(); // Sauvegarde le mois actuel avant de changer
    setActiveMonth(index);
    setMonthData(loadMonthData(index));
  };

  // --- CALCULS DU RESTE EN POCHE ---
  const totalIncome = Number(monthData.incomeBase) + Number(monthData.incomeTS);
  const totalAutoTransfer = Number(monthData.autoTransfer) * 2; // Supposant 2 paies par mois
  const totalFixed = monthData.fixed.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalVariablesSpent = monthData.variables.reduce((sum, item) => sum + Number(item.spent), 0);
  
  const pocketMoney = totalIncome - totalAutoTransfer - totalFixed - totalVariablesSpent;

  // --- FONCTIONS DE GESTION ---
  const updateData = (key, value) => {
    setMonthData(prev => ({ ...prev, [key]: value }));
  };

  const updateVariable = (id, field, value) => {
    setMonthData(prev => ({
      ...prev,
      variables: prev.variables.map(v => v.id === id ? { ...v, [field]: Number(value) } : v)
    }));
  };

  const addVariableAmount = (id, amountToAdd) => {
    setMonthData(prev => ({
      ...prev,
      variables: prev.variables.map(v => v.id === id ? { ...v, spent: v.spent + amountToAdd } : v)
    }));
  };

  const deleteVariable = (id) => {
    if(window.confirm("Supprimer cette catégorie ?")) {
      setMonthData(prev => ({
        ...prev,
        variables: prev.variables.filter(v => v.id !== id)
      }));
    }
  };

  const addVariable = () => {
    const name = prompt(vocab.namePrompt);
    if (name) {
      setMonthData(prev => ({
        ...prev,
        variables: [...prev.variables, { id: Date.now(), name, spent: 0, max: 100 }]
      }));
    }
  };

  const updateFixed = (id, value) => {
    setMonthData(prev => ({
      ...prev,
      fixed: prev.fixed.map(f => f.id === id ? { ...f, amount: Number(value) } : f)
    }));
  };

  const deleteFixed = (id) => {
    if(window.confirm("Supprimer cette charge ?")) {
      setMonthData(prev => ({
        ...prev,
        fixed: prev.fixed.filter(f => f.id !== id)
      }));
    }
  };

  const addFixed = () => {
    const name = prompt(vocab.namePrompt);
    if (name) {
      setMonthData(prev => ({
        ...prev,
        fixed: [...prev.fixed, { id: Date.now(), name, amount: 0 }]
      }));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-10">
      
      {/* HEADER : Titre + Bouton Sauvegarder */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white">{vocab.title}</h2>
        <button 
          onClick={handleSave}
          className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition-all ${showSaved ? 'bg-green-500 text-white' : 'bg-[#ccff00] text-black hover:scale-105 shadow-[0_0_15px_rgba(204,255,0,0.3)]'}`}
        >
          {showSaved ? <Check size={16} /> : <Save size={16} />}
          {showSaved ? vocab.saved : vocab.save}
        </button>
      </div>

      {/* SÉLECTEUR DE MOIS HORIZONTAL */}
      <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
        {vocab.months.map((m, i) => (
          <button
            key={i}
            onClick={() => changeMonth(i)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-colors ${activeMonth === i ? 'bg-[#ccff00] text-black' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* GROS BLOC : RESTE EN POCHE */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-xl text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ccff00]/10 rounded-full blur-3xl pointer-events-none" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 relative z-10">{vocab.pocket}</p>
        <h3 className={`text-6xl font-black tracking-tighter relative z-10 ${pocketMoney < 0 ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'text-[#ccff00] drop-shadow-[0_0_15px_rgba(204,255,0,0.2)]'}`}>
          {pocketMoney.toFixed(0)} $
        </h3>
      </div>

      {/* SECTION : REVENUS */}
      <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 shadow-md">
        <h4 className="text-white font-black mb-4 uppercase tracking-wider text-sm">{vocab.income}</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/20 rounded-xl p-3 border border-slate-700/50">
            <p className="text-[10px] text-slate-500 uppercase mb-1 font-bold">{vocab.base}</p>
            <div className="flex items-center gap-1">
              <input 
                type="number" value={monthData.incomeBase} onChange={(e) => updateData('incomeBase', e.target.value)}
                className="bg-transparent text-[#ccff00] font-black text-xl w-full focus:outline-none"
              />
              <span className="text-slate-400">$</span>
            </div>
          </div>
          <div className="bg-black/20 rounded-xl p-3 border border-slate-700/50">
            <p className="text-[10px] text-slate-500 uppercase mb-1 font-bold">{vocab.ts}</p>
            <div className="flex items-center gap-1">
              <input 
                type="number" value={monthData.incomeTS} onChange={(e) => updateData('incomeTS', e.target.value)}
                className="bg-transparent text-[#ccff00] font-black text-xl w-full focus:outline-none"
              />
              <span className="text-slate-400">$</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION : VIREMENT AUTO */}
      <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 shadow-md flex justify-between items-center">
        <h4 className="text-white font-black text-sm">{vocab.autoTransferTitle}</h4>
        <div className="flex items-center gap-2">
          <input 
            type="number" value={monthData.autoTransfer} onChange={(e) => updateData('autoTransfer', e.target.value)}
            className="bg-slate-900 border border-slate-700 text-[#ccff00] font-black w-20 text-center py-2 rounded-xl focus:outline-none"
          />
          <span className="text-xs text-slate-400 font-bold">{vocab.perPay}</span>
        </div>
      </div>

      {/* SECTION : DÉPENSES VARIABLES */}
      <div>
        <div className="flex justify-between items-center mb-4 mt-8">
          <h4 className="text-white font-black text-sm">{vocab.varExpensesTitle}</h4>
          <button onClick={addVariable} className="text-[#ccff00] bg-slate-800 p-2 rounded-lg hover:bg-slate-700 transition-colors">
            <Plus size={16} />
          </button>
        </div>
        
        <div className="space-y-3">
          {monthData.variables.map(v => {
            const left = v.max - v.spent;
            const isOver = left < 0;
            return (
              <div key={v.id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl relative group">
                {/* Bouton X pour supprimer */}
                <button onClick={() => deleteVariable(v.id)} className="absolute top-2 right-2 text-slate-600 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>

                <div className="mb-2 pr-6">
                  <h5 className="font-bold text-white text-sm">{v.name}</h5>
                  <p className={`text-xs font-black ${isOver ? 'text-red-400' : 'text-emerald-400'}`}>
                    {vocab.left}: {left} $
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-black/20 p-2 rounded-xl flex justify-between items-center border border-slate-700/50">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">{vocab.total}:</span>
                    <div className="flex items-center">
                      <input 
                        type="number" value={v.spent} onChange={(e) => updateVariable(v.id, 'spent', e.target.value)}
                        className="bg-transparent text-white font-black w-14 text-right focus:outline-none"
                      />
                      <span className="text-slate-500 text-xs ml-1">$</span>
                    </div>
                  </div>

                  {/* Bouton Ajout Rapide */}
                  <button onClick={() => {
                    const add = prompt(`Montant à ajouter pour ${v.name} ?`, "10");
                    if(add) addVariableAmount(v.id, Number(add));
                  }} className="w-10 h-10 bg-[#ccff00]/10 text-[#ccff00] rounded-xl flex items-center justify-center hover:bg-[#ccff00] hover:text-black transition-colors font-black text-lg">
                    +
                  </button>

                  <div className="flex-1 bg-black/20 p-2 rounded-xl flex justify-between items-center border border-slate-700/50">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">{vocab.max}</span>
                    <div className="flex items-center">
                      <input 
                        type="number" value={v.max} onChange={(e) => updateVariable(v.id, 'max', e.target.value)}
                        className="bg-transparent text-[#ccff00] font-black w-12 text-right focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION : CHARGES FIXES */}
      <div>
        <div className="flex justify-between items-center mb-4 mt-8">
          <h4 className="text-white font-black text-sm">{vocab.fixedTitle}</h4>
          <button onClick={addFixed} className="text-[#ccff00] bg-slate-800 p-2 rounded-lg hover:bg-slate-700 transition-colors">
            <Plus size={16} />
          </button>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden divide-y divide-slate-700/50">
          {monthData.fixed.map(f => (
            <div key={f.id} className="p-4 flex justify-between items-center group">
              <span className="font-bold text-slate-300 text-sm">{f.name}</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <input 
                    type="number" value={f.amount} onChange={(e) => updateFixed(f.id, e.target.value)}
                    className="bg-transparent text-white font-black w-20 text-right focus:outline-none"
                    placeholder="0"
                  />
                  <span className="text-slate-500 ml-1">$</span>
                </div>
                <button onClick={() => deleteFixed(f.id)} className="text-slate-600 hover:text-red-400">
                  <Trash2 size={14} />
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
