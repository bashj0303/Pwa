
import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Wallet, 
  Dumbbell, 
  FlaskConical, 
  Crown, 
  CheckCircle2, 
  Circle, 
  ArrowRight,
  Syringe,
  Download,
  Plus,
  Trash2,
  Globe,
  Share
} from 'lucide-react';

const App = () => {
  // --- SAUVEGARDE LOCALE (PERSISTANCE) ---
  const loadState = (key, defaultValue) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  };

  const [lang, setLang] = useState(() => loadState('pos_lang', 'en'));

  useEffect(() => {
    localStorage.setItem('pos_lang', JSON.stringify(lang));
  }, [lang]);

  // --- DICTIONNAIRE (i18n) ---
  const translations = {
    en: {
      appTitle: 'Grindup.pro',
      tabDashboard: 'Overview',
      tabBudget: 'Budget',
      tabWorkout: 'Training',
      tabLab: 'Lab',
      goPremium: 'Go Premium',
      premiumDesc: 'Unlock cloud sync, advanced protocols and data export.',
      subscribe: 'Subscribe',
      cancel: 'Cancel',
      month: 'month',
      installApp: 'Install App',
      installDesc: 'Quick access from home screen',
      installBtn: 'Add',
      installIOS: 'To install on iPhone:',
      step1: '1. Tap the Share icon below',
      step2: '2. Select "Add to Home Screen"',
      close: 'Close',
      budgetLeft: 'Budget Remaining',
      biohacking: 'Biohacking & Habits',
      finances: 'Finances',
      add: 'Add',
      spent: 'Spent',
      limit: 'Limit',
      expenseNamePrompt: 'Expense name?',
      todaysSession: "Today's Session",
      exercise: 'Exercise',
      weightLbs: 'Weight (Lbs)',
      setsReps: 'Sets x Reps',
      exerciseNamePrompt: 'Exercise name?',
      smartSolver: 'Smart Solver',
      solverDesc: 'Optimizes dilution for clean, round numbers on the syringe.',
      refProtocol: 'Reference Protocol',
      vialMg: 'Vial Size (mg)',
      doseMcg: 'Your Dose (mcg)',
      largeVial: 'Large vial (> 3ml) ?',
      idealScenarios: 'Ideal Scenarios',
      addWater: 'ADD WATER',
      tooMuchWater: 'TOO MUCH WATER',
      pullTo: 'PULL TO',
      overflow: 'Overflows vial',
      syringeAdviceFine: 'Use 0.3ml/0.5ml syringe',
      syringeAdviceStandard: 'Standard 0.5ml/1ml syringe',
      educationalWarning: '⚠️ Educational tool. Always double-check your math.',
      enterValues: 'Enter your values to see solutions.',
      customProtocol: 'Custom Protocol',
      customNote: 'Enter your vial values',
      cjcNote: 'Standard saturation dose (AM/PM)',
      motsNote: 'Mitochondrial standard: 5mg to 10mg / week',
      semaxNote: 'Nootropic: 200-500mcg',
    },
    fr: {
      appTitle: 'Grindup.pro',
      tabDashboard: 'Aperçu',
      tabBudget: 'Budget',
      tabWorkout: 'Training',
      tabLab: 'Labo',
      goPremium: 'Passez Premium',
      premiumDesc: 'Débloquez la synchro cloud, les protocoles avancés et l\'export.',
      subscribe: 'S\'abonner',
      cancel: 'Annuler',
      month: 'mois',
      installApp: 'Installer l\'application',
      installDesc: 'Accès rapide depuis l\'écran d\'accueil',
      installBtn: 'Ajouter',
      installIOS: 'Pour installer sur iPhone :',
      step1: '1. Touchez l\'icône Partager en bas',
      step2: '2. Choisissez "Sur l\'écran d\'accueil"',
      close: 'Fermer',
      budgetLeft: 'Budget Restant',
      biohacking: 'Biohacking & Habitudes',
      finances: 'Finances',
      add: 'Ajouter',
      spent: 'Dépensé',
      limit: 'Limite',
      expenseNamePrompt: 'Nom de la dépense ?',
      todaysSession: 'Séance du jour',
      exercise: 'Exercice',
      weightLbs: 'Poids (Lbs)',
      setsReps: 'Séries x Reps',
      exerciseNamePrompt: 'Nom de l\'exercice ?',
      smartSolver: 'Solveur Intelligent',
      solverDesc: 'Optimise la dilution pour tomber sur des chiffres ronds.',
      refProtocol: 'Protocole de Référence',
      vialMg: 'Taille Fiole (mg)',
      doseMcg: 'Votre Dose (mcg)',
      largeVial: 'Grosse fiole (> 3ml) ?',
      idealScenarios: 'Scénarios Idéaux',
      addWater: 'AJOUTEZ EAU',
      tooMuchWater: 'TROP D\'EAU',
      pullTo: 'TIREZ À',
      overflow: 'Déborde fiole',
      syringeAdviceFine: 'Seringue 0.3ml/0.5ml',
      syringeAdviceStandard: 'Seringue 0.5ml/1ml standard',
      educationalWarning: '⚠️ Outil éducatif. Vérifiez vos mélanges.',
      enterValues: 'Entrez vos valeurs pour voir les solutions.',
      customProtocol: 'Personnalisé',
      customNote: 'Entrez les valeurs de votre fiole',
      cjcNote: 'Dose de saturation standard (AM/PM)',
      motsNote: 'Standard mitochondrial: 5mg à 10mg / semaine',
      semaxNote: 'Nootropique: 200-500mcg',
    }
  };

  const t = translations[lang];
  const toggleLanguage = () => setLang(lang === 'en' ? 'fr' : 'en');

  // --- LOGIQUE D'INSTALLATION PWA (INTELLIGENTE & AVEC MÉMOIRE) ---
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  
  const [showInstallPrompt, setShowInstallPrompt] = useState(() => {
    return localStorage.getItem('pos_hide_prompt') !== 'true';
  });

  useEffect(() => {
    if (localStorage.getItem('pos_hide_prompt') === 'true') return;

    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    
    if (isStandalone) {
      setShowInstallPrompt(false);
      localStorage.setItem('pos_hide_prompt', 'true');
      return;
    }

    const ua = window.navigator.userAgent;
    const isIOSDevice = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i) || (!!ua.match(/Macintosh/i) && 'ontouchend' in document);
    
    if (isIOSDevice) {
      setIsIOS(true);
      setShowInstallPrompt(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const dismissPrompt = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pos_hide_prompt', 'true');
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        dismissPrompt();
      }
      setDeferredPrompt(null);
    }
  };

  // --- ÉTATS GLOBAUX ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPremium, setShowPremium] = useState(false);

  const [balance, setBalance] = useState(() => loadState('pos_balance', 3350));
  const [expenses, setExpenses] = useState(() => loadState('pos_expenses', [
    { id: 1, name: 'Peptides & Supps', amount: 450, limit: 600 },
    { id: 2, name: 'Groceries', amount: 300, limit: 500 },
  ]));
  
  const [protocols, setProtocols] = useState(() => loadState('pos_protocols', [
    { id: 1, name: 'CJC 100mcg / IPA 100mcg (AM)', done: false },
    { id: 2, name: 'CJC 100mcg / IPA 100mcg (PM)', done: false },
    { id: 3, name: 'MOTS-c 1mg', done: false },
    { id: 4, name: 'Semax', done: false },
  ]));

  const [workouts, setWorkouts] = useState(() => loadState('pos_workouts', [
    { id: 1, name: 'Bench Press', weight: 225, reps: '3x8' },
    { id: 2, name: 'Incline DB Press', weight: 90, reps: '3x10' },
  ]));

  useEffect(() => localStorage.setItem('pos_balance', JSON.stringify(balance)), [balance]);
  useEffect(() => localStorage.setItem('pos_expenses', JSON.stringify(expenses)), [expenses]);
  useEffect(() => localStorage.setItem('pos_protocols', JSON.stringify(protocols)), [protocols]);
  useEffect(() => localStorage.setItem('pos_workouts', JSON.stringify(workouts)), [workouts]);

  // --- ÉTATS DU LABO ---
  const [calcMg, setCalcMg] = useState('5');
  const [calcDose, setCalcDose] = useState('100');
  const [largeVial, setLargeVial] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('CJC-1295 / Ipamorelin');

  const peptidePresets = {
    'CJC-1295 / Ipamorelin': { mg: '5', dose: '100', noteKey: 'cjcNote' },
    'MOTS-c': { mg: '10', dose: '1000', noteKey: 'motsNote' },
    'Semax': { mg: '5', dose: '300', noteKey: 'semaxNote' },
    [t.customProtocol]: { mg: '', dose: '', noteKey: 'customNote' }
  };

  const handlePresetChange = (e) => {
    const val = e.target.value;
    setSelectedProduct(val);
    if (val !== t.customProtocol && val !== translations['en'].customProtocol && val !== translations['fr'].customProtocol) {
      setCalcMg(peptidePresets[val].mg);
      setCalcDose(peptidePresets[val].dose);
    } else {
      setCalcMg('');
      setCalcDose('');
    }
  };

  const toggleProtocol = (id) => {
    setProtocols(protocols.map(p => p.id === id ? { ...p, done: !p.done } : p));
  };

  const addExpense = () => {
    const name = prompt(t.expenseNamePrompt);
    if (!name) return;
    setExpenses([...expenses, { id: Date.now(), name, amount: 0, limit: 100 }]);
  };

  const addWorkout = () => {
    const name = prompt(t.exerciseNamePrompt);
    if (!name) return;
    setWorkouts([...workouts, { id: Date.now(), name, weight: 0, reps: '3x10' }]);
  };

  // --- ONGLET 1 : DASHBOARD ---
  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-[2rem] text-center shadow-lg">
        <p className="text-slate-400 text-sm font-medium mb-1">{t.budgetLeft}</p>
        <h2 className="text-5xl font-black text-[#ccff00]">${balance}</h2>
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
                : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              {p.done ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              <span className="font-bold text-sm text-left">{p.name}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );

  // --- ONGLET 2 : BUDGET ---
  const renderBudget = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-white">{t.finances}</h2>
        <button onClick={addExpense} className="text-[#ccff00] font-bold text-sm bg-slate-800 px-4 py-2 rounded-xl flex items-center gap-2">
          <Plus size={16} /> {t.add}
        </button>
      </div>

      <div className="space-y-4">
        {expenses.map(exp => {
          const progress = Math.min((exp.amount / exp.limit) * 100, 100);
          const isOver = exp.amount > exp.limit;
          return (
            <div key={exp.id} className="bg-slate-800 p-5 rounded-3xl border border-slate-700 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-white">{exp.name}</span>
                <button 
                  onClick={() => setExpenses(expenses.filter(e => e.id !== exp.id))}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase mb-1 font-bold">{t.spent}</p>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">$</span>
                    <input 
                      type="number"
                      value={exp.amount}
                      onChange={(e) => setExpenses(expenses.map(x => x.id === exp.id ? {...x, amount: Number(e.target.value)} : x))}
                      className="bg-transparent border-b border-slate-700 text-white font-bold w-full focus:outline-none focus:border-[#ccff00]"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase mb-1 font-bold">{t.limit}</p>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">$</span>
                    <input 
                      type="number"
                      value={exp.limit}
                      onChange={(e) => setExpenses(expenses.map(x => x.id === exp.id ? {...x, limit: Number(e.target.value)} : x))}
                      className="bg-transparent border-b border-slate-700 text-[#ccff00] font-bold w-full focus:outline-none focus:border-[#ccff00]"
                    />
                  </div>
                </div>
              </div>

              <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-[#ccff00]'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // --- ONGLET 3 : WORKOUT ---
  const renderWorkout = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-white">{t.todaysSession}</h2>
        <button onClick={addWorkout} className="text-[#ccff00] font-bold text-sm bg-slate-800 px-4 py-2 rounded-xl flex items-center gap-2">
          <Plus size={16} /> {t.exercise}
        </button>
      </div>

      <div className="space-y-3">
        {workouts.map(w => (
          <div key={w.id} className="bg-slate-800 rounded-2xl p-4 border border-slate-700 flex justify-between items-center shadow-md">
            <div className="flex-1">
              <input 
                value={w.name}
                onChange={(e) => setWorkouts(workouts.map(x => x.id === w.id ? {...x, name: e.target.value} : x))}
                className="bg-transparent text-white font-bold w-full focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-slate-500 font-bold uppercase">{t.weightLbs}</span>
                <input 
                  type="number"
                  value={w.weight}
                  onChange={(e) => setWorkouts(workouts.map(x => x.id === w.id ? {...x, weight: e.target.value} : x))}
                  className="bg-transparent text-[#ccff00] font-black w-16 text-right focus:outline-none"
                />
              </div>
              <div className="w-px h-8 bg-slate-700"></div>
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-slate-500 font-bold uppercase">{t.setsReps}</span>
                <input 
                  value={w.reps}
                  onChange={(e) => setWorkouts(workouts.map(x => x.id === w.id ? {...x, reps: e.target.value} : x))}
                  className="bg-transparent text-white font-bold w-12 text-right focus:outline-none"
                />
              </div>
              <button onClick={() => setWorkouts(workouts.filter(x => x.id !== w.id))} className="ml-2 text-slate-600 hover:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // --- ONGLET 4 : LABO (Peptides) ---
  const renderSmartScenario = (targetUnit) => {
    const mg = parseFloat(calcMg) || 0;
    const doseMcg = parseFloat(calcDose) || 0;
    const maxCapacity = largeVial ? 10.0 : 3.0;
    
    if (mg <= 0 || doseMcg <= 0) return null;

    const totalMcg = mg * 1000;
    const neededWater = (totalMcg * targetUnit) / (doseMcg * 100);
    const isImpossible = neededWater > maxCapacity;
    
    if (neededWater > 15 || neededWater < 0.5) return null;

    return (
      <div className={`p-5 rounded-2xl border mb-4 shadow-md ${isImpossible ? 'bg-red-900/10 border-red-900/30' : 'bg-slate-800 border-slate-700'}`}>
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className={`text-[10px] font-bold ${isImpossible ? 'text-red-400' : 'text-slate-400'}`}>
              {isImpossible ? t.tooMuchWater : t.addWater}
            </span>
            <span className={`text-2xl font-black ${isImpossible ? 'text-red-500' : 'text-white'}`}>
              {neededWater.toFixed(1)} ml
            </span>
            {isImpossible && <span className="text-[9px] text-red-400 mt-1">{t.overflow} ({maxCapacity}ml)</span>}
          </div>
          <ArrowRight className={isImpossible ? 'text-red-900' : 'text-slate-600'} />
          <div className="flex flex-col items-end">
            <span className={`text-[10px] font-bold ${isImpossible ? 'text-red-400' : 'text-slate-400'}`}>{t.pullTo}</span>
            <span className={`text-2xl font-black ${isImpossible ? 'text-red-500' : 'text-[#ccff00]'}`}>{targetUnit} UI</span>
            {!isImpossible && <span className="text-[9px] text-slate-400 mt-1">{targetUnit <= 10 ? t.syringeAdviceFine : t.syringeAdviceStandard}</span>}
          </div>
        </div>
      </div>
    );
  };

  const renderLab = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-slate-800 p-6 rounded-[2rem] border border-slate-700 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 p-4 opacity-5"><Syringe size={120} /></div>
        <h2 className="text-xl font-black text-white mb-1">{t.smartSolver}</h2>
        <p className="text-sm text-slate-400 mb-6 relative z-10">{t.solverDesc}</p>
        
        <div className="mb-4 relative z-10">
          <label className="text-[10px] text-slate-400 font-bold mb-2 block uppercase tracking-wider">{t.refProtocol}</label>
          <select 
            className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl outline-none focus:border-[#ccff00] appearance-none"
            value={selectedProduct}
            onChange={handlePresetChange}
          >
            {Object.keys(peptidePresets).map(k => {
              const label = (k === 'Custom Protocol' || k === 'Personnalisé') ? t.customProtocol : k;
              return <option key={k} value={k}>{label}</option>
            })}
          </select>
          {peptidePresets[selectedProduct]?.noteKey && (
             <p className="text-[10px] text-[#ccff00] mt-2 italic">{t[peptidePresets[selectedProduct].noteKey]}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div>
            <label className="text-[10px] text-slate-400 font-bold mb-1 block uppercase">{t.vialMg}</label>
            <input 
              type="number" value={calcMg} onChange={(e) => setCalcMg(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white font-bold p-3 rounded-xl outline-none focus:border-[#ccff00]"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-bold mb-1 block uppercase">{t.doseMcg}</label>
            <input 
              type="number" value={calcDose} onChange={(e) => setCalcDose(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-[#ccff00] font-bold p-3 rounded-xl outline-none focus:border-[#ccff00]"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 relative z-10">
          <span className="text-xs text-white font-medium">{t.largeVial}</span>
          <button 
            onClick={() => setLargeVial(!largeVial)}
            className={`w-12 h-6 rounded-full transition-colors relative ${largeVial ? 'bg-[#ccff00]' : 'bg-slate-700'}`}
          >
            <div className={`w-4 h-4 bg-black rounded-full absolute top-1 transition-all ${largeVial ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {(parseFloat(calcMg) > 0 && parseFloat(calcDose) > 0) ? (
        <div>
          <h3 className="text-[10px] text-slate-400 font-bold mb-3 uppercase tracking-wider pl-2">{t.idealScenarios}</h3>
          <p className="text-[10px] text-center text-slate-600 mb-4 italic">{t.educationalWarning}</p>
          {renderSmartScenario(10)}
          {renderSmartScenario(5)}
          {renderSmartScenario(20)}
        </div>
      ) : (
        <p className="text-center text-slate-500 mt-8 text-sm">{t.enterValues}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-[#ccff00] selection:text-black flex justify-center">
      <div className="w-full max-w-md bg-[#0f172a] min-h-screen relative shadow-2xl flex flex-col border-x border-slate-800/50">
        
        <header className="px-6 pt-10 pb-4 flex justify-between items-center bg-[#0f172a]/95 backdrop-blur-md z-40 sticky top-0 border-b border-slate-800/80">
          <div>
            <p className="text-3xl font-black text-white capitalize tracking-tight">
              {activeTab === 'dashboard' && t.tabDashboard}
              {activeTab === 'budget' && t.tabBudget}
              {activeTab === 'workout' && t.tabWorkout}
              {activeTab === 'lab' && t.tabLab}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleLanguage}
              className="px-3 py-2.5 bg-slate-800 rounded-xl border border-slate-700 text-white font-bold text-xs flex items-center gap-2 hover:bg-slate-700 transition-colors"
            >
              <Globe size={16} />
              {lang === 'en' ? 'FR' : 'EN'}
            </button>
            <button onClick={() => setShowPremium(true)} className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 text-[#ccff00] hover:bg-slate-700 transition-colors">
              <Crown size={20} />
            </button>
          </div>
        </header>

        {/* BANNIÈRE D'INSTALLATION INTELLIGENTE */}
        {showInstallPrompt && (
          <div className="bg-[#ccff00] text-black p-4 rounded-2xl mx-4 mt-4 shadow-lg animate-in slide-in-from-top duration-500 relative">
            <button onClick={dismissPrompt} className="absolute top-2 right-2 p-1 opacity-50 hover:opacity-100">
              <Trash2 size={14} />
            </button>
            
            <div className="flex items-start gap-3">
              <div className="bg-black/10 p-2 rounded-xl text-black mt-1"><Download size={20} /></div>
              <div className="flex-1">
                <p className="font-bold text-sm mb-1">{t.installApp}</p>
                
                {isIOS ? (
                  <div className="space-y-1 text-xs font-medium opacity-80">
                    <p>{t.installIOS}</p>
                    <p className="flex items-center gap-1">{t.step1} <Share size={12} /></p>
                    <p>{t.step2}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-[10px] opacity-80 font-medium mb-3">{t.installDesc}</p>
                    <button onClick={handleInstallClick} className="w-full bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:scale-[1.02] transition-transform">
                      {t.installBtn}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contenu dynamique */}
        <main className="flex-1 overflow-y-auto px-6 pt-6 pb-28 no-scrollbar">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'budget' && renderBudget()}
          {activeTab === 'workout' && renderWorkout()}
          {activeTab === 'lab' && renderLab()}
        </main>

        {/* Navigation Basse */}
        <nav className="fixed bottom-0 w-full max-w-md bg-[#0f172a]/95 backdrop-blur-xl border-t border-slate-800 px-2 py-4 z-40 pb-8">
          <div className="flex justify-around items-center">
            {[
              { id: 'dashboard', icon: Activity, label: t.tabDashboard },
              { id: 'budget', icon: Wallet, label: t.tabBudget },
              { id: 'workout', icon: Dumbbell, label: t.tabWorkout },
              { id: 'lab', icon: FlaskConical, label: t.tabLab }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1.5 w-16 transition-all duration-300 ${isActive ? 'text-[#ccff00] -translate-y-1' : 'text-slate-500 hover:text-slate-400'}`}
                >
                  <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                    {tab.label}
                  </span>
                  {isActive && <div className="w-1 h-1 bg-[#ccff00] rounded-full mt-0.5 shadow-[0_0_8px_#ccff00]" />}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Modal Premium */}
        {showPremium && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-slate-800 border border-[#ccff00]/50 rounded-[2rem] w-full max-w-sm p-8 text-center relative shadow-[0_0_40px_rgba(204,255,0,0.15)]">
              <Crown className="w-16 h-16 text-[#ccff00] mx-auto mb-4" />
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">{t.goPremium}</h2>
              <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                {t.premiumDesc}
              </p>
              
              <div className="text-4xl font-black text-white mb-8">$4.99<span className="text-sm font-medium text-slate-500 ml-1">/ {t.month}</span></div>

              <button className="w-full bg-[#ccff00] text-black font-black uppercase tracking-wider py-4 rounded-xl mb-3 hover:scale-105 transition-transform">
                {t.subscribe}
              </button>
              <button onClick={() => setShowPremium(false)} className="w-full text-slate-500 font-bold py-3 text-sm hover:text-white transition-colors">
                {t.cancel}
              </button>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
      `}} />
    </div>
  );
};

export default App;
