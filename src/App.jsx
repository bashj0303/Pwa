import React, { useState, useEffect } from 'react';
import { Activity, Wallet, Dumbbell, FlaskConical, Gift, UtensilsCrossed, Crown, Download, Trash2, Globe, Share, Zap, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';

// Import de tes pages actuelles
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

  const [lang, setLang] = useState(() => loadState('pos_lang', 'en'));
  
  // NOUVEAU : État d'Abonnement (Mock pour le test)
  const [hasSubscription, setHasSubscription] = useState(() => loadState('pos_sub_active', false));

  useEffect(() => {
    localStorage.setItem('pos_lang', JSON.stringify(lang));
    localStorage.setItem('pos_sub_active', JSON.stringify(hasSubscription));
  }, [lang, hasSubscription]);

  const translations = {
    en: {
      appTitle: 'Grindup.pro',
      tabDashboard: 'Overview', tabBudget: 'Budget', tabWorkout: 'Training',
      tabLab: 'Lab', tabReward: 'Rewards', tabNutrition: 'Diet',
      
      // Paywall
      pwTitle: 'UNLOCK YOUR POTENTIAL',
      pwSubtitle: 'The ultimate Life OS for the dedicated 1%.',
      pwFeature1: 'Smart AI Diet Coach',
      pwFeature2: 'Aesthetic Workout Tracker',
      pwFeature3: 'Advanced Peptide Lab Protocols',
      pwFeature4: 'Zero-Stress Financial Budget',
      pwPrice: '$2.99',
      pwPerMonth: '/ month',
      pwTrial: '14-DAY FREE TRIAL',
      pwCancel: 'Cancel anytime. No commitment.',
      pwBtn: 'Start Free Trial',
      pwRestore: 'Already have an account? Log in'
    },
    fr: {
      appTitle: 'Grindup.pro',
      tabDashboard: 'Aperçu', tabBudget: 'Budget', tabWorkout: 'Training',
      tabLab: 'Labo', tabReward: 'Rewards', tabNutrition: 'Diète',
      
      // Paywall
      pwTitle: 'DÉBLOQUE TON POTENTIEL',
      pwSubtitle: 'Le "Life OS" ultime pour le 1% qui grind.',
      pwFeature1: 'Coach IA Diète Intelligent',
      pwFeature2: 'Tracker Workout Aesthetic',
      pwFeature3: 'Protocoles Labo Peptides',
      pwFeature4: 'Budget Financier Zéro-Stress',
      pwPrice: '2.99$',
      pwPerMonth: '/ mois',
      pwTrial: '14 JOURS D\'ESSAI GRATUIT',
      pwCancel: 'Annulable en tout temps. Zéro engagement.',
      pwBtn: 'Commencer mon essai gratuit',
      pwRestore: 'Déjà un compte ? Connecte-toi'
    }
  };

  const t = translations[lang];
  const toggleLanguage = () => setLang(lang === 'en' ? 'fr' : 'en');

  // =========================================================================
  // LE "PAYWALL" (MUR PAYANT) - Bloque l'accès si pas d'abonnement
  // =========================================================================
  if (!hasSubscription) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col justify-between selection:bg-[#ccff00] selection:text-black relative overflow-hidden">
        
        {/* Changement de langue discret en haut */}
        <div className="absolute top-6 right-6 z-20">
          <button onClick={toggleLanguage} className="bg-slate-800/80 text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-slate-700 backdrop-blur-sm">
            {lang === 'en' ? 'FR' : 'EN'}
          </button>
        </div>

        {/* Effet visuel Background */}
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[50%] bg-gradient-to-b from-[#ccff00]/10 to-transparent blur-3xl pointer-events-none" />

        <div className="px-6 pt-16 pb-8 relative z-10 flex-1 flex flex-col">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white leading-tight">
              GRINDUP<span className="text-[#ccff00]">.PRO</span>
            </h1>
            <p className="text-slate-400 font-bold mt-2">{t.pwSubtitle}</p>
          </div>

          {/* Liste des fonctionnalités */}
          <div className="space-y-4 mb-auto">
            {[
              { icon: UtensilsCrossed, text: t.pwFeature1 },
              { icon: Dumbbell, text: t.pwFeature2 },
              { icon: FlaskConical, text: t.pwFeature3 },
              { icon: Wallet, text: t.pwFeature4 },
            ].map((feat, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-slate-800/40 border border-slate-700/50 p-3.5 rounded-2xl">
                <div className="bg-black/50 p-2 rounded-xl text-[#ccff00]">
                  <feat.icon size={20} />
                </div>
                <span className="text-sm font-bold text-slate-200">{feat.text}</span>
                <CheckCircle2 size={16} className="text-emerald-500 ml-auto opacity-50" />
              </div>
            ))}
          </div>

          {/* Zone de Prix & Bouton Stripe */}
          <div className="mt-8 bg-slate-900 border border-slate-700 p-6 rounded-[2rem] shadow-[0_0_40px_rgba(0,0,0,0.5)] text-center relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ccff00] text-black text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-lg">
              {t.pwTrial}
            </div>
            
            <div className="flex items-baseline justify-center gap-1 mt-4 mb-4">
              <span className="text-5xl font-black text-white">{t.pwPrice}</span>
              <span className="text-slate-500 font-bold text-sm">{t.pwPerMonth}</span>
            </div>

            <p className="text-[10px] text-slate-400 font-bold mb-6 flex items-center justify-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              {t.pwCancel}
            </p>

            <button 
              onClick={() => {
                // ICI: Plus tard, ce bouton redirigera vers le lien de paiement Stripe (Checkout).
                // Pour le moment on simule un abonnement réussi pour que tu puisses tester l'app.
                setHasSubscription(true);
              }}
              className="w-full bg-[#ccff00] text-black font-black uppercase tracking-widest py-4 rounded-xl flex justify-center items-center gap-2 hover:scale-[102%] transition-transform shadow-[0_0_20px_rgba(204,255,0,0.2)]"
            >
              <Lock size={18} /> {t.pwBtn}
            </button>

            <button className="mt-5 text-[10px] text-slate-500 font-bold underline hover:text-white transition-colors">
              {t.pwRestore}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // LE RESTE DE L'APPLICATION (Accessible uniquement si abonné)
  // =========================================================================
  
  // (Note: J'ai retiré ton ancien popup d'installation ici pour alléger, on pourra le remettre)
  const [activeTab, setActiveTab] = useState('dashboard');
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

  useEffect(() => localStorage.setItem('pos_xp_v2', JSON.stringify(xp)), [xp]);
  useEffect(() => localStorage.setItem('pos_protocols', JSON.stringify(protocols)), [protocols]);

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
            <button 
              onClick={() => {
                if(window.confirm("Test: Se déconnecter / Simuler perte abonnement ?")) {
                  setHasSubscription(false);
                }
              }} 
              className="px-3 py-2.5 bg-slate-800 rounded-xl border border-slate-700 text-slate-500 hover:text-red-400 transition-colors text-[10px] font-bold"
            >
              LOGOUT
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 pt-6 pb-28 no-scrollbar">
          {activeTab === 'dashboard' && <Dashboard t={t} xp={xp} setXp={setXp} balance={balance} protocols={protocols} setProtocols={setProtocols} setActiveTab={setActiveTab} />}
          {activeTab === 'budget' && <Budget t={t} />}
          {activeTab === 'nutrition' && <Nutrition t={t} />}
          {activeTab === 'workout' && <Workout t={t} />}
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
