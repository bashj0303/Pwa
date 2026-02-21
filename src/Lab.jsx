import React, { useState, useEffect } from 'react';
import { Syringe, ArrowRight, ShieldAlert, CheckCircle2, AlertTriangle, Droplet } from 'lucide-react';

const Lab = ({ t }) => {
  const isFr = t.month === 'mois';

  // --- TRADUCTIONS LOCALES DU LABO ---
  const vocab = {
    disclaimerTitle: isFr ? '⚠️ AVERTISSEMENT LÉGAL' : '⚠️ LEGAL DISCLAIMER',
    disclaimerText: isFr 
      ? "Cette application est strictement un outil mathématique et éducatif. Les protocoles et calculs fournis ne constituent en aucun cas une recommandation médicale. En continuant, vous acceptez être seul responsable de vos mélanges et de votre santé. Consultez un professionnel de la santé."
      : "This application is strictly a mathematical and educational tool. The protocols and calculations provided do not constitute medical advice. By continuing, you agree to be solely responsible for your reconstitutions and your health. Consult a healthcare professional.",
    acceptBtn: isFr ? 'Je comprends et j\'accepte' : 'I understand and accept',
    
    labTitle: 'Smart Reconstitution',
    labDesc: isFr ? 'Sélectionnez un peptide pour voir le protocole standard et calculer la dilution exacte.' : 'Select a peptide to view the standard protocol and calculate exact dilution.',
    selectPeptide: isFr ? 'Protocole de référence (A-Z)' : 'Reference Protocol (A-Z)',
    chooseOption: isFr ? '-- Choisir un peptide --' : '-- Choose a peptide --',
    vialMg: 'Vial Size (mg)',
    doseMcg: isFr ? 'Votre Dose (mcg)' : 'Your Dose (mcg)',
    calculateBtn: isFr ? 'Générer le Protocole' : 'Generate Protocol',
    
    mathWarningTitle: isFr ? 'Validation Requise' : 'Validation Required',
    mathWarningText: isFr 
      ? 'Ceci est un calcul automatisé basé sur vos chiffres. Vérifiez toujours vos mathématiques avant reconstitution.' 
      : 'This is an automated calculation based on your numbers. Always double-check your math before reconstitution.',
    confirmMathBtn: isFr ? 'Afficher le calcul' : 'Show Calculation',

    resultsTitle: isFr ? 'Recette de Dilution' : 'Dilution Recipe',
    addWater: isFr ? 'AJOUTEZ BAC WATER' : 'ADD BAC WATER',
    pullTo: isFr ? 'TIREZ LA SERINGUE À' : 'PULL SYRINGE TO',
    units: isFr ? 'Unités (UI)' : 'Units (IU)',
    protocolHeader: isFr ? '📖 Protocole Standard' : '📖 Standard Protocol',
    
    errorNoMg: isFr ? 'Veuillez entrer les mg de votre fiole.' : 'Please enter the vial mg.',
    errorMath: isFr ? 'Calcul impossible avec ces valeurs.' : 'Math impossible with these values.',
  };

  // --- BASE DE DONNÉES PEPTIDES & GLP-1 (Ordre Alphabétique) ---
  const peptideDB = [
    { 
      name: 'ARA-290', 
      stdDose: 400, 
      protFr: 'Protocole neuropathie : 400mcg par jour (sous-cutané) pendant 30 jours consécutifs.', 
      protEn: 'Neuropathy protocol: 400mcg daily (subQ) for 30 consecutive days.' 
    },
    { 
      name: 'BPC-157', 
      stdDose: 250, 
      protFr: 'Guérison : 250mcg à 500mcg, 1 à 2 fois par jour. Injecter le plus près possible de la blessure ou en sous-cutané (ventre).', 
      protEn: 'Healing: 250mcg to 500mcg, 1 to 2 times daily. Inject as close to the injury as possible or subQ (stomach).' 
    },
    { 
      name: 'CJC-1295 (No DAC) / Ipamorelin', 
      stdDose: 100, 
      protFr: 'Saturation GH : 100mcg de chaque. 1 à 3 fois par jour. À jeun (2h après le repas, 30 min avant de manger). 5 jours on / 2 jours off.', 
      protEn: 'GH Saturation: 100mcg of each. 1 to 3 times daily. Fasted (2h post-meal, 30m pre-meal). 5 days on / 2 days off.' 
    },
    { 
      name: 'Epitalon', 
      stdDose: 1000, 
      protFr: 'Anti-âge (Mélatonine/Télomères) : 1mg par jour pendant 10 jours. Répéter 2x par an.', 
      protEn: 'Anti-aging (Melatonin/Telomeres): 1mg daily for 10 days. Repeat twice a year.' 
    },
    { 
      name: 'GHK-Cu', 
      stdDose: 2000, 
      protFr: 'Peau/Cheveux : 2mg par jour (sous-cutané). Note: Peut brûler à l\'injection, diluer avec plus d\'eau ou mélanger avec BPC-157.', 
      protEn: 'Skin/Hair: 2mg daily (subQ). Note: Can cause PIP (pain), dilute with more water or mix with BPC-157.' 
    },
    { 
      name: 'Melanotan II (MT2)', 
      stdDose: 250, 
      protFr: 'Bronzage : 250mcg 30 minutes avant l\'exposition aux UV. Ne pas dépasser 500mcg pour éviter les nausées.', 
      protEn: 'Tanning: 250mcg 30 mins before UV exposure. Do not exceed 500mcg to avoid severe nausea.' 
    },
    { 
      name: 'MOTS-c', 
      stdDose: 5000, 
      protFr: 'Énergie mitochondriale : 5mg une fois par semaine (ou 10mg divisé en deux).', 
      protEn: 'Mitochondrial energy: 5mg once a week (or 10mg split in two doses).' 
    },
    { 
      name: 'PT-141 (Bremelanotide)', 
      stdDose: 1500, 
      protFr: 'Libido : 1.5mg à 2mg environ 2 à 4 heures avant l\'activité. (Commencer à 1mg pour tester les nausées).', 
      protEn: 'Libido: 1.5mg to 2mg approx 2 to 4 hours before activity. (Start at 1mg to test for nausea).' 
    },
    { 
      name: 'Retatrutide (GLP-1/GIP/Glucagon)', 
      stdDose: 2000, 
      protFr: 'Perte de poids : Dose de départ à 2mg une fois par semaine. Titrage mensuel si nécessaire.', 
      protEn: 'Weight loss: Starting dose of 2mg once a week. Monthly titration if necessary.' 
    },
    { 
      name: 'Selank', 
      stdDose: 250, 
      protFr: 'Anxiolytique / Nootropique : 250mcg à 500mcg par jour (sous-cutané ou spray nasal).', 
      protEn: 'Anxiolytic / Nootropic: 250mcg to 500mcg daily (subQ or nasal spray).' 
    },
    { 
      name: 'Semaglutide (GLP-1)', 
      stdDose: 250, 
      protFr: 'Perte de poids : Départ à 0.25mg (250mcg) une fois par semaine pendant 4 semaines. Augmenter à 0.5mg ensuite.', 
      protEn: 'Weight loss: Start at 0.25mg (250mcg) once a week for 4 weeks. Increase to 0.5mg afterwards.' 
    },
    { 
      name: 'Semax', 
      stdDose: 300, 
      protFr: 'Concentration / Nootropique : 300mcg à 1mg par jour selon les besoins.', 
      protEn: 'Focus / Nootropic: 300mcg to 1mg daily as needed.' 
    },
    { 
      name: 'SS-31', 
      stdDose: 4000, 
      protFr: 'Mitochondrie (Pre-MOTS-c) : 4mg par jour pendant 2 à 4 semaines.', 
      protEn: 'Mitochondria (Pre-MOTS-c): 4mg daily for 2 to 4 weeks.' 
    },
    { 
      name: 'TB-500', 
      stdDose: 2500, 
      protFr: 'Guérison musculaire : 2.5mg deux fois par semaine (Total 5mg/semaine). Systémique (n\'importe où sous la peau).', 
      protEn: 'Muscle healing: 2.5mg twice a week (Total 5mg/week). Systemic (anywhere subQ).' 
    },
    { 
      name: 'Tesamorelin', 
      stdDose: 1000, 
      protFr: 'Perte de gras viscéral : 1mg par jour. À jeun avant le coucher. 5 jours on / 2 jours off.', 
      protEn: 'Visceral fat loss: 1mg daily. Fasted before bed. 5 days on / 2 days off.' 
    },
    { 
      name: 'Tirzepatide (GLP-1/GIP)', 
      stdDose: 2500, 
      protFr: 'Perte de poids : Départ à 2.5mg (2500mcg) une fois par semaine pendant 4 semaines. Augmenter à 5.0mg ensuite.', 
      protEn: 'Weight loss: Start at 2.5mg (2500mcg) once a week for 4 weeks. Increase to 5.0mg afterwards.' 
    }
  ];

  // --- ÉTATS ---
  // Protection Légale
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(() => {
    return localStorage.getItem('pos_lab_disclaimer') === 'true';
  });
  const [showMathWarning, setShowMathWarning] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Formulaire
  const [selectedPeptide, setSelectedPeptide] = useState('');
  const [vialMg, setVialMg] = useState('');
  const [doseMcg, setDoseMcg] = useState('');
  
  // Résultats
  const [calcWaterMl, setCalcWaterMl] = useState(0);
  const [calcUnits, setCalcUnits] = useState(0);

  const acceptDisclaimer = () => {
    localStorage.setItem('pos_lab_disclaimer', 'true');
    setHasAcceptedDisclaimer(true);
  };

  const handlePeptideChange = (e) => {
    const pepName = e.target.value;
    setSelectedPeptide(pepName);
    setShowResults(false);
    
    if (pepName !== '') {
      const pep = peptideDB.find(p => p.name === pepName);
      if (pep) setDoseMcg(pep.stdDose.toString());
    } else {
      setDoseMcg('');
    }
  };

  const triggerCalculation = () => {
    if (!vialMg || Number(vialMg) <= 0) {
      alert(vocab.errorNoMg);
      return;
    }
    if (!doseMcg || Number(doseMcg) <= 0) return;
    
    setShowMathWarning(true);
  };

  const executeMath = () => {
    const mg = parseFloat(vialMg);
    const targetMcg = parseFloat(doseMcg);
    const totalMcgInVial = mg * 1000;
    
    // On veut trouver la solution la plus élégante (chiffres ronds sur la seringue).
    // Test 1: Tirer 10 unités (0.1ml)
    let tryUnits = 10;
    let tryWater = (totalMcgInVial / targetMcg) * (tryUnits / 100);
    
    // Si ça demande trop d'eau (>3ml, taille fiole standard), on teste de tirer 5 unités (0.05ml)
    if (tryWater > 3.0) {
      tryUnits = 5;
      tryWater = (totalMcgInVial / targetMcg) * (tryUnits / 100);
    }
    
    // Si encore trop d'eau, on teste de tirer 2 unités (0.02ml)
    if (tryWater > 3.0) {
      tryUnits = 2;
      tryWater = (totalMcgInVial / targetMcg) * (tryUnits / 100);
    }
    
    // Si ça demande trop PEU d'eau (< 0.5ml), on teste de tirer 20 unités (0.2ml)
    if (tryWater < 0.5) {
      tryUnits = 20;
      tryWater = (totalMcgInVial / targetMcg) * (tryUnits / 100);
    }

    setCalcWaterMl(tryWater.toFixed(1));
    setCalcUnits(tryUnits);
    setShowMathWarning(false);
    setShowResults(true);
  };

  // --- VUE : MODAL DISCLAIMER ---
  if (!hasAcceptedDisclaimer) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 px-4 animate-in zoom-in duration-500">
        <ShieldAlert size={80} className="text-red-500" />
        <h2 className="text-2xl font-black text-white text-center">{vocab.disclaimerTitle}</h2>
        <p className="text-sm text-slate-400 text-center leading-relaxed max-w-sm">
          {vocab.disclaimerText}
        </p>
        <button 
          onClick={acceptDisclaimer}
          className="bg-red-500 hover:bg-red-600 text-white font-black px-6 py-4 rounded-xl w-full max-w-xs transition-colors"
        >
          {vocab.acceptBtn}
        </button>
      </div>
    );
  }

  const activePeptideData = peptideDB.find(p => p.name === selectedPeptide);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-10">
      
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <Droplet size={28} className="text-[#ccff00]" /> {vocab.labTitle}
        </h2>
        <p className="text-xs text-slate-400 mt-2">{vocab.labDesc}</p>
      </div>

      {/* FORMULAIRE DE SÉLECTION */}
      <div className="bg-slate-900 border border-slate-700 p-5 rounded-[2rem] shadow-xl relative z-10">
        
        <div className="mb-5">
          <label className="text-[10px] text-slate-400 font-bold mb-2 block uppercase tracking-wider">{vocab.selectPeptide}</label>
          <select 
            className="w-full bg-black/50 border border-slate-600 text-white p-3.5 rounded-xl outline-none focus:border-[#ccff00] appearance-none font-bold text-sm"
            value={selectedPeptide}
            onChange={handlePeptideChange}
          >
            <option value="">{vocab.chooseOption}</option>
            {peptideDB.map(p => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-[10px] text-slate-400 font-bold mb-1.5 block uppercase tracking-wider">{vocab.vialMg}</label>
            <div className="relative">
              <input 
                type="number" value={vialMg} onChange={(e) => {setVialMg(e.target.value); setShowResults(false);}}
                placeholder="Ex: 5"
                className="w-full bg-black/50 border border-slate-600 text-white font-black text-lg p-3 rounded-xl outline-none focus:border-[#ccff00] placeholder-slate-700"
              />
              <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-500">mg</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-bold mb-1.5 block uppercase tracking-wider">{vocab.doseMcg}</label>
            <div className="relative">
              <input 
                type="number" value={doseMcg} onChange={(e) => {setDoseMcg(e.target.value); setShowResults(false);}}
                placeholder="Ex: 250"
                className="w-full bg-black/50 border border-slate-600 text-[#ccff00] font-black text-lg p-3 rounded-xl outline-none focus:border-[#ccff00] placeholder-slate-700"
              />
              <span className="absolute right-4 top-3.5 text-xs font-bold text-[#ccff00]/50">mcg</span>
            </div>
          </div>
        </div>

        <button 
          onClick={triggerCalculation}
          disabled={!selectedPeptide || !vialMg || !doseMcg}
          className="w-full bg-[#ccff00] text-black font-black uppercase tracking-widest py-4 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Syringe size={18} /> {vocab.calculateBtn}
        </button>
      </div>

      {/* POP-UP WARNING MATHÉMATIQUE */}
      {showMathWarning && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in zoom-in duration-200">
          <div className="bg-slate-800 border border-red-500/50 p-6 rounded-3xl max-w-sm w-full text-center shadow-[0_0_40px_rgba(239,68,68,0.15)]">
            <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-white font-black text-lg mb-2">{vocab.mathWarningTitle}</h3>
            <p className="text-sm text-slate-300 mb-6">{vocab.mathWarningText}</p>
            <button 
              onClick={executeMath}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-3.5 rounded-xl transition-colors"
            >
              {vocab.confirmMathBtn}
            </button>
          </div>
        </div>
      )}

      {/* RÉSULTATS GÉNÉRÉS */}
      {showResults && activePeptideData && (
        <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-4">
          
          <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-2">{vocab.resultsTitle}</h3>
          
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 p-5 rounded-2xl shadow-lg flex justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#ccff00]" />
            <div className="flex flex-col pl-2">
              <span className="text-[10px] font-bold text-slate-400">{vocab.addWater}</span>
              <span className="text-3xl font-black text-white">{calcWaterMl} ml</span>
            </div>
            <ArrowRight className="text-slate-600" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400">{vocab.pullTo}</span>
              <span className="text-3xl font-black text-[#ccff00]">{calcUnits} <span className="text-sm">UI</span></span>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl">
            <h4 className="text-[#ccff00] font-bold text-xs flex items-center gap-2 mb-2 uppercase tracking-wider">
              {vocab.protocolHeader}
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              {isFr ? activePeptideData.protFr : activePeptideData.protEn}
            </p>
          </div>

        </div>
      )}

    </div>
  );
};

export default Lab;
