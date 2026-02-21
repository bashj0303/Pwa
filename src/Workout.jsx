import React, { useState, useEffect } from 'react';
import { Save, Check, Target, Plus, Trash2, Dumbbell, Layers, Ruler } from 'lucide-react';

const Workout = ({ t }) => {
  const isFr = t.month === 'mois';

  const vocab = {
    title: 'TRAINING',
    subtitle: 'BLUEPRINT',
    desc: isFr ? 'Programme 100% Modifiable' : '100% Editable Program',
    save: isFr ? 'SAUVEGARDER' : 'SAVE',
    saved: isFr ? 'SAUVEGARDÉ!' : 'SAVED!',
    
    statsTitle: isFr ? 'Mensurations & Énergie' : 'Body Stats & Energy',
    weight: isFr ? 'Poids (Lbs)' : 'Weight (Lbs)',
    waist: isFr ? 'Taille (cm)' : 'Waist (cm)',
    energy: isFr ? 'Énergie (1-10)' : 'Energy (1-10)',

    lbs: 'Lbs',
    reps: 'Reps',
    addExercise: isFr ? 'Ajouter un exercice' : 'Add Exercise',
    promptName: isFr ? 'Nom de l\'exercice ?' : 'Exercise name?',
    promptSets: isFr ? 'Nombre de séries ? (ex: 4)' : 'Number of sets? (e.g. 4)',
    promptReps: isFr ? 'Répétitions visées ? (ex: 8-12)' : 'Target reps? (e.g. 8-12)',
    emptyDay: isFr ? 'Jour de repos. Profites-en pour récupérer !' : 'Rest day. Take time to recover!',
    
    days: isFr 
      ? [{ id: 0, l: 'Lun' }, { id: 1, l: 'Mar' }, { id: 2, l: 'Mer' }, { id: 3, l: 'Jeu' }, { id: 4, l: 'Ven' }, { id: 5, l: 'Sam' }, { id: 6, l: 'Dim' }]
      : [{ id: 0, l: 'Mon' }, { id: 1, l: 'Tue' }, { id: 2, l: 'Wed' }, { id: 3, l: 'Thu' }, { id: 4, l: 'Fri' }, { id: 5, l: 'Sat' }, { id: 6, l: 'Sun' }]
  };

  // --- GÉNÉRATEUR DU PROGRAMME PAR DÉFAUT (Aesthetic Split) ---
  const generateDefaultRoutine = () => {
    return {
      0: [ // Lundi : Chest
        { id: 'ex1', name: "Incline DB Press", sets: 4, targetReps: "8-10" },
        { id: 'ex2', name: "Machine Chest Press", sets: 3, targetReps: "10-12" },
        { id: 'ex3', name: "Cable Flyes", sets: 4, targetReps: "12-15" }
      ],
      1: [ // Mardi : Back
        { id: 'ex4', name: "Pull-Ups", sets: 4, targetReps: "Max" },
        { id: 'ex5', name: "Lat Pulldowns", sets: 4, targetReps: "10-12" },
        { id: 'ex6', name: "Seated Row", sets: 4, targetReps: "8-10" }
      ],
      2: [ // Mercredi : Legs
        { id: 'ex7', name: "Squat", sets: 4, targetReps: "6-8" },
        { id: 'ex8', name: "Leg Press", sets: 4, targetReps: "10-12" },
        { id: 'ex9', name: "Leg Extension", sets: 4, targetReps: "15" }
      ],
      3: [ // Jeudi : Shoulders
        { id: 'ex10', name: "Military Press", sets: 4, targetReps: "8-10" },
        { id: 'ex11', name: "Lateral Raises", sets: 5, targetReps: "12-15" },
        { id: 'ex12', name: "Reverse Pec Deck", sets: 4, targetReps: "12-15" }
      ],
      4: [ // Vendredi : Arms
        { id: 'ex13', name: "Barbell Curls", sets: 4, targetReps: "8-10" },
        { id: 'ex14', name: "Skull Crushers", sets: 4, targetReps: "8-10" },
        { id: 'ex15', name: "Hammer Curls", sets: 3, targetReps: "12" }
      ],
      5: [], // Samedi : Repos
      6: []  // Dimanche : Repos
    };
  };

  const getTodayIndex = () => {
    let day = new Date().getDay();
    return day === 0 ? 6 : day - 1; 
  };

  // --- ÉTATS ---
  const [activeDay, setActiveDay] = useState(getTodayIndex());
  const [showSaved, setShowSaved] = useState(false);

  // Le programme complet de la semaine
  const [routine, setRoutine] = useState(() => {
    const saved = localStorage.getItem('pos_routine_v2');
    return saved ? JSON.parse(saved) : generateDefaultRoutine();
  });

  // Les performances (Poids / Reps)
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('pos_workout_logs_v2');
    return saved ? JSON.parse(saved) : {};
  });

  // Mensurations
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('pos_body_stats_v2');
    return saved ? JSON.parse(saved) : { weight: '', waist: '', energy: '' };
  });

  // --- SAUVEGARDES AUTO ---
  useEffect(() => localStorage.setItem('pos_routine_v2', JSON.stringify(routine)), [routine]);
  useEffect(() => localStorage.setItem('pos_workout_logs_v2', JSON.stringify(logs)), [logs]);
  useEffect(() => localStorage.setItem('pos_body_stats_v2', JSON.stringify(stats)), [stats]);

  // --- FONCTIONS ---
  const handleSave = () => {
    // Exporter le workout du jour pour le bouton "Share" des Rewards
    const currentDayExercises = routine[activeDay] || [];
    const exportData = currentDayExercises.map(ex => {
      const exLog = logs[ex.id] || { lbs: 0, reps: 0 };
      return { 
        id: ex.id, 
        name: ex.name, 
        weight: exLog.lbs || 0, 
        reps: `${ex.sets}x${exLog.reps || ex.targetReps}` 
      };
    });
    
    // Si l'utilisateur s'entraîne, on ne sauvegarde que s'il y a des données
    if (exportData.length > 0) {
      localStorage.setItem('pos_workouts', JSON.stringify(exportData));
    }

    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const updateLog = (id, field, value) => {
    setLogs(prev => ({
      ...prev,
      [id]: { ...(prev[id] || { lbs: '', reps: '' }), [field]: value }
    }));
  };

  // Ajouter un exercice au jour actif
  const handleAddExercise = () => {
    const name = prompt(vocab.promptName);
    if (!name) return;
    
    const sets = prompt(vocab.promptSets, "4");
    const reps = prompt(vocab.promptReps, "8-12");

    const newEx = {
      id: Date.now().toString(),
      name: name.charAt(0).toUpperCase() + name.slice(1),
      sets: sets || "4",
      targetReps: reps || "10"
    };

    setRoutine(prev => ({
      ...prev,
      [activeDay]: [...(prev[activeDay] || []), newEx]
    }));
  };

  // Supprimer un exercice
  const handleDeleteExercise = (exId) => {
    if(window.confirm(isFr ? "Supprimer cet exercice ?" : "Delete this exercise?")) {
      setRoutine(prev => ({
        ...prev,
        [activeDay]: prev[activeDay].filter(ex => ex.id !== exId)
      }));
      // On nettoie aussi le log de cet exercice
      const newLogs = { ...logs };
      delete newLogs[exId];
      setLogs(newLogs);
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
        <button 
          onClick={handleSave}
          className={`relative z-10 px-3 py-2 rounded-xl font-black text-[10px] tracking-wider flex items-center gap-1.5 transition-all ${showSaved ? 'bg-green-500 text-white' : 'bg-[#ccff00] text-black hover:scale-105'}`}
        >
          {showSaved ? <Check size={14} /> : <Save size={14} />}
          {showSaved ? vocab.saved : vocab.save}
        </button>
      </div>

      {/* SÉLECTEUR DE JOURS (Semaine) */}
      <div className="flex bg-black/40 p-1 rounded-xl border border-slate-700/50">
        {vocab.days.map((d) => (
          <button
            key={d.id}
            onClick={() => setActiveDay(d.id)}
            className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-colors uppercase tracking-wider ${activeDay === d.id ? 'bg-[#ccff00] text-black shadow-sm' : 'text-slate-500 hover:text-white'}`}
          >
            {d.l}
          </button>
        ))}
      </div>

      {/* TRACKER MENSURATIONS COMPACT */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-3 shadow-sm">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center">
            <label className="text-[8px] text-slate-400 font-bold mb-0.5 uppercase tracking-widest">{vocab.weight}</label>
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

      {/* LISTE DES EXERCICES (ULTRA SLIM) */}
      <div className="space-y-2 pb-6">
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
                
                {/* Infos Exercice */}
                <div className="flex-1 min-w-0 pl-1">
                  <h4 className="font-bold text-sm text-white truncate leading-tight">{ex.name}</h4>
                  <p className="text-[9px] font-bold text-slate-400 mt-0.5 tracking-wide">
                    {ex.sets} SETS × {ex.targetReps}
                  </p>
                </div>

                {/* Inputs & Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  
                  {/* Case Poids */}
                  <div className="bg-slate-900 rounded-lg p-1 w-[4.5rem] border border-slate-700/50 relative">
                    <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-slate-900 px-1 text-[7px] font-bold text-slate-500 uppercase">{vocab.lbs}</span>
                    <input 
                      type="number" 
                      value={log.lbs}
                      onChange={(e) => updateLog(ex.id, 'lbs', e.target.value)}
                      className="w-full bg-transparent text-center font-black text-[#ccff00] text-[16px] focus:outline-none placeholder-slate-700 pt-1" 
                      placeholder="-"
                    />
                  </div>

                  {/* Case Reps */}
                  <div className="bg-slate-900 rounded-lg p-1 w-12 border border-slate-700/50 relative">
                    <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-slate-900 px-1 text-[7px] font-bold text-slate-500 uppercase">{vocab.reps}</span>
                    <input 
                      type="number" 
                      value={log.reps}
                      onChange={(e) => updateLog(ex.id, 'reps', e.target.value)}
                      className="w-full bg-transparent text-center font-black text-white text-[16px] focus:outline-none placeholder-slate-700 pt-1" 
                      placeholder="-"
                    />
                  </div>

                  {/* Bouton Supprimer */}
                  <button onClick={() => handleDeleteExercise(ex.id)} className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-1">
                    <Trash2 size={16} />
                  </button>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default Workout;
