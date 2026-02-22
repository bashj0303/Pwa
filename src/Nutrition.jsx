import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Flame, RotateCcw, Settings, Target, Zap, AlertTriangle, ShieldAlert } from 'lucide-react';

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

// --- DICTIONNAIRE ANTI-JUNK FOOD ---
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
    namePlaceholder: isFr ? 'Aliment (ex: Riz)' : 'Food (ex: Rice)',
    emptyState: isFr ? 'Aucun repas ce jour-là. Ajoute ton premier plat.' : 'No meals for this day. Add a dish.',
    days: isFr ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    
    // Onboarding
    setupTitle: isFr ? 'Configuration Diète' : 'Diet Setup',
    setupDesc: isFr ? 'Comment veux-tu configurer tes macros ?' : 'How do you want to setup your macros?',
    btnGuided: isFr ? 'Coach IA (Recommandé)' : 'AI Coach (Recommended)',
    btnManual: isFr ? 'Entrée Manuelle' : 'Manual Entry',
    stepGender: isFr ? 'Sexe' : 'Gender',
    stepAge: isFr ? 'Âge' : 'Age',
    stepWeight: isFr ? 'Poids' : 'Weight',
    stepHeight: isFr ? 'Taille' : 'Height',
    stepActivity: isFr ? 'Activité' : 'Activity',
    stepGoal: isFr ? 'Objectif' : 'Goal',
    actLow: isFr ? 'Sédentaire' : 'Sedentary',
    actMed: isFr ? 'Modéré (1-3x/sem)' : 'Moderate (1-3x/wk)',
    actHigh: isFr ? 'Actif (4-5x/sem)' : 'Active (4-5x/wk)',
    goalCut: isFr ? 'Perte de gras (Cut)' : 'Fat Loss (Cut)',
    goalMaintain: isFr ? 'Maintien' : 'Maintain',
    goalBulk: isFr ? 'Prise de masse (Lean Bulk)' : 'Lean Bulk',
    btnCalculate: isFr ? 'Calculer mes Macros' : 'Calculate Macros',
    
    // Coach Alert
    coachAlertTitle: isFr ? '⚠️ ALERTE COACH' : '⚠️ COACH ALERT',
    coachAlertBtnIgnore: isFr ? 'Je gère (Ajouter)' : 'I got this (Add)',
    coachAlertBtnFix: isFr ? 'Changer pour l\'alternative' : 'Swap for alternative',

    // Unités
    ft: 'ft',
    in: 'in'
  };

  // --- ÉTATS GLOBAUX ---
  const [setupState, setSetupState] = useState(() => localStorage.getItem('pos_nutri_setup') || 'none');
  const [goals, setGoals] = useState(() => JSON.parse(localStorage.getItem('pos_nutri_goals')) || null);
  
  const getTodayIndex = () => { let day = new Date().getDay(); return day === 0 ? 6 : day - 1; };
  const [activeDay, setActiveDay] = useState(getTodayIndex());

  const [weeklyFoods, setWeeklyFoods] = useState(() => JSON.parse(localStorage.getItem('pos_nutri_weekly_v4')) || { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] });
  const [showSettings, setShowSettings] = useState(false);
  const [timeStr, setTimeStr] = useState(`${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`);
  const [totals, setTotals] = useState({ k: 0, p: 0, c: 0, f: 0 });
  const [form, setForm] = useState({ name: '', qty: '', k: '', p: '', c: '', f: '' });

  // État du Coach Junk Food
  const [coachAlert, setCoachAlert] = useState({ active: false, foodName: '', altText: '' });

  // --- ÉTATS ONBOARDING GUIDÉ (Avec Unités) ---
  const [guideData, setGuideData] = useState({ 
    gender: 'M', 
    age: 25, 
    weight: 160, 
    weightUnit: 'lbs', // 'lbs' ou 'kg'
    height: 175, 
    heightFt: 5,
    heightIn: 9,
    heightUnit: 'cm', // 'cm' ou 'ft'
    activity: 1.55, 
    goal: -500 
  });

  useEffect(() => localStorage.setItem('pos_nutri_weekly_v4', JSON.stringify(weeklyFoods)), [weeklyFoods]);
  useEffect(() => { if (goals) localStorage.setItem('pos_nutri_goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => localStorage.setItem('pos_nutri_setup', setupState), [setupState]);

  useEffect(() => {
    const t = (weeklyFoods[activeDay] || []).reduce((acc, item) => ({
      k: acc.k + item.k, p: acc.p + item.p, c: acc.c + item.c, f: acc.f + item.f,
    }), { k: 0, p: 0, c: 0, f: 0 });
    setTotals(t);
  }, [weeklyFoods, activeDay]);

  // --- LOGIQUE ONBOARDING GUIDÉ (Mifflin-St Jeor avec conversions universelles) ---
  const calculateGuidedMacros = () => {
    // Convertir le poids en KG pour la formule scientifique
    const weightKg = guideData.weightUnit === 'lbs' ? guideData.weight / 2.20462 : guideData.weight;
    // Convertir le poids en LBS pour le calcul des protéines (1g par lb)
    const weightLbs = guideData.weightUnit === 'lbs' ? guideData.weight : guideData.weight * 2.20462;
    
    // Convertir la taille en CM pour la formule scientifique
    const heightCm = guideData.heightUnit === 'ft' 
      ? (guideData.heightFt * 30.48) + (guideData.heightIn * 2.54) 
      : guideData.height;

    // BMR (Mifflin-St Jeor)
    let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * guideData.age);
    bmr = guideData.gender === 'M' ? bmr + 5 : bmr - 161;
    
    const tdee = bmr * guideData.activity;
    const targetCalories = Math.round(tdee + guideData.goal);
    
    // Macros focus Musculation
    const targetProtein = Math.round(weightLbs * 1.0); // 1g par lb de poids de corps
    const targetFat = Math.round((targetCalories * 0.25) / 9); // 25% des calories en lipides
    const targetCarbs = Math.round((targetCalories - (targetProtein * 4) - (targetFat * 9)) / 4); // Le reste en glucides

    setGoals({ calories: targetCalories, protein: targetProtein, carbs: targetCarbs, fat: targetFat });
    setSetupState('done');
  };

  const setManualMode = () => {
    setGoals({ calories: 2000, protein: 150, carbs: 200, fat: 60 });
    setSetupState('done');
    setShowSettings(true);
  };

  // --- LOGIQUE D'AJOUT & IA COACH ---
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
    
    // VÉRIFICATION ANTI-JUNK FOOD
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

  // ==========================================
  // VUE 1 : ÉCRAN DE CHOIX (ONBOARDING)
  // ==========================================
  if (setupState === 'none') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in zoom-in duration-500 space-y-6">
        <Target size={60} className="text-[#ccff00]" />
        <div className="text-center">
          <h2 className="text-2xl font-black text-white">{vocab.setupTitle}</h2>
          <p className="text-slate-400 text-sm mt-2">{vocab.setupDesc}</p>
        </div>
        <div className="w-full space-y-3 max-w-xs">
          <button onClick={() => setSetupState('guided')} className="w-full bg-[#ccff00] text-black font-black py-4 rounded-2xl flex justify-center items-center gap-2 hover:scale-105 transition-transform">
            <Zap size={18}/> {vocab.btnGuided}
          </button>
          <button onClick={setManualMode} className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl hover:bg-slate-700 transition-colors">
            {vocab.btnManual}
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VUE 2 : FORMULAIRE GUIDÉ (AVEC UNITÉS)
  // ==========================================
  if (setupState === 'guided') {
    return (
      <div className="space-y-4 animate-in slide-in-from-right duration-300 pb-10">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-[2rem] shadow-xl">
          <h2 className="text-xl font-black text-[#ccff00] mb-4 flex items-center gap-2">
            <Zap size={20} /> AI Macro Coach
          </h2>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">{vocab.stepGender}</label>
                <select value={guideData.gender} onChange={e => setGuideData({...guideData, gender: e.target.value})} className="w-full bg-slate-800 text-white p-3 rounded-xl outline-none focus:border-[#ccff00] border border-transparent font-bold">
                  <option value="M">{isFr ? 'Homme' : 'Male'}</option>
                  <option value="F">{isFr ? 'Femme' : 'Female'}</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">{vocab.stepAge}</label>
                <input type="number" value={guideData.age} onChange={e => setGuideData({...guideData, age: Number(e.target.value)})} className="w-full bg-slate-800 text-white p-3 rounded-xl outline-none focus:border-[#ccff00] border border-transparent font-bold" />
              </div>
            </div>

            <div className="flex gap-4">
              {/* POIDS AVEC BOUTON BASCULE */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{vocab.stepWeight}</label>
                  <button 
                    onClick={() => setGuideData({...guideData, weightUnit: guideData.weightUnit === 'lbs' ? 'kg' : 'lbs'})}
                    className="text-[9px] bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-[#ccff00] font-black transition-colors"
                  >
                    {guideData.weightUnit.toUpperCase()}
                  </button>
                </div>
                <input type="number" value={guideData.weight} onChange={e => setGuideData({...guideData, weight: Number(e.target.value)})} className="w-full bg-slate-800 text-white p-3 rounded-xl outline-none focus:border-[#ccff00] border border-transparent font-bold" />
              </div>
              
              {/* TAILLE AVEC BOUTON BASCULE */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{vocab.stepHeight}</label>
                  <button 
                    onClick={() => setGuideData({...guideData, heightUnit: guideData.heightUnit === 'cm' ? 'ft' : 'cm'})}
                    className="text-[9px] bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-[#ccff00] font-black transition-colors"
                  >
                    {guideData.heightUnit.toUpperCase()}
                  </button>
                </div>
                {guideData.heightUnit === 'cm' ? (
                  <input type="number" value={guideData.height} onChange={e => setGuideData({...guideData, height: Number(e.target.value)})} className="w-full bg-slate-800 text-white p-3 rounded-xl outline-none focus:border-[#ccff00] border border-transparent font-bold" />
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input type="number" value={guideData.heightFt} onChange={e => setGuideData({...guideData, heightFt: Number(e.target.value)})} className="w-full bg-slate-800 text-white p-3 rounded-xl outline-none focus:border-[#ccff00] border border-transparent font-bold pr-6" />
                      <span className="absolute right-2 top-3.5 text-xs font-bold text-slate-500">{vocab.ft}</span>
                    </div>
                    <div className="relative flex-1">
                      <input type="number" value={guideData.heightIn} onChange={e => setGuideData({...guideData, heightIn: Number(e.target.value)})} className="w-full bg-slate-800 text-white p-3 rounded-xl outline-none focus:border-[#ccff00] border border-transparent font-bold pr-6" />
                      <span className="absolute right-2 top-3.5 text-xs font-bold text-slate-500">{vocab.in}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">{vocab.stepActivity}</label>
              <select value={guideData.activity} onChange={e => setGuideData({...guideData, activity: Number(e.target.value)})} className="w-full bg-slate-800 text-white p-3 rounded-xl outline-none focus:border-[#ccff00] border border-transparent font-bold">
                <option value={1.2}>{vocab.actLow}</option>
                <option value={1.55}>{vocab.actMed}</option>
                <option value={1.725}>{vocab.actHigh}</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">{vocab.stepGoal}</label>
              <select value={guideData.goal} onChange={e => setGuideData({...guideData, goal: Number(e.target.value)})} className="w-full bg-slate-800 text-white p-3 rounded-xl outline-none focus:border-[#ccff00] border border-transparent font-bold">
                <option value={-500}>{vocab.goalCut}</option>
                <option value={0}>{vocab.goalMaintain}</option>
                <option value={300}>{vocab.goalBulk}</option>
              </select>
            </div>

            <button onClick={calculateGuidedMacros} className="w-full bg-[#ccff00] text-black font-black uppercase tracking-widest py-4 rounded-xl mt-2 hover:scale-[1.02] transition-transform">
              {vocab.btnCalculate}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VUE 3 : APP NUTRITION PRINCIPALE
  // ==========================================
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
            <button onClick={() => { if(window.confirm(vocab.clearAll)) setWeeklyFoods(p => ({...p, [activeDay]: []})) }} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
              <RotateCcw size={16} />
            </button>
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
              <button onClick={() => setSetupState('guided')} className="text-[#ccff00] flex items-center gap-1 bg-slate-800 px-2 py-1 rounded"><Zap size={10}/> IA</button>
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

      {/* MODAL COACH ANTI-JUNK FOOD */}
      {coachAlert.active && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-red-500/50 p-6 rounded-3xl w-full max-w-sm shadow-[0_0_40px_rgba(239,68,68,0.2)] animate-in zoom-in duration-300">
            <div className="flex justify-center mb-4"><ShieldAlert size={50} className="text-red-500" /></div>
            <h3 className="text-xl font-black text-white text-center mb-2">{vocab.coachAlertTitle}</h3>
            <p className="text-sm text-slate-300 text-center mb-6 leading-relaxed">
              {isFr ? `Coach: Tu essaies d'ajouter "${coachAlert.foodName}" ? Ce n'est pas optimal pour tes macros. Essaie plutôt ` : `Coach: Trying to add "${coachAlert.foodName}"? That's not optimal for your goals. Try `}
              <span className="text-[#ccff00] font-bold">{coachAlert.altText}</span>.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  setForm(prev => ({...prev, name: coachAlert.altText.split(' ')[0]}));
                  setCoachAlert({active: false, foodName: '', altText: ''});
                }} 
                className="w-full bg-[#ccff00] text-black font-black py-3 rounded-xl hover:scale-105 transition-transform"
              >
                {vocab.coachAlertBtnFix}
              </button>
              <button 
                onClick={() => finalizeAddEntry(coachAlert.foodName)} 
                className="w-full bg-slate-800 text-slate-400 font-bold py-3 rounded-xl hover:text-white transition-colors"
              >
                {vocab.coachAlertBtnIgnore}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PANNEAU DE SAISIE */}
      <div className="fixed bottom-[85px] left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0f172a]/95 backdrop-blur-xl border-y border-slate-800/80 p-4 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="w-full space-y-3">
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
        </div>
      </div>
    </div>
  );
};

export default Nutrition;
