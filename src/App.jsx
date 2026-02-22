import React, { useState, useEffect } from 'react';
import { Activity, Wallet, Dumbbell, FlaskConical, Gift, UtensilsCrossed, Crown, Download, Trash2, Globe, Share, Zap } from 'lucide-react';

import Dashboard from './Dashboard';
import Budget from './Budget';
import Workout from './Workout';
import Lab from './Lab';
import Reward from './Reward';
import Nutrition from './Nutrition';

const App = () => {
  const loadState = (key, defaultValue) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  };

  // NOUVEAU : La langue commence à "null" si c'est la première fois
  const [lang, setLang] = useState(() => loadState('pos_lang', null));
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (lang) {
      localStorage.setItem('pos_lang', JSON.stringify(lang));
    }
  }, [lang]);

  const translations = {
    en: {
      appTitle: 'Grindup.pro',
      tabDashboard: 'Overview',
      tabBudget: 'Budget',
      tabWorkout: 'Training',
      tabLab: 'Lab',
      tabReward: 'Rewards',
      tabNutrition: 'Diet',
      goPremium: 'Go Premium',
      welcome: 'Welcome to the Grind.',
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
    },
    fr: {
      appTitle: 'Grindup.pro',
      tabDashboard: 'Aperçu',
      tabBudget: 'Budget',
      tabWorkout: 'Training',
      tabLab: 'Labo',
      tabReward: 'Rewards',
      tabNutrition: 'Diète',
      welcome: 'Bienvenue dans le Grind.',
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
    }
  };

  const handleLanguageSelect = (selectedLang) => {
    setLang(selectedLang);
    setShowWelcome(true);
    setTimeout(() => {
      setShowWelcome(false);
    }, 2000);
  };

  // --- ÉCRAN DE SÉLECTION DE LANGUE INITIAL ---
  if (!lang) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 selection:bg-[#ccff00] selection:text-black">
        <Zap size={60} className="text-[#ccff00] mb-8 animate-pulse" />
        <h1 className="text-3xl font-black text-white mb-2">GRINDUP<span className="text-[#ccff00]">.PRO</span></h1>
        <p className="text-slate-400 mb-10 text-sm">Choose your interface language</p>
        
        <div className="w-full max-w-xs space-y-4">
          <button onClick={() => handleLanguageSelect('en')} className="w-full bg-slate-800 border border-slate-700 hover:border-[#ccff00] text-white font-black py-4 rounded-2xl transition-all">
            ENGLISH
          </button>
          <button onClick={() => handleLanguageSelect('fr')} className="w-full bg-slate-800 border border-slate-700 hover:border-[#ccff00] text-white font-black py-4 rounded-2xl transition-all">
            FRANÇAIS
          </button>
        </div>
      </div>
    );
  }

  // --- ÉCRAN DE BIENVENUE RAPIDE ---
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center animate-in fade-in zoom-in duration-500">
        <h2 className="text-2xl font-black text-[#ccff00] uppercase tracking-widest">
          {translations[lang].welcome}
        </h2>
      </div>
    );
  }

  const t = translations[lang];
  const toggleLanguage = () => setLang(lang === 'en' ? 'fr' : 'en');

  // ... (Le reste du code App.jsx classique pour l'installation, états, etc.)
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(() => localStorage.getItem('pos_hide_prompt') !== 'true');

  useEffect(() => {
    if (localStorage.getItem('pos_hide_prompt') === 'true') return;
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) { setShowInstallPrompt(false); localStorage.setItem('pos_hide_prompt', 'true'); return; }
    const ua = window.navigator.userAgent;
    const isIOSDevice = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i) || (!!ua.match(/Macintosh/i) && 'ontouchend' in document);
    if (isIOSDevice) { setIsIOS(true); setShowInstallPrompt(true); }
    const handleBeforeInstallPrompt = (e) => { e.preventDefault(); setDeferredPrompt(e); setShowInstallPrompt(true); };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const dismissPrompt = () => { setShowInstallPrompt(false); localStorage.setItem('pos_hide_prompt', 'true'); };
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') dismissPrompt();
      setDeferredPrompt(null);
    }
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPremium, setShowPremium] = useState(false);
  const [xp, setXp] = useState(() => loadState('pos_xp_v2', 0));
  const [expenses] = useState(() => loadState('pos_budget_v5_m' + new Date().getMonth(), { fixed: [], variables: [], autoTransfers: [], incomeBase: 0, incomeTS: 0 }));
  const [payFreq] = useState(() => loadState('pos_pay_freq_v5', 2));
  
  const balance = (Number(expenses.incomeBase) + Number(expenses.incomeTS)) - ((expenses.autoTransfers ? expenses.autoTransfers.reduce((sum, item) => sum + Number(item.amount), 0) : 0) * payFreq + (expenses.fixed ? expenses.fixed.reduce((sum, item) => sum + Number(item.amount), 0) : 0) + (expenses.variables ? expenses.variables.reduce((sum, item) => sum + Number(item.spent), 0) : 0));
  
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

  useEffect(() => localStorage.setItem('pos_xp_v2', JSON.stringify(xp)), [xp]);
  useEffect(() => localStorage.setItem('pos_protocols', JSON.stringify(protocols)), [protocols]);
  useEffect(() => localStorage.setItem('pos_workouts', JSON.stringify(workouts)), [workouts]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-[#ccff00] selection:text-black flex justify-center">
      <div className="w-full max-w-md bg-[#0f172a] min-h-screen relative shadow-2xl flex flex-col border-x border-slate-800/50">
        
        <header className="px-6 pt-10 pb-4 flex justify-between items-center bg-[#0f172a]/95 backdrop-blur-md z-40 sticky top-0 border-b border-slate-800/80">
          <div>
            <p className="text-3xl font-black text-white capitalize tracking-tight">
              {activeTab === 'dashboard' && t.tabDashboard}
              {activeTab === 'budget' && t.tabBudget}
              {activeTab === 'nutrition' && t.tabNutrition}
              {activeTab === 'workout' && t.tabWorkout}
              {activeTab === 'lab' && t.tabLab}
              {activeTab === 'reward' && t.tabReward}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleLanguage} className="px-3 py-2.5 bg-slate-800 rounded-xl border border-slate-700 text-white font-bold text-xs flex items-center gap-2 hover:bg-slate-700 transition-colors">
              <Globe size={16} /> {lang === 'en' ? 'FR' : 'EN'}
            </button>
            <button onClick={() => setShowPremium(true)} className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 text-[#ccff00] hover:bg-slate-700 transition-colors">
              <Crown size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 pt-6 pb-28 no-scrollbar">
          {activeTab === 'dashboard' && <Dashboard t={t} xp={xp} setXp={setXp} balance={balance} protocols={protocols} setProtocols={setProtocols} setActiveTab={setActiveTab} />}
          {activeTab === 'budget' && <Budget t={t} />}
          {activeTab === 'nutrition' && <Nutrition t={t} />}
          {activeTab === 'workout' && <Workout t={t} workouts={workouts} setWorkouts={setWorkouts} />}
          {activeTab === 'lab' && <Lab t={t} />}
          {activeTab === 'reward' && <Reward t={t} xp={xp} setXp={setXp} />}
        </main>

        <nav className="fixed bottom-0 w-full max-w-md bg-[#0f172a]/95 backdrop-blur-xl border-t border-slate-800 px-2 py-4 z-40 pb-6">
          <div className="flex justify-between items-center">
            {[
              { id: 'dashboard', icon: Activity, label: t.tabDashboard },
              { id: 'budget', icon: Wallet, label: t.tabBudget },
              { id: 'nutrition', icon: UtensilsCrossed, label: t.tabNutrition },
              { id: 'workout', icon: Dumbbell, label: t.tabWorkout },
              { id: 'lab', icon: FlaskConical, label: t.tabLab },
              { id: 'reward', icon: Gift, label: t.tabReward }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center gap-1.5 w-12 transition-all duration-300 ${isActive ? 'text-[#ccff00] -translate-y-1' : 'text-slate-500 hover:text-slate-400'}`}>
                  <Icon size={isActive ? 20 : 18} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-[7px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-70'}`}>{tab.label}</span>
                  {isActive && <div className="w-1 h-1 bg-[#ccff00] rounded-full mt-0.5 shadow-[0_0_8px_#ccff00]" />}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default App;
