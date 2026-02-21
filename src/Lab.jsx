import React, { useState } from 'react';
import { Syringe, ArrowRight, ShieldAlert, AlertTriangle, Droplet, Search } from 'lucide-react';

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
    labDesc: isFr ? 'Sélectionnez un peptide pour voir le protocole standard et obtenir la dilution parfaite.' : 'Select a peptide to view the standard protocol and get the perfect dilution.',
    selectPeptide: isFr ? 'Protocole de référence (A-Z)' : 'Reference Protocol (A-Z)',
    chooseOption: isFr ? '-- Choisir un peptide --' : '-- Choose a peptide --',
    vialMg: isFr ? 'Taille de votre fiole (mg)' : 'Your Vial Size (mg)',
    doseMcg: isFr ? 'Dose Ciblée (mcg) - Modifiable' : 'Target Dose (mcg) - Editable',
    calculateBtn: isFr ? 'Générer la Recette' : 'Generate Recipe',
    
    mathWarningTitle: isFr ? 'Validation Requise' : 'Validation Required',
    mathWarningText: isFr 
      ? 'Ceci est un calcul automatisé basé sur vos chiffres. L\'application calcule le meilleur scénario d\'eau possible. Vérifiez toujours vos mathématiques avant reconstitution.' 
      : 'This is an automated calculation. The app calculates the best possible water scenario. Always double-check your math before reconstitution.',
    confirmMathBtn: isFr ? 'Afficher la recette' : 'Show Recipe',

    resultsTitle: isFr ? 'Recette Parfaite' : 'Perfect Recipe',
    addWater: isFr ? '1. AJOUTEZ BAC WATER' : '1. ADD BAC WATER',
    pullTo: isFr ? '2. TIREZ LA SERINGUE À' : '2. PULL SYRINGE TO',
    units: isFr ? 'Unités (UI)' : 'Units (IU)',
    protocolHeader: isFr ? '📖 Protocole Standard' : '📖 Standard Protocol',
    
    errorNoMg: isFr ? 'Veuillez entrer les mg de votre fiole.' : 'Please enter the vial mg.',
    
    // NOUVEAU : Avertissement de petite seringue
    syringeWarning: isFr 
      ? "💡 Petite dose détectée : Utilisez une seringue de 0.3ml ou 0.5ml pour bien voir les graduations (difficile à lire sur une 1ml standard)." 
      : "💡 Small dose detected: Use a 0.3ml or 0.5ml syringe to clearly see the tick marks (hard to read on a standard 1ml).",
  };

  // --- BASE DE DONNÉES PEPTIDES (A-Z) ---
  const peptideDB = [
    { name: '5-Amino-1MQ', stdDose: 5000, protFr: '5mg par jour (si injectable).', protEn: '5mg daily (if injectable format).' },
    { name: 'ARA-290', stdDose: 400, protFr: '400mcg par jour pendant 30 jours consécutifs.', protEn: '400mcg daily for 30 consecutive days.' },
    { name: 'BPC-157', stdDose: 250, protFr: '250mcg à 500mcg, 1 à 2 fois par jour.', protEn: '250mcg to 500mcg, 1 to 2 times daily.' },
    { name: 'BPC-157 / TB-500 Blend', stdDose: 500, protFr: '500mcg du mélange par jour (donne 250mcg de chaque).', protEn: '500mcg of the blend daily (yields 250mcg of each).' },
    { name: 'Brain Blend', stdDose: 500, protFr: '500mcg par jour selon les besoins cognitifs.', protEn: '500mcg daily as needed for cognitive support.' },
    { name: 'Cagrilintide', stdDose: 250, protFr: 'Départ à 0.25mg (250mcg) une fois par semaine.', protEn: 'Starting dose 0.25mg (250mcg) once a week.' },
    { name: 'Cardiogen', stdDose: 1000, protFr: '1mg à 2mg par jour pendant 10 à 20 jours.', protEn: '1mg to 2mg daily for 10 to 20 days.' },
    { name: 'Cartalax', stdDose: 1000, protFr: '1mg à 2mg par jour pendant 10 à 20 jours (Bioregulateur).', protEn: '1mg to 2mg daily for 10 to 20 days (Bioregulator).' },
    { name: 'Chonluten', stdDose: 1000, protFr: '1mg à 2mg par jour pendant 10 à 20 jours.', protEn: '1mg to 2mg daily for 10 to 20 days.' },
    { name: 'CJC-1295 no DAC', stdDose: 100, protFr: '100mcg 1 à 3 fois par jour à jeun. Souvent avec Ipamorelin.', protEn: '100mcg 1 to 3 times daily fasted. Often with Ipamorelin.' },
    { name: 'CJC-1295 no DAC + Ipamorelin Blend', stdDose: 200, protFr: '200mcg du mélange (100mcg chaque) 1 à 3 fois par jour à jeun. 5 jours ON, 2 jours OFF.', protEn: '200mcg of blend (100mcg each) 1 to 3 times daily fasted. 5 days ON, 2 days OFF.' },
    { name: 'CJC-1295 with DAC', stdDose: 2000, protFr: '2mg (2000mcg) une à deux fois par semaine.', protEn: '2mg (2000mcg) once or twice a week.' },
    { name: 'DSIP', stdDose: 100, protFr: '100mcg à 250mcg 1 à 2 heures avant le coucher.', protEn: '100mcg to 250mcg 1 to 2 hours before bed.' },
    { name: 'Epitalon', stdDose: 1000, protFr: '1mg par jour pendant 10 jours. Répéter 2x par an.', protEn: '1mg daily for 10 days. Repeat twice a year.' },
    { name: 'GHK-Cu', stdDose: 2000, protFr: '2mg par jour. Note: Ajouter extra Bac Water si brûlure à l\'injection.', protEn: '2mg daily. Note: Add extra Bac Water if injection burns (PIP).' },
    { name: 'GLOW Blend', stdDose: 1000, protFr: '1mg par jour (Santé peau/cheveux).', protEn: '1mg daily (Skin/hair health).' },
    { name: 'Glutathione', stdDose: 100000, protFr: '100mg (100,000mcg) 1 à 3 fois par semaine.', protEn: '100mg (100,000mcg) 1 to 3 times a week.' },
    { name: 'hCG', stdDose: 250, protFr: '250 UI à 500 UI. NOTE: Entrez les milliers dans "Taille fiole" (Ex: tapez 7 pour une fiole de 7000iu).', protEn: '250 IU to 500 IU. NOTE: Enter thousands in "Vial Size" (E.g. type 7 for a 7000iu vial).' },
    { name: 'HMG', stdDose: 75, protFr: '75 UI par injection. NOTE: Tapez 75 dans "Taille fiole" pour ce calcul.', protEn: '75 IU per injection. NOTE: Type 75 in "Vial Size" for this math.' },
    { name: 'IGF-1 LR3', stdDose: 50, protFr: '20mcg à 50mcg post-entraînement. Max 4 semaines.', protEn: '20mcg to 50mcg post-workout. Max 4 weeks.' },
    { name: 'Ipamorelin', stdDose: 100, protFr: '100mcg à 300mcg 1 à 3 fois par jour à jeun.', protEn: '100mcg to 300mcg 1 to 3 times daily fasted.' },
    { name: 'Kisspeptin', stdDose: 200, protFr: '100mcg à 300mcg selon les besoins.', protEn: '100mcg to 300mcg as needed.' },
    { name: 'KLOW Blend', stdDose: 1000, protFr: '1mg par jour selon protocole spécifique.', protEn: '1mg daily depending on specific protocol.' },
    { name: 'KPV', stdDose: 250, protFr: '250mcg à 500mcg par jour (Inflammation).', protEn: '250mcg to 500mcg daily (Inflammation).' },
    { name: 'LL-37', stdDose: 100, protFr: '100mcg par jour ou aux 2 jours.', protEn: '100mcg daily or every other day.' },
    { name: 'Mazdutide', stdDose: 1000, protFr: 'Départ à 1mg (1000mcg) une fois par semaine.', protEn: 'Starting dose 1mg (1000mcg) once a week.' },
    { name: 'Melanotan-1', stdDose: 1000, protFr: '1mg par jour avant exposition UV. Moins de nausées que MT2.', protEn: '1mg daily before UV. Less nausea than MT2.' },
    { name: 'Melanotan-2', stdDose: 250, protFr: '250mcg 30 min avant exposition UV. Ne pas dépasser 500mcg.', protEn: '250mcg 30 mins before UV. Do not exceed 500mcg.' },
    { name: 'MOTS-C', stdDose: 5000, protFr: '5mg (5000mcg) une fois par semaine.', protEn: '5mg (5000mcg) once a week.' },
    { name: 'NAD+', stdDose: 50000, protFr: '50mg (50,000mcg) en sous-cutané 1 à 3 fois par semaine.', protEn: '50mg (50,000mcg) subQ 1 to 3 times a week.' },
    { name: 'Ovagen', stdDose: 1000, protFr: '1mg à 2mg par jour pendant 10 à 20 jours.', protEn: '1mg to 2mg daily for 10 to 20 days.' },
    { name: 'PT-141', stdDose: 1500, protFr: '1.5mg à 2mg environ 2 à 4 heures avant l\'activité.', protEn: '1.5mg to 2mg approx 2 to 4 hours before activity.' },
    { name: 'Retatrutide', stdDose: 2000, protFr: 'Départ à 2mg (2000mcg) une fois par semaine. Titrage mensuel.', protEn: 'Starting dose 2mg (2000mcg) once a week. Monthly titration.' },
    { name: 'Selank', stdDose: 250, protFr: '250mcg à 500mcg par jour (Anxiolytique).', protEn: '250mcg to 500mcg daily (Anxiolytic).' },
    { name: 'Semaglutide', stdDose: 250, protFr: 'Départ à 0.25mg (250mcg) une fois par semaine pendant 4 semaines.', protEn: 'Start at 0.25mg (250mcg) once a week for 4 weeks.' },
    { name: 'Semax', stdDose: 300, protFr: '300mcg à 1mg par jour (Nootropique).', protEn: '300mcg to 1mg daily (Nootropic).' },
    { name: 'Sermorelin', stdDose: 200, protFr: '200mcg à 300mcg par jour avant le coucher à jeun.', protEn: '200mcg to 300mcg daily before bed fasted.' },
    { name: 'SS-31', stdDose: 4000, protFr: '4mg (4000mcg) par jour pendant 2 à 4 semaines.', protEn: '4mg (4000mcg) daily for 2 to 4 weeks.' },
    { name: 'Survodutide', stdDose: 600, protFr: 'Départ à 0.6mg (600mcg) une fois par semaine pendant 4 semaines.', protEn: 'Starting dose 0.6mg (600mcg) once a week for 4 weeks.' },
    { name: 'TB-500', stdDose: 2500, protFr: '2.5mg (2500mcg) deux fois par semaine (Total 5mg/sem).', protEn: '2.5mg (2500mcg) twice a week (Total 5mg/week).' },
    { name: 'Tesamorelin', stdDose: 1000, protFr: '1mg (1000mcg) par jour à jeun avant le coucher. 5 jours ON, 2 OFF.', protEn: '1mg (1000mcg) daily fasted before bed. 5 days ON, 2 OFF.' },
    { name: 'Thymosin Alpha-1', stdDose: 1500, protFr: '1.5mg (1500mcg) deux fois par semaine pour l\'immunité.', protEn: '1.5mg (1500mcg) twice a week for immunity.' },
    { name: 'Thymulin', stdDose: 1000, protFr: '1mg à 2mg par jour pendant 10 jours.', protEn: '1mg to 2mg daily for 10 days.' },
    { name: 'Tirzepatide', stdDose: 2500, protFr: 'Départ à 2.5mg (2500mcg) une fois par semaine pendant 4 semaines.', protEn: 'Start at 2.5mg (2500mcg) once a week for 4 weeks.' }
  ];

  // --- ÉTATS ---
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(() => {
    return localStorage.getItem('pos_lab_disclaimer') === 'true';
  });
  const [showMathWarning, setShowMathWarning] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [selectedPeptide, setSelectedPeptide] = useState('');
  const [vialMg, setVialMg] = useState('');
  const [doseMcg, setDoseMcg] = useState('');
  
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

  // L'ALGORITHME "NO-BRAINER"
  const executeMath = () => {
    const mg = parseFloat(vialMg);
    const targetMcg = parseFloat(doseMcg);
    const totalMcgInVial = mg * 1000;
    
    // Le but est de trouver une quantité d'eau réaliste (entre 1ml et 3ml) 
    // pour avoir un beau chiffre rond sur la seringue (ex: 5, 10, 20 unités).
    
    let tryUnits = 10;
    let tryWater = (totalMcgInVial / targetMcg) * (tryUnits / 100);
    
    if (tryWater > 3.0) {
      tryUnits = 5;
      tryWater = (totalMcgInVial / targetMcg) * (tryUnits / 100);
    }
    if (tryWater > 3.0) {
      tryUnits = 2;
      tryWater = (totalMcgInVial / targetMcg) * (tryUnits / 100);
    }
    if (tryWater < 1.0) {
      tryUnits = 20;
      tryWater = (totalMcgInVial / targetMcg) * (tryUnits / 100);
    }
    if (tryWater < 1.0) {
      tryUnits = 50;
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
      <div className="flex flex-col items-center justify-center h-full space-y-6 px-4 animate-in zoom-in duration-500 mt-10">
        <ShieldAlert size={80} className="text-red-500" />
        <h2 className="text-2xl font-black text-white text-center">{vocab.disclaimerTitle}</h2>
        <p className="text-sm text-slate-400 text-center leading-relaxed max-w-sm">
          {vocab.disclaimerText}
        </p>
        <button 
          onClick={acceptDisclaimer}
          className="bg-red-500 hover:bg-red-600 text-white font-black px-6 py-4 rounded-xl w-full max-w-xs transition-colors mt-8"
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
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">{vocab.labDesc}</p>
      </div>

      {/* FORMULAIRE DE SÉLECTION */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-[2rem] shadow-xl relative z-10">
        
        <div className="mb-5">
          <label className="text-[10px] text-[#ccff00] font-bold mb-2 flex items-center gap-1.5 uppercase tracking-wider">
            <Search size={12} /> {vocab.selectPeptide}
          </label>
          <select 
            className="w-full bg-black/50 border border-slate-700 text-white p-3.5 rounded-xl outline-none focus:border-[#ccff00] appearance-none font-bold text-sm"
            value={selectedPeptide}
            onChange={handlePeptideChange}
          >
            <option value="">{vocab.chooseOption}</option>
            {peptideDB.map(p => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* INPUTS : FIOLE & DOSE */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <label className="text-[9px] text-slate-400 font-bold mb-1 block uppercase tracking-wider">{vocab.vialMg}</label>
            <div className="flex items-center gap-1">
              <input 
                type="number" value={vialMg} onChange={(e) => {setVialMg(e.target.value); setShowResults(false);}}
                placeholder="Ex: 5"
                className="bg-transparent text-white font-black text-[16px] w-full focus:outline-none placeholder-slate-600"
              />
              <span className="text-xs font-bold text-slate-500">mg</span>
            </div>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <label className="text-[9px] text-slate-400 font-bold mb-1 block uppercase tracking-wider">{vocab.doseMcg}</label>
            <div className="flex items-center gap-1">
              <input 
                type="number" value={doseMcg} onChange={(e) => {setDoseMcg(e.target.value); setShowResults(false);}}
                className="bg-transparent text-[#ccff00] font-black text-[16px] w-full focus:outline-none placeholder-slate-600"
              />
              <span className="text-xs font-bold text-[#ccff00]/50">mcg</span>
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
          <div className="bg-slate-900 border border-red-500/50 p-6 rounded-3xl max-w-sm w-full text-center shadow-[0_0_40px_rgba(239,68,68,0.15)] relative">
            <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-white font-black text-lg mb-2">{vocab.mathWarningTitle}</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">{vocab.mathWarningText}</p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowMathWarning(false)}
                className="flex-1 bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={executeMath}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black py-3.5 rounded-xl transition-colors"
              >
                {vocab.confirmMathBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RÉSULTATS GÉNÉRÉS */}
      {showResults && activePeptideData && (
        <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-4">
          
          <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-2">{vocab.resultsTitle}</h3>
          
          {/* CARTE RECETTE */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-5 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-700/50">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 mb-1">{vocab.addWater}</span>
                <span className="text-3xl font-black text-white">{calcWaterMl} ml</span>
              </div>
              <Droplet className="text-slate-600" size={32} />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#ccff00]/70 mb-1">{vocab.pullTo}</span>
                <span className="text-3xl font-black text-[#ccff00]">{calcUnits} <span className="text-sm font-bold opacity-70">{vocab.units}</span></span>
              </div>
              <Syringe className="text-[#ccff00]/30" size={32} />
            </div>

            {/* NOUVEAU : AVERTISSEMENT SI PETITE DOSE (5 unités ou moins) */}
            {calcUnits <= 5 && (
              <div className="bg-orange-500/10 border border-orange-500/50 p-3 rounded-xl flex items-start gap-2 mt-4 animate-in fade-in">
                <AlertTriangle size={18} className="text-orange-500 shrink-0 mt-0.5" />
                <p className="text-orange-400 text-xs font-medium leading-tight">
                  {vocab.syringeWarning}
                </p>
              </div>
            )}
          </div>

          {/* CARTE PROTOCOLE */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#ccff00]" />
            <h4 className="text-white font-black text-xs flex items-center gap-2 mb-3 uppercase tracking-wider">
              {vocab.protocolHeader}
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed font-medium">
              {isFr ? activePeptideData.protFr : activePeptideData.protEn}
            </p>
          </div>

        </div>
      )}

    </div>
  );
};

export default Lab;
