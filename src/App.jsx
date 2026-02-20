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
  Trash2
} from 'lucide-react';

const App = () => {
  // --- SAUVEGARDE LOCALE (PERSISTANCE) ---
  const loadState = (key, defaultValue) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPremium, setShowPremium] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(true);

  // --- ÉTATS GLOBAUX ---
  const [balance, setBalance] = useState(() => loadState('pos_balance', 3350));
  const [expenses, setExpenses] = useState(() => loadState('pos_expenses', [
    { id: 1, name: 'Peptides & Supps', amount: 450, limit: 600 },
    { id: 2, name: 'Épicerie', amount: 300, limit: 500 },
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

  // Sauvegarde automatique à chaque changement
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
    'CJC-1295 / Ipamorelin': { mg: '5', dose: '100', note: 'Dose de saturation standard (AM/PM)' },
    'MOTS-c': { mg: '10', dose: '1000', note: 'Standard mitochondrial: 5mg à 10mg / semaine' },
    'Semax': { mg: '5', dose: '300', note: 'Nootropique: 200-500mcg' },
    'Personnalisé': { mg: '', dose: '', note: 'Entrez les valeurs de votre fiole' }
  };

  const handlePresetChange = (e) => {
    const val = e.target.value;
    setSelectedProduct(val);
    if (val !== 'Personnalisé') {
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
    const name = prompt("Nom de la dépense ?");
    if (!name) return;
    setExpenses([...expenses, { id: Date.now(), name, amount: 0, limit: 100 }]);
  };

  const addWorkout = () => {
    const name = prompt("Nom de l'exercice ?");
    if (!name) return;
    setWorkouts([...workouts, { id: Date.now(), name, weight: 0, reps: '3x10' }]);
  };

  // --- ONGLET 1 : DASHBOARD (Accueil) ---
  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-[2rem] text-center shadow-lg">
        <p className="text-slate-400 text-sm font-medium mb-1">Budget Restant</p>
        <h2 className="text-5xl font-black text-[#ccff00]">${balance}</h2>
      </div>

      <section>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity size={18} className="text-[#ccff00]" /> Biohacking & Habitudes
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
        <h2 className="text-2xl font-black text-white">Finances</h2>
        <button onClick={addExpense} className="text-[#ccff00] font-bold text-sm bg-slate-800 px-4 py-2 rounded-xl flex items-center gap-2">
          <Plus size={16} /> Ajouter
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
                  <p className="text-[10px] text-slate-500 uppercase mb-1 font-bold">Dépensé</p>
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
                  <p className="text-[10px] text-slate-500 uppercase mb-1 font-bold">Budget (Limite)</p>
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

              {/* Progress Bar */}
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
        <h2 className="text-2xl font-black text-white">Séance du jour</h2>
        <button onClick={addWorkout} className="text-[#ccff00] font-bold text-sm bg-slate-800 px-4 py-2 rounded-xl flex items-center gap-2">
          <Plus size={16} /> Exercice
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
                <span className="text-[9px] text-slate-500 font-bold uppercase">Poids (Lbs)</span>
                <input 
                  type="number"
                  value={w.weight}
                  onChange={(e) => setWorkouts(workouts.map(x => x.id === w.id ? {...x, weight: e.target.value} : x))}
                  className="bg-transparent text-[#ccff00] font-black w-16 text-right focus:outline-none"
                />
              </div>
              <div className="w-px h-8 bg-slate-700"></div>
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-slate-500 font-bold uppercase">Séries x Reps</span>
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
              {isImpossible ? "TROP D'EAU" : "AJOUTEZ EAU"}
            </span>
            <span className={`text-2xl font-black ${isImpossible ? 'text-red-500' : 'text-white'}`}>
              {neededWater.toFixed(1)} ml
            </span>
            {isImpossible && <span className="text-[9px] text-red-400 mt-1">Déborde fiole ({maxCapacity}ml)</span>}
          </div>
          <ArrowRight className={isImpossible ? 'text-red-900' : 'text-slate-600'} />
          <div className="flex flex-col items-end">
            <span className={`text-[10px] font-bold ${isImpossible ? 'text-red-400' : 'text-slate-400'}`}>TIREZ À</span>
            <span className={`text-2xl font-black ${isImpossible ? 'text-red-500' : 'text-[#ccff00]'}`}>{targetUnit} UI</span>
            {!isImpossible && <span className="text-[9px] text-slate-400 mt-1">{targetUnit <= 10 ? 'Seringue 0.3ml/0.5ml' : 'Seringue 0.5ml/1ml'}</span>}
          </div>
        </div>
      </div>
    );
  };

  const renderLab = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-slate-800 p-6 rounded-[2rem] border border-slate-700 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 p-4 opacity-5"><Syringe size={120} /></div>
        <h2 className="text-xl font-black text-white mb-1">Solveur Intelligent</h2>
        <p className="text-sm text-slate-400 mb-6 relative z-10">Optimise la dilution pour tomber sur des chiffres ronds.</p>
        
        <div className="mb-4 relative z-10">
          <label className="text-[10px] text-slate-400 font-bold mb-2 block uppercase tracking-wider">Protocole de Référence</label>
          <select 
            className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl outline-none focus:border-[#ccff00] appearance-none"
            value={selectedProduct}
            onChange={handlePresetChange}
          >
            {Object.keys(peptidePresets).map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          {peptidePresets[selectedProduct]?.note && (
             <p className="text-[10px] text-[#ccff00] mt-2 italic">{peptidePresets[selectedProduct].note}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div>
            <label className="text-[10px] text-slate-400 font-bold mb-1 block uppercase">Fiole (mg)</label>
            <input 
              type="number" value={calcMg} onChange={(e) => setCalcMg(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white font-bold p-3 rounded-xl outline-none focus:border-[#ccff00]"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-bold mb-1 block uppercase">Dose (mcg)</label>
            <input 
              type="number" value={calcDose} onChange={(e) => setCalcDose(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-[#ccff00] font-bold p-3 rounded-xl outline-none focus:border-[#ccff00]"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 relative z-10">
          <span className="text-xs text-white font-medium">Grosse fiole (&gt; 3ml) ?</span>
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
          <h3 className="text-[10px] text-slate-400 font-bold mb-3 uppercase tracking-wider pl-2">Scénarios Idéaux</h3>
          {renderSmartScenario(10)}
          {renderSmartScenario(5)}
          {renderSmartScenario(20)}
          <p className="text-[10px] text-center text-slate-600 mt-4 italic">⚠️ Outil éducatif. Vérifiez vos mélanges.</p>
        </div>
      ) : (
        <p className="text-center text-slate-500 mt-8 text-sm">Entrez vos valeurs pour voir les solutions.</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-[#ccff00] selection:text-black flex justify-center">
      {/* Container type Smartphone */}
      <div className="w-full max-w-md bg-[#0f172a] min-h-screen relative shadow-2xl flex flex-col border-x border-slate-800/50">
        
        {/* Header */}
        <header className="px-6 pt-8 pb-4 flex justify-between items-center bg-[#0f172a]/95 backdrop-blur-md z-40 sticky top-0 border-b border-slate-800/80">
          <div>
            <h1 className="text-[9px] uppercase tracking-[0.25em] text-[#ccff00] font-black">Performance OS</h1>
            <p className="text-2xl font-black text-white capitalize tracking-tight mt-1">
              {activeTab === 'dashboard' && 'Aperçu'}
              {activeTab === 'budget' && 'Budget'}
              {activeTab === 'workout' && 'Training'}
              {activeTab === 'lab' && 'Labo'}
            </p>
          </div>
          <button onClick={() => setShowPremium(true)} className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 text-[#ccff00] hover:bg-slate-700 transition-colors">
            <Crown size={20} />
          </button>
        </header>

        {/* Bannière d'installation PWA */}
        {showInstallPrompt && (
          <div className="bg-[#ccff00] text-black px-4 py-3 flex justify-between items-center rounded-2xl mx-4 mt-4 shadow-lg animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-3">
              <div className="bg-black/10 p-2 rounded-xl text-black"><Download size={18} /></div>
              <div>
                <p className="font-bold text-sm leading-tight">Installer l'application</p>
                <p className="text-[10px] opacity-80 font-medium">Accès rapide depuis l'écran d'accueil</p>
              </div>
            </div>
            <button onClick={() => setShowInstallPrompt(false)} className="bg-black text-white text-xs font-bold px-4 py-2 rounded-xl hover:scale-105 transition-transform">
              Fermer
            </button>
          </div>
        )}

        {/* Contenu dynamique */}
        <main className="flex-1 overflow-y-auto px-6 pt-6 pb-28 no-scrollbar">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'budget' && renderBudget()}
          {activeTab === 'workout' && renderWorkout()}
          {activeTab === 'lab' && renderLab()}
        </main>

        {/* Navigation Basse (4 Onglets) */}
        <nav className="absolute bottom-0 w-full bg-[#0f172a]/95 backdrop-blur-xl border-t border-slate-800 px-2 py-4 z-40 pb-8">
          <div className="flex justify-around items-center">
            {[
              { id: 'dashboard', icon: Activity, label: 'Accueil' },
              { id: 'budget', icon: Wallet, label: 'Budget' },
              { id: 'workout', icon: Dumbbell, label: 'Training' },
              { id: 'lab', icon: FlaskConical, label: 'Labo' }
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
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Passez en Premium</h2>
              <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                Débloquez la synchronisation cloud, des protocoles avancés et exportez vos données en PDF.
              </p>
              
              <div className="text-4xl font-black text-white mb-8">$4.99<span className="text-sm font-medium text-slate-500 ml-1">/ mois</span></div>

              <button className="w-full bg-[#ccff00] text-black font-black uppercase tracking-wider py-4 rounded-xl mb-3 hover:scale-105 transition-transform">
                S'abonner
              </button>
              <button onClick={() => setShowPremium(false)} className="w-full text-slate-500 font-bold py-3 text-sm hover:text-white transition-colors">
                Annuler
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