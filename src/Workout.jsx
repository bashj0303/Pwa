import React, { useState, useEffect, useRef } from 'react';
import { Dumbbell, Plus, Trash2, RotateCcw, Bot, Loader2, ChevronDown, ChevronUp, Camera, X, Info, BicepsFlexed } from 'lucide-react';

// ==========================================
// TA CLÉ API SÉCURISÉE VIA VERCEL
// ==========================================
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const Workout = ({ t }) => {
  const isFr = t?.month === 'mois' || true;
  const vocab = {
    title: isFr ? 'Entraînement' : 'Workout',
    clearWeek: isFr ? 'Effacer la semaine ?' : 'Clear week?',
    days: isFr ? ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'] : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    emptyState: isFr ? 'Jour de repos. Ajoute un exercice ou génère un workout.' : 'Rest day. Add exercise or generate workout.',
    aiPanelBtn: isFr ? 'Générer / Identifier Machine ✨' : 'Generate / Identify Machine ✨',
    aiPanelClose: isFr ? 'Fermer IA' : 'Close AI',
    aiPlaceholder: isFr ? 'Ex: "Séance pectoraux 45min" OU prends une machine en photo...' : 'E.g., "Chest workout 45min" OR take a photo of a machine...',
    aiBtnGenerate: isFr ? 'Go !' : 'Go!',
    aiAnalyzing: isFr ? 'Analyse en cours...' : 'Analyzing...',
    addExerciseBtn: isFr ? 'Ajouter Exercice Manuellement' : 'Add Manual Exercise',
    machineIdTitle: isFr ? '🔍 Machine Identifiée :' : '🔍 Machine Identified:',
    machineInstructions: isFr ? 'Instructions :' : 'How to use:',
    musclesTargeted: isFr ? 'Muscles ciblés :' : 'Target Muscles:',
    addToWorkoutBtn: isFr ? 'Ajouter cet exercice au programme' : 'Add this exercise to workout'
  };

  const getTodayIndex = () => { let day = new Date().getDay(); return day === 0 ? 6 : day - 1; };
  const [activeDay, setActiveDay] = useState(getTodayIndex());
  // Structure: { 0: [{id, name, sets, reps, weight, done}], 1: [], ... }
  const [program, setProgram] = useState(() => JSON.parse(localStorage.getItem('pos_workout_v2')) || { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] });
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedEx, setExpandedEx] = useState(null);

  // États pour la caméra et l'identification de machine
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [machineAnalysis, setMachineAnalysis] = useState(null); // Stocke le résultat de l'analyse photo
  const fileInputRef = useRef(null);

  useEffect(() => localStorage.setItem('pos_workout_v2', JSON.stringify(program)), [program]);

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onloadend = () => setImageBase64(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
    setMachineAnalysis(null); // Reset analyse précédente si nouvelle photo
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    setMachineAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateEx = (day, id, field, value) => {
    setProgram(p => ({
      ...p,
      [day]: p[day].map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const toggleDone = (day, id) => {
    setProgram(p => ({
      ...p,
      [day]: p[day].map(e => e.id === id ? { ...e, done: !e.done } : e)
    }));
  };

  const deleteEx = (day, id) => {
    setProgram(p => ({
      ...p,
      [day]: p[day].filter(e => e.id !== id)
    }));
  };

  const addManualExercise = () => {
    const newEx = { id: Date.now(), name: isFr ? 'Nouvel Exercice' : 'New Exercise', sets: 3, reps: 10, weight: 0, done: false };
    setProgram(p => ({ ...p, [activeDay]: [...p[activeDay], newEx] }));
  };

  // Fonction pour ajouter l'exercice identifié par la caméra au programme
  const addIdentifiedExercise = () => {
    if (!machineAnalysis) return;
    const newEx = { 
      id: Date.now(), 
      name: machineAnalysis.name + " 📸", 
      sets: 3, reps: 10, weight: 0, done: false,
      instructions: machineAnalysis.instructions // On sauvegarde les instructions
    };
    setProgram(p => ({ ...p, [activeDay]: [...p[activeDay], newEx] }));
    // Reset après ajout
    setAiInput('');
    removeImage();
    setShowAIPanel(false);
  };

  const handleAIGenerate = async () => {
    if (!aiInput.trim() && !imageBase64) return;
    setLoading(true);
    setMachineAnalysis(null);

    try {
      const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
      const modelsData = await modelsRes.json();
      const validModelObj = modelsData.models?.find(m => (m.name.includes('1.5-flash') || m.name.includes('1.5-pro')) && m.supportedGenerationMethods.includes('generateContent'));
      if (!validModelObj) throw new Error("Modèle IA non disponible.");

      let promptText = "";

      // === SCÉNARIO 1 : PHOTO (Identification de machine) ===
      if (imageBase64) {
         promptText = `Agis comme un coach sportif expert pour débutants. 
         Analyse l'image fournie. Si c'est une machine de musculation ou un équipement de gym, identifie-le précisément.
         Retourne UNIQUEMENT un objet JSON au format suivant :
         {
           "name": "Nom de la machine (ex: Presse à cuisses)",
           "muscles": "Muscles principaux ciblés (ex: Quadriceps, Fessiers)",
           "instructions": "Instructions courtes, claires et sécuritaires pour un débutant sur comment l'utiliser. (ex: Asseyez-vous le dos plaqué, pieds largeur d'épaules. Poussez sans verrouiller les genoux, revenez lentement.)"
         }
         Si ce n'est pas une machine de gym, retourne un JSON avec name: "Inconnu", muscles: "", instructions: "Impossible d'identifier un équipement de gym sur cette image."`;
      } 
      // === SCÉNARIO 2 : TEXTE SEUL (Génération de programme) ===
      else {
         promptText = `Agis comme un coach sportif. Crée une séance basée sur: "${aiInput}".
         Retourne UNIQUEMENT un tableau JSON d'exercices. Format: [{"name": "Nom Exercice", "sets": 4, "reps": 12}, ...]`;
      }

      const promptParts = [{ text: promptText }];
      if (imageBase64) {
        promptParts.push({ inlineData: { mimeType: "image/jpeg", data: imageBase64 } });
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${validModelObj.name}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: promptParts }] })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Erreur IA");

      let rawText = data.candidates[0].content.parts[0].text;
      const firstBracket = rawText.indexOf('[');
      const firstBrace = rawText.indexOf('{');
      const lastBracket = rawText.lastIndexOf(']');
      const lastBrace = rawText.lastIndexOf('}');

      let parsedData;

      // Traitement de la réponse selon le scénario
      if (imageBase64 && firstBrace !== -1 && lastBrace !== -1) {
        // C'est une identification de machine (Objet JSON unique)
        const jsonStr = rawText.substring(firstBrace, lastBrace + 1);
        parsedData = JSON.parse(jsonStr);
        setMachineAnalysis(parsedData); // On affiche le résultat
      } else if (!imageBase64 && firstBracket !== -1 && lastBracket !== -1) {
        // C'est une génération de programme (Tableau JSON)
        const jsonStr = rawText.substring(firstBracket, lastBracket + 1);
        parsedData = JSON.parse(jsonStr);
        const newExercises = parsedData.map((ex, i) => ({
            id: Date.now() + i,
            name: ex.name + " 🤖",
            sets: Number(ex.sets) || 3,
            reps: Number(ex.reps) || 10,
            weight: 0,
            done: false
        }));
        setProgram(p => ({ ...p, [activeDay]: [...p[activeDay], ...newExercises] }));
        setAiInput('');
        setShowAIPanel(false);
      } else {
        throw new Error("Format de réponse IA invalide.");
      }

    } catch (error) {
      console.error(error);
      alert("Erreur: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-64 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-[2rem] shadow-xl flex justify-between items-center">
        <h2 className="text-xl font-black text-white flex items-center gap-2"><Dumbbell className="text-[#ccff00]" size={24} /> {vocab.title}</h2>
        <button onClick={() => { if (window.confirm(vocab.clearWeek)) setProgram({ 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }) }} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors"><RotateCcw size={18} /></button>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 snap-x snap-mandatory hide-scrollbar">
        {vocab.days.map((d, i) => (
          <button key={i} onClick={() => setActiveDay(i)} className={`snap-center shrink-0 px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeDay === i ? 'bg-[#ccff00] text-black scale-105 shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{d} {(program[i] || []).length > 0 && <span className="ml-1 text-[10px] text-orange-500">●</span>}</button>
        ))}
      </div>

      <div className="min-h-[300px]">
        {(program[activeDay] || []).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl gap-3">
            <Dumbbell size={40} className="opacity-20" />
            <p className="text-sm font-medium">{vocab.emptyState}</p>
            <button onClick={addManualExercise} className="mt-2 flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full text-sm font-bold text-white hover:bg-slate-700 transition"><Plus size={16}/> {vocab.addExerciseBtn}</button>
          </div>
        ) : (
          <div className="space-y-3">
            {(program[activeDay] || []).map((ex, i) => (
              <div key={ex.id} className={`bg-slate-800/80 border ${ex.done ? 'border-[#ccff00]/30 bg-[#ccff00]/5' : 'border-slate-700'} p-4 rounded-3xl transition-all shadow-sm`}>
                <div className="flex justify-between items-start mb-3">
                   <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <input type="text" value={ex.name} onChange={(e) => updateEx(activeDay, ex.id, 'name', e.target.value)} className={`bg-transparent font-black text-lg outline-none ${ex.done ? 'text-[#ccff00] line-through' : 'text-white'} placeholder-slate-600 w-full`} placeholder="Nom exercice..." />
                            {ex.instructions && (
                                <button onClick={() => setExpandedEx(expandedEx === ex.id ? null : ex.id)} className="text-blue-400 hover:text-blue-300">
                                    <Info size={18} />
                                </button>
                            )}
                        </div>
                  </div>
                  <button onClick={() => deleteEx(activeDay, ex.id)} className="text-slate-500 hover:text-red-400 p-1"><Trash2 size={18} /></button>
                </div>

                {/* Affichage des instructions si elles existent et que l'exercice est étendu */}
                {ex.instructions && expandedEx === ex.id && (
                    <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-sm text-blue-200 animate-in fade-in">
                        <p className="flex items-start gap-2"><Info size={16} className="shrink-0 mt-0.5"/> {ex.instructions}</p>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-3 mb-3">
                  {[ { l: 'Sets', v: ex.sets, f: 'sets' }, { l: 'Reps', v: ex.reps, f: 'reps' }, { l: 'Kg', v: ex.weight, f: 'weight' } ].map((field, idx) => (
                    <div key={idx} className="bg-slate-900/50 rounded-xl p-2 relative border border-slate-700/50">
                      <span className="absolute -top-2 left-3 bg-slate-800 px-1 text-[9px] font-bold text-slate-400 uppercase">{field.l}</span>
                      <input type="number" value={field.v} onChange={(e) => updateEx(activeDay, ex.id, field.f, Number(e.target.value))} className="w-full bg-transparent text-center font-black text-white outline-none" />
                    </div>
                  ))}
                </div>
                <button onClick={() => toggleDone(activeDay, ex.id)} className={`w-full py-2 rounded-xl font-black flex justify-center items-center gap-2 transition-all ${ex.done ? 'bg-[#ccff00] text-black hover:bg-[#b3e600]' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>{ex.done ? 'TERMINÉ' : 'VALIDER LA SÉRIE'}</button>
              </div>
            ))}
             <button onClick={addManualExercise} className="w-full py-3 mt-4 border-2 border-dashed border-slate-700 rounded-3xl text-slate-400 font-bold flex justify-center items-center gap-2 hover:border-[#ccff00] hover:text-[#ccff00] transition"><Plus size={18}/> {vocab.addExerciseBtn}</button>
          </div>
        )}
      </div>

      {/* PANNEAU IA FLOTTANT */}
      <div className="fixed bottom-[85px] left-1/2 -translate-x-1/2 w-full max-w-md z-40 px-4">
        <div className="flex justify-center mb-2">
            <button onClick={() => setShowAIPanel(!showAIPanel)} className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl transition-all ${showAIPanel ? 'bg-slate-800 text-white border border-slate-700' : 'bg-gradient-to-r from-[#ccff00] to-orange-500 text-black scale-105'}`}>
            <Bot size={18} /> {showAIPanel ? vocab.aiPanelClose : vocab.aiPanelBtn}
            </button>
        </div>

        {showAIPanel && (
          <div className="bg-slate-900/95 backdrop-blur-xl p-4 rounded-[2rem] border border-slate-700/80 shadow-[0_-10px_40px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-10 duration-300">
            
            {imagePreview && (
                <div className="relative mb-4 mx-auto w-fit">
                <img src={imagePreview} alt="Machine" className="h-32 w-auto object-cover rounded-xl border-2 border-[#ccff00] shadow-lg" />
                <button onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:scale-110 transition"><X size={14} /></button>
                </div>
            )}

            {/* RÉSULTAT DE L'IDENTIFICATION DE MACHINE */}
            {machineAnalysis && (
                <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl animate-in fade-in zoom-in">
                    <h4 className="font-black text-white text-lg mb-1 flex items-center gap-2">
                        <span className="text-blue-400">{vocab.machineIdTitle}</span> {machineAnalysis.name}
                    </h4>
                    {machineAnalysis.muscles && (
                         <p className="text-xs font-bold text-blue-300 mb-3 flex items-center gap-1">
                            <BicepsFlexed size={14}/> {vocab.musclesTargeted} {machineAnalysis.muscles}
                         </p>
                    )}
                    <div className="text-sm text-slate-300 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                        <p className="font-bold text-blue-400 mb-1">{vocab.machineInstructions}</p>
                        {machineAnalysis.instructions}
                    </div>
                    <button onClick={addIdentifiedExercise} className="w-full mt-3 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 rounded-xl transition flex items-center justify-center gap-2">
                        <Plus size={16}/> {vocab.addToWorkoutBtn}
                    </button>
                </div>
            )}

            <div className="flex gap-2 items-end">
                <textarea value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder={vocab.aiPlaceholder} className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl p-3 text-sm text-white font-medium outline-none focus:border-[#ccff00] resize-none h-14 placeholder-slate-500" disabled={!!imageBase64 && !machineAnalysis}></textarea>
                
                {/* Bouton Caméra */}
                <div className="flex items-center justify-center">
                <input type="file" accept="image/*" capture="environment" onChange={handleImageCapture} ref={fileInputRef} className="hidden" id="camera-upload-workout" />
                <label htmlFor="camera-upload-workout" className={`bg-slate-800 hover:bg-slate-700 cursor-pointer h-14 w-14 rounded-2xl flex items-center justify-center text-white transition-colors border border-slate-700 ${imageBase64 ? 'border-[#ccff00] text-[#ccff00]' : ''}`}>
                    <Camera size={24} />
                </label>
                </div>

                {/* Bouton Go (caché si une analyse de machine est déjà affichée) */}
                {!machineAnalysis && (
                    <button onClick={handleAIGenerate} disabled={loading || (!aiInput.trim() && !imageBase64)} className="h-14 px-6 bg-[#ccff00] disabled:bg-slate-800 disabled:text-slate-600 text-black font-black rounded-2xl hover:bg-[#b3e600] transition-transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg">
                    {loading ? <Loader2 size={20} className="animate-spin" /> : vocab.aiBtnGenerate}
                    </button>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workout;
