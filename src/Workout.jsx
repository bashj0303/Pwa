import React, { useState, useEffect } from 'react';
import { Save, Check, Target, Plus, Trash2, Dumbbell, Zap, ShieldAlert, Bot, Loader2 } from 'lucide-react';

// ==========================================
// 🔴 TA CLÉ GOOGLE AI STUDIO (GEMINI) 🔴
// ==========================================
const GEMINI_API_KEY = 'AIzaSyCkvn67Uhrw8SquI4uLkRF8zboTL9B2BvA';

const Workout = ({ t }) => {
  const isFr = t.month === 'mois';

  const vocab = {
    title: 'TRAINING',
    subtitle: 'BLUEPRINT',
    desc: isFr ? 'Programme & Coach IA' : 'Program & AI Coach',
    save: isFr ? 'SAUVEGARDER' : 'SAVE',
    saved: isFr ? 'SAUVEGARDÉ!' : 'SAVED!',
    
    statsTitle: isFr ? 'Mensurations & Énergie' : 'Body Stats & Energy',
    weight: isFr ? 'Poids' : 'Weight',
    waist: isFr ? 'Taille (cm)' : 'Waist (cm)',
    energy: isFr ? 'Énergie (1-10)' : 'Energy (1-10)',

    reps: 'Reps',
    addExercise: isFr ? 'Ajouter' : 'Add',
    promptName: isFr ? 'Nom de l\'exercice ?' : 'Exercise name?',
    promptSets: isFr ? 'Séries ? (ex: 4)' : 'Sets? (e.g. 4)',
    promptReps: isFr ? 'Reps visées ? (ex: 8-12)' : 'Target reps? (e.g. 8-12)',
    emptyDay: isFr ? 'Jour de repos. Profites-en pour récupérer !' : 'Rest day. Take time to recover!',
    
    templatesTitle: isFr ? 'Programmes Pré-Bâtis' : 'Pre-built Programs',
    warnTemplate: isFr ? 'Attention : Charger ce programme va effacer ton programme actuel. Continuer ?' : 'Warning: Loading this program will erase your current one. Continue?',
    
    // IA Coach Workout
    aiCoachTitle: isFr ? 'Générateur de Workout IA' : 'AI Workout Generator',
    aiCoachPlaceholder: isFr ? 'ex: J\'ai 30 mins, juste des haltères, et je veux focus sur le haut des pecs...' : 'e.g. I have 30 mins, only dumbbells, want to focus on upper chest...',
    aiBtnGenerate: isFr ? 'Générer le Workout' : 'Generate Workout',
    
    disclaimer: isFr 
      ? 'Avertissement : Consultez un médecin avant de commencer. Vous exécutez ces exercices à vos propres risques.'
      : 'Disclaimer: Consult a physician before starting. You perform these exercises at your own risk.',

    days: isFr 
      ? [{ id: 0, l: 'Lun' }, { id: 1, l: 'Mar' }, { id: 2, l: 'Mer' }, { id: 3, l: 'Jeu' }, { id: 4, l: 'Ven' }, { id: 5, l: 'Sam' }, { id: 6, l: 'Dim' }]
      : [{ id: 0, l: 'Mon' }, { id: 1, l: 'Tue' }, { id: 2, l: 'Wed' }, { id: 3, l: 'Thu' }, { id: 4, l: 'Fri' }, { id: 5, l: 'Sat' }, { id: 6, l: 'Sun' }]
  };

  const PREBUILT_TEMPLATES = {
    aesthetic: {
      0: [ { id: '1', name: "Incline DB Press", sets: 4, targetReps: "8-10" }, { id: '2', name: "Machine Chest Press", sets: 3, targetReps: "8-10" }, { id: '3', name: "Cable Flyes", sets: 4, targetReps: "12-15" } ],
      1: [ { id: '7', name: "Wide Pull-Ups", sets: 4, targetReps: "Failure" }, { id: '8', name: "Lat Pulldowns", sets: 4, targetReps: "10-12" } ],
      2: [ { id: '13', name: "Barbell Squat", sets: 4, targetReps: "6-8" }, { id: '14', name: "Leg Press", sets: 4, targetReps: "10-12" } ],
      3: [ { id: '19', name: "Seated Military Press", sets: 4, targetReps: "8-10" }, { id: '20', name: "DB Lateral Raises", sets: 5, targetReps: "12-15" } ],
      4: [ { id: '24', name: "Barbell Bicep Curls", sets: 4, targetReps: "8-10" }, { id: '25', name: "Skull Crushers", sets: 4, targetReps: "8-10" } ],
      5: [], 6: []
    }
  };

  const getTodayIndex = () => { let day = new Date().getDay(); return day === 0 ? 6 : day - 1; };

  const [activeDay, setActiveDay] = useState(getTodayIndex());
  const [showSaved, setShowSaved] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [weightUnit, setWeightUnit] = useState(() => localStorage.getItem('pos_workout_unit') || 'lbs');

  // --- IA ÉTATS ---
  const [showAIWorkout, setShowAIWorkout] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [routine, setRoutine] = useState(() => {
    const saved = localStorage.getItem('pos_routine_v4');
    return saved ? JSON.parse(saved) : PREBUILT_TEMPLATES.aesthetic;
  });

  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('pos_workout_logs_v4');
    return saved ? JSON.parse(saved) : {};
  });

  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('pos_body_stats_v4');
    return saved ? JSON.parse(saved) : { weight: '', waist: '', energy: '' };
  });

  useEffect(() => localStorage.setItem('pos_workout_unit', weightUnit), [weightUnit]);
  useEffect(() => localStorage.setItem('pos_routine_v4', JSON.stringify(routine)), [routine]);
  useEffect(() => localStorage.setItem('pos_workout_logs_v4', JSON.stringify(logs)), [logs]);
  useEffect(() => localStorage.setItem('pos_body_stats_v4', JSON.stringify(stats)), [stats]);

  const handleSave = () => {
    const currentDayExercises = routine[activeDay] || [];
    const exportData = currentDayExercises.map(ex => {
      const exLog = logs[ex.id] || { lbs: 0, reps: 0 };
      return { id: ex.id, name: ex.name, weight: `${exLog.lbs || 0}${weightUnit}`, reps: `${ex.sets}x${exLog.reps || ex.targetReps}` };
    });
    if (exportData.length > 0) localStorage.setItem('pos_workouts', JSON.stringify(exportData));
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const updateLog = (id, field, value) => setLogs(prev => ({ ...prev, [id]: { ...(prev[id] || { lbs: '', reps: '' }), [field]: value } }));

  const handleAddExercise = () => {
    const name = prompt(vocab.promptName);
    if (!name) return;
    const sets = prompt(vocab.promptSets, "4");
    const reps = prompt(vocab.promptReps, "8-12");
    const newEx = { id: Date.now().toString(), name: name.charAt(0).toUpperCase() + name.slice(1), sets: sets || "4", targetReps: reps || "10" };
    setRoutine(prev => ({ ...prev, [activeDay]: [...(prev[activeDay] || []), newEx] }));
  };

  const handleDeleteExercise = (exId) => {
    if(window.confirm(isFr ? "Supprimer cet exercice ?" : "Delete this exercise?")) {
      setRoutine(prev => ({ ...prev, [activeDay]: prev[activeDay].filter(ex => ex.id !== exId) }));
    }
  };

  const loadTemplate = (templateKey) => {
    if(window.confirm(vocab.warnTemplate)) {
      setRoutine(PREBUILT_TEMPLATES[templateKey] || PREBUILT_TEMPLATES.aesthetic);
      setLogs({}); setShowTemplates(false); setActiveDay(0);
    }
  };

  // ==========================================
  // LA MAGIE DE GEMINI (GÉNÉRATEUR WORKOUT)
  // ==========================================
  const handleAIGenerateWorkout = async () => {
    if (!aiInput.trim()) return;
    setIsAiLoading(true);

    const promptText = `
      Tu es un coach sportif expert en musculation et hypertrophie.
      L'utilisateur te demande de lui créer un entraînement avec cette contrainte : "${aiInput}".
      
      Crée un programme d'entraînement adapté. Tu DOIS répondre UNIQUEMENT avec un tableau JSON valide. Pas de texte avant, pas de texte après, pas de markdown.
      
      Format exact exigé :
      [
        {"id": "id_unique_1", "name": "Nom de l'exercice 1", "sets": "4", "targetReps": "10-12"},
        {"id": "id_unique_2", "name": "Nom de l'exercice 2", "sets": "3", "targetReps": "failure"}
      ]
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      let rawText = data.candidates[0].content.parts[0].text;
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsedWorkout = JSON.parse(rawText);

      // On ajoute les emojis robots aux noms et on s'assure que les IDs sont uniques
      const finalWorkout = parsedWorkout.map((ex, idx) => ({
        id: `ai_${Date.now()}_${idx}`,
        name: ex.name + " ⚡",
        sets: ex.sets || "3",
        targetReps: ex.targetReps || "10"
      }));

      // On écrase la journée active avec le nouveau programme IA
      setRoutine(prev => ({ 
        ...prev, 
        [activeDay]: finalWorkout 
      }));

      // On efface les anciens logs pour cette journée
      setLogs({});

      setAiInput('');
      setShowAIWorkout(false);

    } catch (error) {
      console.error("Erreur Gemini Workout:", error);
      alert("Erreur avec l'IA. Essaye de reformuler ta demande.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const currentExercises = routine[activeDay] || [];

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-10 overflow-hidden">
      
      {/* HEADER */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-5 rounded-[2rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ccff00]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-xl font-black tracking-tighter text-white flex flex-col leading-none">
            {vocab.title} <span className="text-[#ccff00] text-2xl">{vocab.subtitle}</span>
          </h1>
          <p className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-1">{vocab.desc}</p>
        </div>
        <button onClick={handleSave} className={`relative z-10 px-3 py-2 rounded-xl font-black text-[10px] tracking-wider flex items-center gap-1.5 transition-all ${showSaved ? 'bg-green-500 text-white' : 'bg-[#ccff00] text-black hover:scale-105'}`}>
          {showSaved ? <Check size={14} /> : <Save size={14} />}
          {showSaved ? vocab.saved : vocab.save}
        </button>
      </div>

      {/* BOUTON TEMPLATES (Classique) */}
      <div className="relative z-20">
        <button onClick={() => setShowTemplates(!showTemplates)} className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl flex items-center justify-between hover:bg-slate-700 transition">
          <span className="text-xs font-bold text-white flex items-center gap-2">
            <Target size={16} className="text-[#ccff00]" /> {vocab.templatesTitle}
          </span>
          <span className="text-[10px] bg-black/50 px-2 py-1 rounded text-slate-400 font-bold uppercase tracking-wider">Load</span>
        </button>
        {showTemplates && (
          <div className="absolute top-14 left-0 w-full bg-slate-800 border border-[#ccff00]/30 p-2 rounded-xl z-30 shadow-2xl flex flex-col gap-2">
            <button onClick={() => loadTemplate('aesthetic')} className="bg-slate-900 p-3 rounded-lg text-left hover:bg-slate-700 transition">
              <span className="block text-sm font-black text-[#ccff00]">Aesthetic Blueprint</span>
              <span className="block text-[10px] text-slate-400">Jeff Seid Style</span>
            </button>
          </div>
        )}
      </div>

      {/* TRACKER MENSURATIONS COMPACT */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-3 shadow-sm relative z-10">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 mb-0.5">
              <label className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{vocab.weight}</label>
              <button onClick={() => setWeightUnit(weightUnit === 'lbs' ? 'kg' : 'lbs')} className="text-[7px] bg-slate-800 hover:bg-slate-700 px-1 py-0.5 rounded text-[#ccff00] font-black transition-colors">{weightUnit.toUpperCase()}</button>
            </div>
            <input type="number" value={stats.weight} onChange={e => setStats({...stats, weight: e.target.value})} placeholder="-" className="w-full bg-transparent text-white text-center text-[16px] font-black focus:outline-none placeholder-slate-700" />
          </div>
          <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center">
            <label className="text-[8px] text-slate-400 font-bold mb-0.5 uppercase tracking-widest">{vocab.waist}</label>
            <input type="number" value={stats.waist} onChange={e => setStats({...stats, waist: e.target.value})} placeholder="-" className="w-full bg-transparent text-white text-center text-[16px] font-black focus:outline-none placeholder-slate-700" />
          </div>
          <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center">
            <label className="text-[8px] text-[#ccff00]/70 font-bold mb-0.5 uppercase tracking-widest">{vocab.energy}</label>
            <input type="number" value={stats.energy} onChange={e => setStats({...stats, energy: e.target.value})} placeholder="-" className="w-full bg-transparent text-[#ccff00] text-center text-[16px] font-black focus:outline-none placeholder-slate-700" />
          </div>
        </div>
      </div>

      {/* SÉLECTEUR DE JOURS */}
      <div className="flex bg-black/40 p-1 rounded-xl border border-slate-700/50 relative z-10">
        {vocab.days.map((d) => (
          <button key={d.id} onClick={() => setActiveDay(d.id)} className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-colors uppercase tracking-wider ${activeDay === d.id ? 'bg-[#ccff00] text-black shadow-sm' : 'text-slate-500 hover:text-white'}`}>
            {d.l}
          </button>
        ))}
      </div>

      {/* 🤖 BOUTON COACH IA WORKOUT */}
      <div className="relative z-10">
        <button 
          onClick={() => setShowAIWorkout(!showAIWorkout)}
          className={`w-full p-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs transition-transform hover:scale-[1.02] shadow-lg ${showAIWorkout ? 'bg-slate-800 text-white border border-slate-700' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'}`}
        >
          <Bot size={18} /> {showAIWorkout ? 'Fermer IA' : 'Générer un Workout avec l\'IA ✨'}
        </button>

        {showAIWorkout && (
          <div className="bg-slate-800/80 p-4 rounded-xl border border-blue-500/30 animate-in fade-in zoom-in mt-2 shadow-xl">
            <label className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-2 block">{vocab.aiCoachTitle}</label>
            <textarea 
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder={vocab.aiCoachPlaceholder}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none resize-none h-24"
            />
            <button 
              onClick={handleAIGenerateWorkout}
              disabled={isAiLoading || !aiInput.trim()}
              className="w-full mt-3 bg-blue-500 disabled:bg-slate-700 text-white font-black py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />} 
              {isAiLoading ? 'Création du programme...' : vocab.aiBtnGenerate}
            </button>
          </div>
        )}
      </div>

      {/* LISTE DES EXERCICES */}
      <div className="space-y-2 pb-2 relative z-10">
        <div className="flex justify-between items-center mb-2 px-1">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <Dumbbell size={14} className="text-[#ccff00]" /> Workout
          </h3>
          <button onClick={handleAddExercise} className="text-[#ccff00] bg-slate-800 p-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-700 transition">
            <Plus size={14} /> <span className="text-[9px] font-bold uppercase">{vocab.addExercise}</span>
          </button>
        </div>

        {currentExercises.length === 0 ? (
          <div className="text-center py-10 bg-slate-800/20 border border-dashed border-slate-700/50 rounded-2xl">
            <p className="text-slate-500 text-xs italic">{vocab.emptyDay}</p>
          </div>
        ) : (
          currentExercises.map((ex) => {
            const log = logs[ex.id] || { lbs: '', reps: '' };
            return (
              <div key={ex.id} className="bg-slate-800/60 border border-slate-700/50 p-2 rounded-xl flex items-center justify-between gap-2 shadow-sm">
                <div className="flex-1 min-w-0 pl-1">
                  <h4 className="font-bold text-sm text-white truncate leading-tight">{ex.name}</h4>
                  <p className="text-[9px] font-bold text-slate-400 mt-0.5 tracking-wide">{ex.sets} SETS × {ex.targetReps}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex flex-col items-center">
                    <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{weightUnit}</span>
                    <input type="number" value={log.lbs} onChange={(e) => updateLog(ex.id, 'lbs', e.target.value)} className="w-14 h-8 bg-slate-900 border border-slate-700/50 rounded-lg text-center font-black text-[#ccff00] text-[16px] focus:outline-none focus:border-[#ccff00] placeholder-slate-700" placeholder="-" />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{vocab.reps}</span>
                    <input type="number" value={log.reps} onChange={(e) => updateLog(ex.id, 'reps', e.target.value)} className="w-12 h-8 bg-slate-900 border border-slate-700/50 rounded-lg text-center font-black text-white text-[16px] focus:outline-none focus:border-white placeholder-slate-700" placeholder="-" />
                  </div>
                  <button onClick={() => handleDeleteExercise(ex.id)} className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-1 mt-3"><Trash2 size={16} /></button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-start gap-2 opacity-60">
        <ShieldAlert size={14} className="text-slate-500 shrink-0 mt-0.5" />
        <p className="text-[9px] text-slate-500 leading-tight">{vocab.disclaimer}</p>
      </div>

    </div>
  );
};

export default Workout;
