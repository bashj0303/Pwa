import React, { useState } from 'react';
import { Syringe, ArrowRight } from 'lucide-react';

const Lab = ({ t, translations, lang }) => {
  const [calcMg, setCalcMg] = useState('5');
  const [calcDose, setCalcDose] = useState('100');
  const [largeVial, setLargeVial] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('CJC-1295 / Ipamorelin');

  const peptidePresets = {
    'CJC-1295 / Ipamorelin': { mg: '5', dose: '100', noteKey: 'cjcNote' },
    'MOTS-c': { mg: '10', dose: '1000', noteKey: 'motsNote' },
    'Semax': { mg: '5', dose: '300', noteKey: 'semaxNote' },
    [t.customProtocol]: { mg: '', dose: '', noteKey: 'customNote' }
  };

  const handlePresetChange = (e) => {
    const val = e.target.value;
    setSelectedProduct(val);
    if (val !== t.customProtocol && val !== translations['en'].customProtocol && val !== translations['fr'].customProtocol) {
      setCalcMg(peptidePresets[val].mg);
      setCalcDose(peptidePresets[val].dose);
    } else {
      setCalcMg('');
      setCalcDose('');
    }
  };

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
              {isImpossible ? t.tooMuchWater : t.addWater}
            </span>
            <span className={`text-2xl font-black ${isImpossible ? 'text-red-500' : 'text-white'}`}>
              {neededWater.toFixed(1)} ml
            </span>
            {isImpossible && <span className="text-[9px] text-red-400 mt-1">{t.overflow} ({maxCapacity}ml)</span>}
          </div>
          <ArrowRight className={isImpossible ? 'text-red-900' : 'text-slate-600'} />
          <div className="flex flex-col items-end">
            <span className={`text-[10px] font-bold ${isImpossible ? 'text-red-400' : 'text-slate-400'}`}>{t.pullTo}</span>
            <span className={`text-2xl font-black ${isImpossible ? 'text-red-500' : 'text-[#ccff00]'}`}>{targetUnit} UI</span>
            {!isImpossible && <span className="text-[9px] text-slate-400 mt-1">{targetUnit <= 10 ? t.syringeAdviceFine : t.syringeAdviceStandard}</span>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-slate-800 p-6 rounded-[2rem] border border-slate-700 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 p-4 opacity-5"><Syringe size={120} /></div>
        <h2 className="text-xl font-black text-white mb-1">{t.smartSolver}</h2>
        <p className="text-sm text-slate-400 mb-6 relative z-10">{t.solverDesc}</p>
        
        <div className="mb-4 relative z-10">
          <label className="text-[10px] text-slate-400 font-bold mb-2 block uppercase tracking-wider">{t.refProtocol}</label>
          <select 
            className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl outline-none focus:border-[#ccff00] appearance-none"
            value={selectedProduct}
            onChange={handlePresetChange}
          >
            {Object.keys(peptidePresets).map(k => {
              const label = (k === 'Custom Protocol' || k === 'Personnalisé') ? t.customProtocol : k;
              return <option key={k} value={k}>{label}</option>
            })}
          </select>
          {peptidePresets[selectedProduct]?.noteKey && (
             <p className="text-[10px] text-[#ccff00] mt-2 italic">{t[peptidePresets[selectedProduct].noteKey]}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div>
            <label className="text-[10px] text-slate-400 font-bold mb-1 block uppercase">{t.vialMg}</label>
            <input 
              type="number" value={calcMg} onChange={(e) => setCalcMg(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white font-bold p-3 rounded-xl outline-none focus:border-[#ccff00]"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-bold mb-1 block uppercase">{t.doseMcg}</label>
            <input 
              type="number" value={calcDose} onChange={(e) => setCalcDose(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-[#ccff00] font-bold p-3 rounded-xl outline-none focus:border-[#ccff00]"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 relative z-10">
          <span className="text-xs text-white font-medium">{t.largeVial}</span>
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
          <h3 className="text-[10px] text-slate-400 font-bold mb-3 uppercase tracking-wider pl-2">{t.idealScenarios}</h3>
          <p className="text-[10px] text-center text-slate-600 mb-4 italic">{t.educationalWarning}</p>
          {renderSmartScenario(10)}
          {renderSmartScenario(5)}
          {renderSmartScenario(20)}
        </div>
      ) : (
        <p className="text-center text-slate-500 mt-8 text-sm">{t.enterValues}</p>
      )}
    </div>
  );
};

export default Lab;
