import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Flame, RotateCcw, Settings } from 'lucide-react';

// --- BASE DE DONNÉES INTERNE ---
const DB = {
  'poulet': { k: 165, p: 31, c: 0, f: 3.6, u: '100g' },
  'dinde': { k: 135, p: 30, c: 0, f: 1, u: '100g' },
  'boeuf': { k: 250, p: 26, c: 0, f: 15, u: '100g' },
  'riz': { k: 130, p: 2.7, c: 28, f: 0.3, u: '100g cuit' },
  'pates': { k: 131, p: 5, c: 25, f: 1, u: '100g cuit' },
  'pâte': { k: 131, p: 5, c: 25, f: 1, u: '100g' },
  'patate douce': { k: 86, p: 1.6, c: 20, f: 0.1, u: '100g' },
  'avoine': { k: 380, p: 13, c: 60, f: 7, u: '100g' },
  'whey': { k: 120, p: 24, c: 2, f: 1, u: '1 scoop' },
  'oeuf': { k: 70, p: 6, c: 0.6, f: 5, u: '1 unité' },
  'banane': { k: 90, p: 1, c: 23, f: 0.3, u: '1 unité' },
  'skyr': { k: 60, p: 10, c: 4, f: 0, u: '100g' },
  'amandes': { k: 580, p: 21, c: 22, f: 50, u: '100g' },
  'huile': { k: 90, p: 0, c: 0, f: 10, u: '1 c.à.s' },
  'avocat': { k: 160, p: 2, c: 9, f: 15, u: '100g' },
};

const Nutrition = ({ t }) => {
  const isFr = t.month === 'mois';

  const vocab = {
    title: isFr ? 'Diète' : 'Diet',
    clearAll: isFr ? 'Effacer la journée ?' : 'Clear today?',
    setGoalsTitle: isFr ? 'Ajuster mes objectifs' : 'Adjust goals',
    namePlaceholder: isFr ? 'Aliment (ex: Riz)' : 'Food (ex: Rice)',
    emptyState: isFr ? 'Aucun repas ce jour-là. Ajoute ton premier plat.' : 'No meals for this day. Add a dish.',
    days: isFr 
      ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  };

  const getTodayIndex = () => {
    let day = new Date().getDay();
    return day === 0 ? 6 : day - 1; 
  };

  // --- ÉTATS ---
  const [activeDay, setActiveDay] = useState(getTodayIndex());

  const [weeklyFoods, setWeeklyFoods] = useState(() => {
    const saved = localStorage.getItem('pos_nutri_weekly_v3');
    if (saved) return JSON.parse(saved);
    return { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  });

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('pos_nutri_goals');
    return saved ? JSON.parse(saved) : { calories: 2000, protein: 180, carbs: 220, fat: 60 };
  });

  const [showSettings, setShowSettings] = useState(false);
  
  const now = new Date();
  const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const [timeStr, setTimeStr] = useState(defaultTime);
  const [totals, setTotals] = useState({ k: 0, p: 0, c: 0, f: 0 });
  
  // Nouveau formulaire avec "qty" (quantité) séparé
  const [form, setForm] = useState({ name: '', qty: '', k: '', p: '', c: '', f: '' });

  useEffect(() => localStorage.setItem('pos_nutri_weekly_v3', JSON.stringify(weeklyFoods)), [weeklyFoods]);
  useEffect(() => localStorage.setItem('pos_nutri_goals', JSON.stringify(goals)), [goals]);

  const currentFoods = weeklyFoods[activeDay] || [];

  useEffect(() => {
    const t = currentFoods.reduce((acc, item) => ({
      k: acc.k + item.k,
      p: acc.p + item.p,
      c: acc.c + item.c,
      f: acc.f + item.f,
    }), { k: 0, p: 0, c: 0, f: 0 });
    setTotals(t);
  }, [currentFoods, activeDay]);

  // FONCTION INTELLIGENTE : Combine le Nom et la Quantité
  const handleAutoCalc = (newName, newQty) => {
    setForm(prev => ({ ...prev, name: newName, qty: newQty }));
    
    const lowerText = newName.toLowerCase();
    const matchKey = Object.keys(DB).find(key => lowerText.includes(key));
    const parsedQty = parseFloat(newQty);

    // Si on a reconnu l'aliment ET qu'il y a un chiffre valide
    if (matchKey && parsedQty > 0) {
      const data = DB[matchKey];
      const ratio = data.u.includes('100g') ? parsedQty / 100 : parsedQty;

      setForm(prev => ({
        ...prev,
        k: Math.round(data.k * ratio),
        p: Math.round(data.p * ratio),
        c: Math.round(data.c * ratio),
        f: Math.round(data.f * ratio)
      }));
    }
  };

  const addEntry = () => {
    if (!form.name) return;

    // Créer un beau nom avec la quantité incluse (ex: "Poulet (200g)")
    let finalName = form.name.charAt(0).toUpperCase() + form.name.slice(1);
    if (form.qty && Number(form.qty) > 0) {
      const lowerText = form.name.toLowerCase();
      const matchKey = Object.keys(DB).find(key => lowerText.includes(key));
      // Déterminer si c'est des grammes (g) ou des unités (u)
      const unit = matchKey && !DB[matchKey].u.includes('100g') ? 'u' : 'g';
      finalName += ` (${form.qty}${unit})`;
    }
    
    const newFood = {
      id: Date.now(),
      time: timeStr,
      name: finalName,
      k: Number(form.k) || 0,
      p: Number(form.p) || 0,
      c: Number(form.c) || 0,
      f: Number(form.f) || 0
    };

    setWeeklyFoods(prev => {
      const dayFoods = [...prev[activeDay], newFood].sort((a, b) => a.time.localeCompare(b.time));
      return { ...prev, [activeDay]: dayFoods };
    });

    setForm({ name: '', qty: '', k: '', p: '', c: '', f: '' });
  };

  const deleteEntry = (id) => {
    setWeeklyFoods(prev => ({
      ...prev,
      [activeDay]: prev[activeDay].filter(f => f.id !== id)
    }));
  };

  const clearDay = () => {
    if(window.confirm(vocab.clearAll)) {
      setWeeklyFoods(prev => ({ ...prev, [activeDay]: [] }));
    }
  };

  const getPercent = (current, max) => Math.min(100, Math.round((current / (max || 1)) * 100));

  return (
    <div className="space-y-4 animate-in fade-in duration-300 pb-56">
      
      {/* HEADER & JAUGES DE MACROS */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-[2rem] shadow-xl relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Flame className="text-orange-500" size={20} /> {vocab.title}
          </h2>
          <div className="flex gap-2">
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <Settings size={16} />
            </button>
            <button onClick={clearDay} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* SÉLECTEUR DE JOURS */}
        <div className="flex justify-between items-center bg-black/40 p-1 rounded-xl border border-slate-700/50 mb-5">
          {vocab.days.map((d, i) => (
            <button
              key={i}
              onClick={() => setActiveDay(i)}
              className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-colors ${activeDay === i ? 'bg-[#ccff00] text-black shadow-sm' : 'text-slate-500 hover:text-white'}`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* SECTION REGLAGES OBJECTIFS */}
        {showSettings && (
          <div className="mb-6 p-4 bg-black/40 rounded-xl border border-slate-700/50 animate-in fade-in">
            <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">{vocab.setGoalsTitle}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Calories</span>
                <input type="number" value={goals.calories} onChange={e => setGoals({...goals, calories: Number(e.target.value)})} className="bg-transparent w-full text-white font-black text-[16px] focus:outline-none" />
              </div>
              <div className="bg-slate-800 p-2 rounded-lg border-l-2 border-blue-500">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Protéines (g)</span>
                <input type="number" value={goals.protein} onChange={e => setGoals({...goals, protein: Number(e.target.value)})} className="bg-transparent w-full text-white font-black text-[16px] focus:outline-none" />
              </div>
              <div className="bg-slate-800 p-2 rounded-lg border-l-2 border-amber-500">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Glucides (g)</span>
                <input type="number" value={goals.carbs} onChange={e => setGoals({...goals, carbs: Number(e.target.value)})} className="bg-transparent w-full text-white font-black text-[16px] focus:outline-none" />
              </div>
              <div className="bg-slate-800 p-2 rounded-lg border-l-2 border-purple-500">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Lipides (g)</span>
                <input type="number" value={goals.fat} onChange={e => setGoals({...goals, fat: Number(e.target.value)})} className="bg-transparent w-full text-white font-black text-[16px] focus:outline-none" />
              </div>
            </div>
          </div>
        )}

        {/* JAUGE CALORIES */}
        <div className="mb-4">
          <div className="flex justify-between items-end mb-1">
            <span className="text-xs font-bold text-slate-400">CALORIES</span>
            <span className="text-sm font-black text-white">{totals.k} <span className="text-[10px] text-slate-500 font-normal">/ {goals.calories} kcal</span></span>
          </div>
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500" style={{ width: `${getPercent(totals.k, goals.calories)}%` }}></div>
          </div>
        </div>
        
        {/* JAUGES MACROS */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { l: isFr ? 'PROTÉINES' : 'PROTEIN', v: totals.p, m: goals.protein, color: 'bg-blue-500', bg: 'bg-slate-800' },
            { l: isFr ? 'GLUCIDES' : 'CARBS', v: totals.c, m: goals.carbs, color: 'bg-amber-500', bg: 'bg-slate-800' },
            { l: isFr ? 'LIPIDES' : 'FAT', v: totals.f, m: goals.fat, color: 'bg-purple-500', bg: 'bg-slate-800' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex justify-between items-baseline">
                <span className="text-[9px] font-bold text-slate-500">{stat.l}</span>
              </div>
              <div className={`h-1.5 w-full ${stat.bg} rounded-full overflow-hidden`}>
                <div className={`h-full ${stat.color} transition-all duration-500`} style={{ width: `${getPercent(stat.v, stat.m)}%` }}></div>
              </div>
              <span className="text-[10px] font-black text-slate-300">{stat.v}g <span className="text-slate-600 font-normal">/ {stat.m}</span></span>
            </div>
          ))}
        </div>
      </div>

      {/* LISTE DES REPAS DU JOUR ACTIF */}
      <div className="space-y-3">
        {currentFoods.length === 0 && (
          <div className="text-center py-10 text-slate-500 text-xs italic bg-slate-800/20 rounded-2xl border border-dashed border-slate-700/50">
            {vocab.emptyState}
          </div>
        )}

        {currentFoods.map((item) => (
          <div key={item.id} className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-2xl flex items-center shadow-md">
            
            <div className="pr-3 border-r border-slate-700/50 mr-3 text-center">
              <span className="block text-[10px] font-black text-[#ccff00]">{item.time}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-white text-sm truncate">{item.name}</h3>
                <span className="text-xs font-black text-orange-500 whitespace-nowrap">{item.k} kcal</span>
              </div>
              
              <div className="flex gap-2">
                <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">P: {item.p}g</span>
                <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">G: {item.c}g</span>
                <span className="text-[9px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">L: {item.f}g</span>
              </div>
            </div>

            <button onClick={() => deleteEntry(item.id)} className="ml-3 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* PANNEAU DE SAISIE FLOTTANT */}
      <div className="fixed bottom-[85px] left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0f172a]/95 backdrop-blur-xl border-y border-slate-800/80 p-4 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="w-full space-y-3">
            
            {/* LIGNE 1 : Heure + Aliment + Quantité */}
            <div className="flex gap-2">
              <input 
                type="time" 
                value={timeStr} 
                onChange={e => setTimeStr(e.target.value)}
                className="w-20 bg-slate-900 border border-slate-700 rounded-xl px-1 text-center text-[16px] font-bold text-[#ccff00] outline-none"
              />
              <input 
                type="text" 
                value={form.name}
                onChange={e => handleAutoCalc(e.target.value, form.qty)}
                placeholder={vocab.namePlaceholder}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-[16px] font-bold text-white outline-none focus:border-[#ccff00] placeholder-slate-600"
              />
              <div className="relative w-24">
                <input 
                  type="number" 
                  value={form.qty}
                  onChange={e => handleAutoCalc(form.name, e.target.value)}
                  placeholder="Qté"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-2 pr-6 py-2 text-[16px] font-bold text-[#ccff00] outline-none focus:border-[#ccff00] placeholder-slate-600"
                />
                <span className="absolute right-2 top-3 text-[10px] font-bold text-slate-500 pointer-events-none">g/u</span>
              </div>
            </div>

            {/* LIGNE 2 : Macros + Bouton Ajouter */}
            <div className="flex gap-2">
              {[
                { l: 'Kcal', v: form.k, k: 'k', c: 'text-orange-500 border-orange-500/30' },
                { l: 'Pro', v: form.p, k: 'p', c: 'text-blue-500 border-blue-500/30' },
                { l: 'Glu', v: form.c, k: 'c', c: 'text-amber-500 border-amber-500/30' },
                { l: 'Lip', v: form.f, k: 'f', c: 'text-purple-500 border-purple-500/30' },
              ].map((f, i) => (
                <div key={i} className="flex-1 relative mt-2">
                   <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#0f172a] px-1 text-[8px] font-bold text-slate-400 uppercase tracking-wider">{f.l}</span>
                   <input 
                    type="number" 
                    placeholder="-"
                    value={f.v === 0 ? '' : f.v} 
                    onChange={e => setForm({...form, [f.k]: e.target.value})} 
                    className={`w-full py-2 bg-slate-900 border rounded-xl text-center text-[16px] font-black outline-none ${f.c}`} 
                  />
                </div>
              ))}
              <button 
                onClick={addEntry}
                disabled={!form.name}
                className="w-12 bg-[#ccff00] disabled:bg-slate-800 disabled:text-slate-600 text-black rounded-xl hover:bg-[#b3e600] transition font-black flex items-center justify-center mt-2"
              >
                <Plus size={20} />
              </button>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Nutrition;
