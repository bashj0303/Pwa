import React, { useState, useEffect } from 'react';
import { Save, Check, Weight, Ruler, Zap, Layers, Info, Target } from 'lucide-react';

const Workout = ({ t }) => {
  const isFr = t.month === 'mois';

  const vocab = {
    title: 'AESTHETIC',
    subtitle: 'BLUEPRINT',
    desc: 'Jeff Seid Style // 5-Day Split',
    save: isFr ? 'SAUVEGARDER' : 'SAVE',
    saved: isFr ? 'SAUVEGARDÉ!' : 'SAVED!',
    
    statsTitle: isFr ? 'Body Stats Tracker' : 'Body Stats Tracker',
    weight: isFr ? 'Poids (Lbs)' : 'Weight (Lbs)',
    waist: isFr ? 'Taille (cm)' : 'Waist (cm)',
    energy: isFr ? 'Énergie (1-10)' : 'Energy (1-10)',

    lbs: 'Lbs',
    reps: 'Reps',
    
    days: [
      { id: 'day1', label: 'DAY 1: CHEST' },
      { id: 'day2', label: 'DAY 2: BACK' },
      { id: 'day3', label: 'DAY 3: LEGS' },
      { id: 'day4', label: 'DAY 4: SHOULDERS' },
      { id: 'day5', label: 'DAY 5: ARMS' }
    ]
  };

  // --- BASE DE DONNÉES DU PROGRAMME ---
  const routine = {
    day1: {
      title: "Chest & Calves", focus: "Upper Chest Shelf & Width", color: "border-[#ccff00]",
      exercises: [
        { id: '1-1', name: "Incline Dumbbell Press", sets: 4, targetReps: "8-10", angle: "30°", note: "Ne pas dépasser 30°" },
        { id: '1-2', name: "Machine Chest Press", sets: 3, targetReps: "8-10", angle: "0°", note: "Focus contraction max" },
        { id: '1-3', name: "Incline Cable Flyes", sets: 4, targetReps: "12-15", angle: "30-45°", note: "Étirement constant" },
        { id: '1-4', name: "Weighted Dips", sets: 3, targetReps: "Failure", angle: null, note: "Penche toi en avant" },
        { id: '1-5', name: "Standing Calf Raises", sets: 4, targetReps: "15-20", angle: null, note: "Tempo lent" },
        { id: '1-6', name: "Seated Calf Raises", sets: 4, targetReps: "15-20", angle: null, note: "Contraction max" }
      ]
    },
    day2: {
      title: "Back & Abs", focus: "V-Taper & Thickness", color: "border-blue-500",
      exercises: [
        { id: '2-1', name: "Wide Grip Pull-Ups", sets: 4, targetReps: "Failure", angle: null, note: "Menton au dessus de la barre" },
        { id: '2-2', name: "Lat Pulldowns", sets: 4, targetReps: "10-12", angle: null, note: "Contrôle la montée" },
        { id: '2-3', name: "Seated Machine Row", sets: 4, targetReps: "8-10", angle: null, note: "Coudes vers l'arrière" },
        { id: '2-4', name: "Cable Pullovers", sets: 3, targetReps: "15", angle: null, note: "Focus grands dorsaux" },
        { id: '2-5', name: "Hanging Leg Raises", sets: 4, targetReps: "15", angle: null, note: "Pas de balancement" },
        { id: '2-6', name: "Cable Crunches", sets: 4, targetReps: "15-20", angle: null, note: "Expire en descendant" }
      ]
    },
    day3: {
      title: "Legs", focus: "Tear Drop & Sweep", color: "border-red-500",
      exercises: [
        { id: '3-1', name: "Barbell Squat", sets: 4, targetReps: "6-8", angle: null, note: "Profondeur max" },
        { id: '3-2', name: "Leg Press", sets: 4, targetReps: "10-12", angle: "45°", note: "Pieds largeur épaules" },
        { id: '3-3', name: "Walking Lunges", sets: 3, targetReps: "12/leg", angle: null, note: "Pas longs" },
        { id: '3-4', name: "Leg Extension", sets: 4, targetReps: "15", angle: "90°", note: "Contrôle la descente" },
        { id: '3-5', name: "Lying Leg Curl", sets: 4, targetReps: "15", angle: "0°", note: "Hanche collée au banc" },
        { id: '3-6', name: "Stiff-Leg Deadlift", sets: 3, targetReps: "10-12", angle: null, note: "Dos droit, focus ischios" }
      ]
    },
    day4: {
      title: "Shoulders & Traps", focus: "3D Delts (Capped Look)", color: "border-purple-500",
      exercises: [
        { id: '4-1', name: "Seated Military Press", sets: 4, targetReps: "8-10", angle: "75°", note: "Protège les lombaires" },
        { id: '4-2', name: "Dumbbell Lateral Raises", sets: 5, targetReps: "12-15", angle: null, note: "Pas d'élan" },
        { id: '4-3', name: "Reverse Pec Deck", sets: 4, targetReps: "12-15", angle: null, note: "Arrière d'épaule" },
        { id: '4-4', name: "Wide Grip Upright Row", sets: 3, targetReps: "10-12", angle: null, note: "Barre ou Haltères" },
        { id: '4-5', name: "Dumbbell Shrugs", sets: 4, targetReps: "15", angle: null, note: "Pause en haut 1sec" }
      ]
    },
    day5: {
      title: "Arms & Core", focus: "Bicep Peak & Horseshoe Triceps", color: "border-emerald-500",
      exercises: [
        { id: '5-1', name: "Barbell Bicep Curl", sets: 4, targetReps: "8-10", angle: null, note: "Strict form" },
        { id: '5-2', name: "Skull Crushers", sets: 4, targetReps: "8-10", angle: "15°", note: "Barre au front" },
        { id: '5-3', name: "SS: Hammer Curls + Rope", sets: 4, targetReps: "12 each", angle: null, note: "Superset intense" },
        { id: '5-4', name: "SS: Conc. Curl + Kickback", sets: 3, targetReps: "15 each", angle: "Bench", note: "Isolation pure" },
        { id: '5-5', name: "Plank", sets: 3, targetReps: "60s", angle: null, note: "Abdos serrés" }
      ]
    }
  };

  // --- ÉTATS & SAUVEGARDE ---
  const [activeTab, setActiveTab] = useState('day1');
  const [showSaved, setShowSaved] = useState(false);

  // Stats Corporelles
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('pos_body_stats_v1');
    return saved ? JSON.parse(saved) : { weight: '', waist: '', energy: '' };
  });

  // Performances (Poids et Reps par exercice)
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('pos_workout_logs_v1');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => localStorage.setItem('pos_body_stats_v1', JSON.stringify(stats)), [stats]);
  useEffect(() => localStorage.setItem('pos_workout_logs_v1', JSON.stringify(logs)), [logs]);

  const handleSave = () => {
    // Force la sauvegarde (bien qu'elle soit auto avec useEffect, c'est pour le feedback visuel)
    localStorage.setItem('pos_body_stats_v1', JSON.stringify(stats));
    localStorage.setItem('pos_workout_logs_v1', JSON.stringify(logs));
    
    // Si l'utilisateur clique, on met à jour les "Workouts" globaux du Dashboard
    const currentDayData = routine[activeTab].exercises.map(ex => {
      const exLog = logs[ex.id] || { lbs: 0, reps: 0 };
      return { id: ex.id, name: ex.name, weight: exLog.lbs, reps: `${ex.sets}x${exLog.reps || ex.targetReps}` };
    });
    localStorage.setItem('pos_workouts', JSON.stringify(currentDayData));

    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const updateLog = (id, field, value) => {
    setLogs(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || { lbs: '', reps: '' }),
        [field]: value
      }
    }));
  };

  const activeRoutine = routine[activeTab];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-10">
      
      {/* HEADER */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-5 rounded-[2rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ccff00]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-2xl font-black tracking-tighter text-white">
            {vocab.title} <span className="text-[#ccff00]">{vocab.subtitle}</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">{vocab.desc}</p>
        </div>
        <button 
          onClick={handleSave}
          className={`relative z-10 px-3 py-2 rounded-xl font-black text-[10px] tracking-wider flex items-center gap-1.5 transition-all ${showSaved ? 'bg-green-500 text-white' : 'bg-[#ccff00] text-black hover:scale-105'}`}
        >
          {showSaved ? <Check size={14} /> : <Save size={14} />}
          {showSaved ? vocab.saved : vocab.save}
        </button>
      </div>

      {/* BODY STATS TRACKER */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 shadow-lg">
        <h3 className="text-[#ccff00] font-black text-xs mb-3 uppercase tracking-wider flex items-center gap-2">
          <Target size={14} /> {vocab.statsTitle}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700/50">
            <label className="text-[9px] text-slate-400 font-bold block mb-1 uppercase text-center flex items-center justify-center gap-1"><Weight size={10}/> {vocab.weight}</label>
            <input 
              type="number" 
              value={stats.weight} 
              onChange={e => setStats({...stats, weight: e.target.value})}
              placeholder="0.0" 
              className="w-full bg-transparent text-white text-center text-[16px] font-black focus:outline-none placeholder-slate-700"
            />
          </div>
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700/50">
            <label className="text-[9px] text-slate-400 font-bold block mb-1 uppercase text-center flex items-center justify-center gap-1"><Ruler size={10}/> {vocab.waist}</label>
            <input 
              type="number" 
              value={stats.waist} 
              onChange={e => setStats({...stats, waist: e.target.value})}
              placeholder="0.0" 
              className="w-full bg-transparent text-white text-center text-[16px] font-black focus:outline-none placeholder-slate-700"
            />
          </div>
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700/50">
            <label className="text-[9px] text-slate-400 font-bold block mb-1 uppercase text-center flex items-center justify-center gap-1"><Zap size={10}/> {vocab.energy}</label>
            <input 
              type="number" 
              value={stats.energy} 
              onChange={e => setStats({...stats, energy: e.target.value})}
              placeholder="-" 
              className="w-full bg-transparent text-[#ccff00] text-center text-[16px] font-black focus:outline-none placeholder-slate-700"
            />
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS (Jours) */}
      <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar snap-x w-full">
        {vocab.days.map((day) => (
          <button
            key={day.id}
            onClick={() => setActiveTab(day.id)}
            className={`shrink-0 snap-start px-4 py-2 rounded-xl text-[10px] font-black whitespace-nowrap transition-all uppercase tracking-wider ${activeTab === day.id ? 'bg-[#ccff00] text-black shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            {day.label}
          </button>
        ))}
      </div>

      {/* CONTENU DU WORKOUT ACTUEL */}
      <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
        
        {/* Titre du Jour */}
        <div className={`bg-gradient-to-r from-slate-800 to-slate-900 p-4 rounded-2xl border-l-4 ${activeRoutine.color} shadow-md`}>
          <h2 className="text-xl font-black text-white">{activeRoutine.title}</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Focus: {activeRoutine.focus}</p>
        </div>

        {/* Liste des Exercices */}
        {activeRoutine.exercises.map((ex) => {
          const log = logs[ex.id] || { lbs: '', reps: '' };
          
          return (
            <div key={ex.id} className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 flex flex-col gap-3">
              
              {/* Infos Exercice */}
              <div>
                <h4 className="font-bold text-sm text-white flex items-center flex-wrap gap-2 leading-tight">
                  {ex.name}
                  {ex.angle && (
                    <span className="bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/30 px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider uppercase flex items-center gap-1 shrink-0">
                      <Ruler size={10} /> {ex.angle}
                    </span>
                  )}
                </h4>
                <div className="flex items-center gap-3 mt-1.5">
                  <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg">
                    <Layers size={12} /> {ex.sets} Sets × {ex.targetReps}
                  </p>
                  <p className="text-[10px] text-slate-500 italic flex items-center gap-1">
                    <Info size={12} /> {ex.note}
                  </p>
                </div>
              </div>

              {/* Inputs de Performance */}
              <div className="flex gap-2 items-center bg-slate-900/60 p-2 rounded-xl border border-slate-700/30">
                <div className="flex-1">
                  <label className="text-[9px] font-bold uppercase text-slate-500 block text-center mb-1 tracking-widest">{vocab.lbs}</label>
                  <input 
                    type="number" 
                    value={log.lbs}
                    onChange={(e) => updateLog(ex.id, 'lbs', e.target.value)}
                    className="w-full bg-slate-800 p-2 rounded-lg font-black text-[#ccff00] text-center text-[16px] focus:outline-none focus:ring-1 focus:ring-[#ccff00]/50 placeholder-slate-700" 
                    placeholder="0"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[9px] font-bold uppercase text-slate-500 block text-center mb-1 tracking-widest">{vocab.reps}</label>
                  <input 
                    type="number" 
                    value={log.reps}
                    onChange={(e) => updateLog(ex.id, 'reps', e.target.value)}
                    className="w-full bg-slate-800 p-2 rounded-lg font-black text-white text-center text-[16px] focus:outline-none focus:ring-1 focus:ring-white/30 placeholder-slate-700" 
                    placeholder="0"
                  />
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default Workout;
