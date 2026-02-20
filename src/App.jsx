import React, { useState, useEffect } from 'react';
import { Activity, Wallet, Dumbbell, FlaskConical, Crown, Download, Trash2, Globe, Share } from 'lucide-react';

// Importation de tes nouveaux fichiers !
import Dashboard from './Dashboard';
import Budget from './Budget';
import Workout from './Workout';
import Lab from './Lab';

const App = () => {
  const loadState = (key, defaultValue) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  };

  const [lang, setLang] = useState(() => loadState('pos_lang', 'en'));

  useEffect(() => {
    localStorage.setItem('pos_lang', JSON.stringify(lang));
  }, [lang]);

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
      budgetLeft: 'Remaining',
      totalBudget: 'Total Budget',
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
      rewardsTitle: 'Grindwear Rewards',
      xpPoints: 'XP',
      nextTier: 'Next Tier',
      freeShipping: 'Free Shipping',
      discount20: '20% OFF Store',
      freeHoodie: 'Free Hoodie',
      visitStore: 'Shop Grindwear',
      earnedXp: 'Earn XP by completing habits!'
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
      budgetLeft: 'Restant',
      totalBudget: 'Budget Total',
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
      rewardsTitle: 'Récompenses Grindwear',
      xpPoints: 'XP',
      nextTier: 'Prochain Palier',
      freeShipping: 'Livraison Gratuite',
      discount20: '-20% Boutique',
      freeHoodie: 'Hoodie Gratuit',
      visitStore: 'Boutique Grindwear',
      earnedXp: 'Gagnez de l\'XP avec vos habitudes !'
    }
  };

  const t = translations[lang];
  const toggleLanguage = () => setLang(lang === 'en' ? 'fr' : 'en');

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

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPremium, setShowPremium] = useState(false);
  const [xp, setXp] = useState(() => loadState('pos_xp', 140));
  const [expenses, setExpenses] = useState(() => loadState('pos_expenses', [
    { id: 1, name: 'Peptides & Supps', amount: 450, limit: 600 },
    { id: 2, name: 'Groceries', amount: 300, limit: 500 },
  ]));

  const totalLimit = expenses.reduce((sum, exp) => sum + exp.limit, 0);
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const balance = totalLimit - totalSpent;
  
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

  useEffect(() => localStorage.setItem('pos_xp', JSON.stringify(xp)), [xp]);
  useEffect(() => localStorage.setItem('pos_expenses', JSON.stringify(expenses)), [expenses]);
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

        <main className="flex-1 overflow-y-auto px-6 pt-6 pb-28 no-scrollbar">
          {/* C'est ici que l'App fait appel à tes nouveaux fichiers ! */}
          {activeTab === 'dashboard' && <Dashboard t={t} xp={xp} setXp={setXp} balance={balance} protocols={protocols} setProtocols={setProtocols} setActiveTab={setActiveTab} />}
          {activeTab === 'budget' && <Budget t={t} expenses={expenses} setExpenses={setExpenses} balance={balance} totalSpent={totalSpent} totalLimit={totalLimit} />}
          {activeTab === 'workout' && <Workout t={t} workouts={workouts} setWorkouts={setWorkouts} />}
          {activeTab === 'lab' && <Lab t={t} translations={translations} lang={lang} />}
        </main>

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
