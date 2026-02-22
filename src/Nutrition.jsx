import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Flame, RotateCcw, Settings, Target, Zap, ShieldAlert, Bot, Loader2 } from 'lucide-react';

// --- BASE DE DONNÉES INTERNE ---
const DB = {
  'poulet': { k: 165, p: 31, c: 0, f: 3.6, u: '100g' },
  'dinde': { k: 135, p: 30, c: 0, f: 1, u: '100g' },
  'boeuf': { k: 250, p: 26, c: 0, f: 15, u: '100g' },
  'riz': { k: 130, p: 2.7, c: 28, f: 0.3, u: '100g' },
  'pates': { k: 131, p: 5, c: 25, f: 1, u: '100g' },
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

// ==========================================
// 🔴 CLÉ GOOGLE AI STUDIO (GEMINI) 🔴
// ==========================================
const GEMINI_API_KEY = 'AIzaSyCkvn67Uhrw8SquI4uLkRF8zboTL9B2BvA';

const BAD_FOODS = {
  'nutella': 'du beurre d\'amande ou d\'arachide avec du cacao pur',
  'mcdo': 'un burger maison avec steak haché 5% MG',
  'mcdonald': 'un burger maison avec steak haché 5% MG',
  'burger': 'un burger maison avec steak haché 5% MG',
  'pizza': 'un wrap pizza protéiné ou une pâte au chou-fleur',
  'chips': 'du popcorn fait maison ou des chips de pita au four',
  'bonbon': 'des fruits rouges ou un skyr aromatisé',
  'chocolat': 'du chocolat noir 85% ou de la whey au chocolat'
};

const Nutrition = ({ t }) => {
  const isFr = t.month === 'mois';

  const vocab = {
    title: isFr ? 'Diète' : 'Diet',
    clearAll: isFr ? 'Effacer la journée ?' : 'Clear today?',
    setGoalsTitle: isFr ? 'Ajuster mes objectifs' : 'Adjust goals',
    namePlaceholder: isFr ? 'Ex: Riz' : 'Ex: Rice',
    emptyState: isFr ? 'Aucun repas ce jour-là. Ajoute ton premier plat.' : 'No meals for this day. Add a dish.',
    days: isFr ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    
    setupTitle: isFr ? 'Configuration Diète' : 'Diet Setup',
    btnGuided: isFr ? 'Calculateur Macros' : 'Macro Calculator',
    btnManual: isFr ? 'Entrée Manuelle' : 'Manual Entry',
    
    aiCoachTitle: isFr ? 'Dis-moi ce que tu as mangé :' : 'Tell me what you ate:',
    aiCoachPlaceholder: isFr ? 'ex: 3 oeufs brouillés avec 2 tranches de pain complet et un café...' : 'e.g. 3 scrambled eggs with 2 slices of whole wheat toast...',
    aiBtnScan: isFr ? 'Scanner le repas' : 'Scan Meal',
    
    ft: 'ft', in: 'in'
  };

  const getTodayIndex = () => { let day = new Date().getDay(); return day === 0 ? 6 : day - 1; };
  
  const [setupState, setSetupState] = useState(() => localStorage.getItem('pos_nutri_setup') || 'none');
  const [goals, setGoals] = useState(() => JSON.parse(localStorage.getItem('pos_nutri_goals')) || null);
  const [activeDay, setActiveDay] = useState(getTodayIndex());
  const [weeklyFoods, setWeeklyFoods] = useState(() => JSON.parse(localStorage.getItem('pos_nutri_weekly_v4')) || { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] });
  const [showSettings, setShowSettings] = useState(false);
  
  const [timeStr, setTimeStr] = useState(`${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`);
  const [totals, setTotals] = useState({ k: 0, p: 0, c: 0, f: 0 });
  const [form, setForm] = useState({ name: '', qty: '', k: '', p: '', c: '', f: '' });
  const [coachAlert, setCoachAlert] = useState({ active: false, foodName: '', altText: '' });

  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => localStorage.setItem('pos_nutri_weekly_v4', JSON.stringify(weeklyFoods)), [weeklyFoods]);
  useEffect(() => { if (goals) localStorage.setItem('pos_nutri_goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => localStorage.setItem('pos_nutri_setup', setupState), [setupState]);

  useEffect(() => {
    const t = (weeklyFoods[activeDay] || []).reduce((acc, item) => ({
      k: acc.k + item.k, p: acc.p + item.p, c: acc.c + item.c, f: acc.f + item.f,
    }), { k: 0, p: 0, c: 0, f: 0 });
    setTotals(t);
  }, [weeklyFoods, activeDay]);

  // ==========================================
  // IA GEMINI - VERSION BLINDÉE (BULLETPROOF PARSER)
  // ==========================================
  const handleAIAnalyze = async () => {
    if (!aiInput.trim()) return;

    setIsAiLoading(true);

    const promptText = `
      Tu es une IA nutritionnelle experte. L'utilisateur a mangé : "${aiInput}".
      Calcule les macros totaux de ce repas.
      IMPORTANT : Ta réponse doit être UNIQUEMENT un objet JSON. Aucun texte avant, aucun texte après, pas de "Bonjour", pas de markdown.
      Format exact :
      {"name": "Description courte (ex: Nutella & Fromage)", "k": 350, "p": 15, "c": 30, "f": 20}
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      let rawText = data.candidates[0].content.parts[0].text;
      
      // FIX ANTI-CRASH : On trouve le premier { et le dernier } pour isoler les maths
      const startIndex = rawText.indexOf('{');
      const endIndex = rawText.lastIndexOf('}');
      
      if (startIndex !== -1 && endIndex !== -1) {
        rawText = rawText.substring(startIndex, endIndex + 1);
      } else {
        throw new Error("L'IA n'a pas retourné de format valide.");
      }

      const parsedData = JSON.parse(rawText);

      const newFood = {
        id: Date.now(),
        time: timeStr,
        name: parsedData.name + " 🤖", // Emoji robot 
        k: Number(parsedData.k) || 0,
        p: Number(parsedData.p) || 0,
        c: Number(parsedData.c) || 0,
        f: Number(parsedData.f) || 0
      };

      setWeeklyFoods(prev => ({ 
        ...prev, 
        [activeDay]: [...prev[activeDay], newFood].sort((a, b) => a.time.localeCompare(b.time)) 
      }));

      setAiInput('');
      setShowAIPanel(false);

    } catch (error) {
      console.error("Erreur Gemini détaillée:", error);
      alert("Erreur avec l'IA. Essaye de reformuler ton repas de façon plus simple.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- LOGIQUE MANUELLE CLASSIQUE ---
  const handleAutoCalc = (newName, newQty) => {
    setForm(prev => ({ ...prev, name: newName, qty: newQty }));
    const lowerText = newName.toLowerCase();
    const matchKey = Object.keys(DB).find(key => lowerText.includes(key));
    const parsedQty = parseFloat(newQty);
    if (matchKey && parsedQty > 0) {
      const data = DB[matchKey];
      const ratio = data.u.includes('100g') ? parsedQty / 100 : parsedQty;
      setForm(prev => ({ ...prev, k: Math.round(data.k * ratio), p: Math.round(data.p * ratio), c: Math.round(data.c * ratio), f: Math.round(data.f * ratio) }));
    }
  };

  const attemptAddEntry = () => {
    if (!form.name) return;
    const lowerName = form.name.toLowerCase();
    const badFoodMatch = Object.keys(BAD_FOODS).find(bad => lowerName.includes(bad));
    if (badFoodMatch) {
      setCoachAlert({ active: true, foodName: form.name, altText: BAD_FOODS[badFoodMatch] });
      return; 
    }
    finalizeAddEntry(form.name);
  };

  const finalizeAddEntry = (finalNameStr) => {
    let finalName = finalNameStr.charAt(0).toUpperCase() + finalNameStr.slice(1);
    if (form.qty && Number(form.qty) > 0) {
      const lowerText = form.name.toLowerCase();
      const matchKey = Object.keys(DB).find(key => lowerText.includes(key));
      const unit = matchKey && !DB[matchKey].u.includes('100g') ? 'u' : 'g';
      finalName += ` (${form.qty}${unit})`;
    }
    const newFood = {
      id: Date.now(), time: timeStr, name: finalName,
      k: Number(form.k) || 0, p: Number(form.p) || 0, c: Number(form.c) || 0, f: Number(form.f) || 0
    };
    setWeeklyFoods(prev => ({ ...prev, [activeDay]: [...prev[activeDay], newFood].sort((a, b) => a.time.localeCompare(b.time)) }));
    setForm({ name: '', qty: '', k: '', p: '', c: '', f: '' });
    setCoachAlert({ active: false, foodName: '', altText: '' });
  };

  const getPercent = (current, max) => Math.min(100, Math.round((current / (max || 1)) * 100));

  if (setupState === 'none') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in zoom-in duration-500 space-y-6">
        <Target size={60} className="text-[#ccff00]" />
        <div className="text-center">
          <h2 className="text-2xl font-black text-white">{vocab.setupTitle}</h2>
        </div>
        <div className="w-full space-y-3 max-w-xs">
          <button onClick={() => { setGoals({ calories: 1600, protein: 160, carbs: 140, fat: 35 }); setSetupState('done'); }} className="w-full bg-[#ccff00] text-black font-black py-4 rounded-2xl flex justify-center items-center gap-2 hover:scale-105 transition-transform">
            <Zap size={18}/> {vocab.btnGuided}
          </button>
          <button onClick={() => { setGoals({ calories: 2000, protein: 150, carbs: 200, fat: 60 }); setSetupState('done'); }} className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl hover:bg-slate-700 transition-colors">
            {vocab.btnManual}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300 pb-64">
      
      {/* HEADER & JAUGES DE MACROS */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-[2rem] shadow-xl relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Flame className="text-orange-500" size={20} /> {vocab.title}
          </h2>
          <div className="flex gap-2">
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><Settings size={16} /></button>
            <button onClick={() => { if(window.confirm(vocab.clearAll)) setWeeklyFoods(p => ({...p, [activeDay]: []})) }} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors"><RotateCcw size={16} /></button>
          </div>
        </div>

        {/* SÉLECTEUR DE JOURS */}
        <div className="flex justify-between items-center bg-black/40 p-1 rounded-xl border border-slate-700/50 mb-5">
          {vocab.days.map((d, i) => (
            <button key={i} onClick={() => setActiveDay(i)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-colors ${activeDay === i ? 'bg-[#ccff00] text-black shadow-sm' : 'text-slate-500 hover:text-white'}`}>
              {d}
            </button>
          ))}
        </div>

        {/* REGLAGES OBJECTIFS MANUELS */}
        {showSettings && goals && (
          <div className="mb-6 p-4 bg-black/40 rounded-xl border border-slate-700/50 animate-in fade-in">
            <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider flex justify-between items-center">
              {vocab.setGoalsTitle}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800 p-2 rounded-lg"><span className="text-[10px] text-slate-500 uppercase font-bold">Calories</span><input type="number" value={goals.calories} onChange={e => setGoals({...goals, calories: Number(e.target.value)})} className="bg-transparent w-full text-white font-black text-[16px] focus:outline-none" /></div>
              <div className="bg-slate-800 p-2 rounded-lg border-l-2 border-blue-500"><span className="text-[10px] text-slate-500 uppercase font-bold">Protéines (g)</span><input type="number" value={goals.protein} onChange={e => setGoals({...goals, protein: Number(e.target.value)})} className="bg-transparent w-full text-white font-black text-[16px] focus:outline-none" /></div>
              <div className="bg-slate-800 p-2 rounded-lg border-l-2 border-amber-500"><span className="text-[10px] text-slate-500 uppercase font-bold">Glucides (g)</span><input type="number" value={goals.carbs} onChange={e => setGoals({...goals, carbs: Number(e.target.value)})} className="bg-transparent w-full text-white font-black text-[16px] focus:outline-none" /></div>
              <div className="bg-slate-800 p-2 rounded-lg border-l-2 border-purple-500"><span className="text-[10px] text-slate-500 uppercase font-bold">Lipides (g)</span><input type="number" value={goals.fat} onChange={e => setGoals({...goals, fat: Number(e.target.value)})} className="bg-transparent w-full text-white font-black text-[16px] focus:outline-none" /></div>
            </div>
          </div>
        )}

        {/* JAUGES */}
        {goals && (
          <>
            <div className="mb-4">
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-bold text-slate-400">CALORIES</span>
                <span className="text-sm font-black text-white">{totals.k} <span className="text-[10px] text-slate-500 font-normal">/ {goals.calories} kcal</span></span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500" style={{ width: `${getPercent(totals.k, goals.calories)}%` }}></div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {[
                { l: isFr ? 'PROTÉINES' : 'PROTEIN', v: totals.p, m: goals.protein, color: 'bg-blue-500', bg: 'bg-slate-800' },
                { l: isFr ? 'GLUCIDES' : 'CARBS', v: totals.c, m: goals.carbs, color: 'bg-amber-500', bg: 'bg-slate-800' },
                { l: isFr ? 'LIPIDES' : 'FAT', v: totals.f, m: goals.fat, color: 'bg-purple-500', bg: 'bg-slate-800' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex justify-between items-baseline"><span className="text-[9px] font-bold text-slate-500">{stat.l}</span></div>
                  <div className={`h-1.5 w-full ${stat.bg} rounded-full overflow-hidden`}><div className={`h-full ${stat.color} transition-all duration-500`} style={{ width: `${getPercent(stat.v, stat.m)}%` }}></div></div>
                  <span className="text-[10px] font-black text-slate-300">{stat.v}g <span className="text-slate-600 font-normal">/ {stat.m}</span></span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* LISTE DES REPAS */}
      <div className="space-y-3">
        {(weeklyFoods[activeDay] || []).length === 0 && (
          <div className="text-center py-10 text-slate-500 text-xs italic bg-slate-800/20 rounded-2xl border border-dashed border-slate-700/50">
            {vocab.emptyState}
          </div>
        )}
        {(weeklyFoods[activeDay] || []).map((item) => (
          <div key={item.id} className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-2xl flex items-center shadow-md">
            <div className="pr-3 border-r border-slate-700/50 mr-3 text-center"><span className="block text-[10px] font-black text-[#ccff00]">{item.time}</span></div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1"><h3 className="font-bold text-white text-sm truncate">{item.name}</h3><span className="text-xs font-black text-orange-500 whitespace-nowrap">{item.k} kcal</span></div>
              <div className="flex gap-2">
                <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">P: {item.p}g</span>
                <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">G: {item.c}g</span>
                <span className="text-[9px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">L: {item.f}g</span>
              </div>
            </div>
            <button onClick={() => setWeeklyFoods(p => ({...p, [activeDay]: p[activeDay].filter(f => f.id !== item.id)}))} className="ml-3 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>

      {/* PANNEAU DE SAISIE GLOBAL (IA + MANUEL) */}
      <div className="fixed bottom-[85px] left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0f172a]/95 backdrop-blur-xl border-y border-slate-800/80 p-4 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="w-full space-y-3">
            
            {/* BOUTON TOGGLE IA */}
            <div className="flex justify-center -mt-8 relative z-40">
              <button 
                onClick={() => setShowAIPanel(!showAIPanel)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-[10px] tracking-widest shadow-lg transition-transform hover:scale-105 ${showAIPanel ? 'bg-slate-800 text-white border border-slate-700' : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'}`}
              >
                <Bot size={16} /> {showAIPanel ? 'Fermer IA' : 'Scanner repas avec IA ✨'}
              </button>
            </div>

            {/* PANNEAU IA GEMINI */}
            {showAIPanel && (
              <div className="bg-slate-800/80 p-3 rounded-xl border border-blue-500/30 animate-in fade-in zoom-in duration-200">
                <label className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-2 block">{vocab.aiCoachTitle}</label>
                <textarea 
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder={vocab.aiCoachPlaceholder}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none resize-none h-20"
                />
                <button 
                  onClick={handleAIAnalyze}
                  disabled={isAiLoading || !aiInput.trim()}
                  className="w-full mt-2 bg-blue-500 disabled:bg-slate-700 text-white font-black py-2.5 rounded-lg flex items-center justify-center gap-2"
                >
                  {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />} 
                  {isAiLoading ? 'Analyse en cours...' : vocab.aiBtnScan}
                </button>
              </div>
            )}

            {/* PANNEAU MANUEL */}
            {!showAIPanel && (
              <>
                <div className="flex gap-2">
                  <input type="time" value={timeStr} onChange={e => setTimeStr(e.target.value)} className="w-20 bg-slate-900 border border-slate-700 rounded-xl px-1 text-center text-[16px] font-bold text-[#ccff00] outline-none" />
                  <input type="text" value={form.name} onChange={e => handleAutoCalc(e.target.value, form.qty)} placeholder={vocab.namePlaceholder} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-[16px] font-bold text-white outline-none focus:border-[#ccff00] placeholder-slate-600" />
                  <div className="relative w-24">
                    <input type="number" value={form.qty} onChange={e => handleAutoCalc(form.name, e.target.value)} placeholder="Qté" className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-2 pr-6 py-2 text-[16px] font-bold text-[#ccff00] outline-none focus:border-[#ccff00] placeholder-slate-600" />
                    <span className="absolute right-2 top-3 text-[10px] font-bold text-slate-500 pointer-events-none">g/u</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {[
                    { l: 'Kcal', v: form.k, k: 'k', c: 'text-orange-500 border-orange-500/30' },
                    { l: 'Pro', v: form.p, k: 'p', c: 'text-blue-500 border-blue-500/30' },
                    { l: 'Glu', v: form.c, k: 'c', c: 'text-amber-500 border-amber-500/30' },
                    { l: 'Lip', v: form.f, k: 'f', c: 'text-purple-500 border-purple-500/30' },
                  ].map((f, i) => (
                    <div key={i} className="flex-1 relative mt-2">
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#0f172a] px-1 text-[8px] font-bold text-slate-400 uppercase tracking-wider">{f.l}</span>
                      <input type="number" placeholder="-" value={f.v === 0 ? '' : f.v} onChange={e => setForm({...form, [f.k]: e.target.value})} className={`w-full py-2 bg-slate-900 border rounded-xl text-center text-[16px] font-black outline-none ${f.c}`} />
                    </div>
                  ))}
                  <button onClick={attemptAddEntry} disabled={!form.name} className="w-12 bg-[#ccff00] disabled:bg-slate-800 disabled:text-slate-600 text-black rounded-xl hover:bg-[#b3e600] transition font-black flex items-center justify-center mt-2">
                    <Plus size={20} />
                  </button>
                </div>
              </>
            )}
        </div>
      </div>
    </div>
  );
};

export default Nutrition;
