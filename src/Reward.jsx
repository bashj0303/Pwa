import React, { useState, useEffect } from 'react';
import { Gift, ShoppingBag, Share2, Dumbbell, Activity, UtensilsCrossed, CheckCircle2 } from 'lucide-react';

const Reward = ({ t, xp, setXp }) => {
  const isFr = t.month === 'mois';

  const vocab = {
    title: isFr ? 'Grindwear Rewards' : 'Grindwear Rewards',
    desc: isFr ? 'Partage ta discipline. Gagne du merch exclusif.' : 'Share your discipline. Earn exclusive gear.',
    currXp: isFr ? 'XP Actuel' : 'Current XP',
    tier25: '25$ Gift Card',
    tier50: '50$ Gift Card',
    tier75: '75$ Gift Card',
    tier100: '100$ Gift Card',
    locked: isFr ? 'Bloqué' : 'Locked',
    claim: isFr ? 'Réclamer' : 'Claim',
    
    waysToEarn: isFr ? 'Missions Quotidiennes (Social)' : 'Daily Missions (Social)',
    
    shareWorkout: isFr ? 'Partager mon Workout' : 'Share my Workout',
    shareWorkoutDesc: isFr ? 'Partage tes perfs du jour (+10 XP)' : 'Flex today\'s stats (+10 XP)',
    
    shareHabits: isFr ? 'Partager mes Habitudes' : 'Share my Habits',
    shareHabitsDesc: isFr ? 'Montre ta constance (+10 XP)' : 'Flex your consistency (+10 XP)',
    
    shareDiet: isFr ? 'Partager ma Diète' : 'Share my Diet',
    shareDietDesc: isFr ? 'Partage tes macros du jour (+10 XP)' : 'Flex your daily macros (+10 XP)',

    btnShare: isFr ? 'Partager' : 'Share',
    
    successClaim: isFr 
      ? "Félicitations ! Prends une capture d'écran et envoie-nous un DM sur Instagram @Grindwear pour ton code !" 
      : "Congrats! Screenshot this and DM us on Instagram @Grindwear for your code!"
  };

  // Cooldown quotidien
  const todayDate = new Date().toDateString();

  const [shares, setShares] = useState(() => {
    const saved = localStorage.getItem('pos_daily_shares_v2');
    return saved ? JSON.parse(saved) : { workout: null, habits: null, diet: null };
  });

  useEffect(() => {
    localStorage.setItem('pos_daily_shares_v2', JSON.stringify(shares));
  }, [shares]);

  // --- GÉNÉRATEURS DE TEXTE DYNAMIQUE ---

  const generateWorkoutText = () => {
    const workouts = JSON.parse(localStorage.getItem('pos_workouts')) || [];
    if (workouts.length === 0) return null;
    
    let text = isFr ? "💪 Ma session du jour :\n" : "💪 Today's grind:\n";
    workouts.forEach(w => {
      text += `- ${w.name} : ${w.weight}lbs (${w.reps})\n`;
    });
    text += "\nTracké avec Grindup.pro 🔥";
    return text;
  };

  const generateDietText = () => {
    const weeklyFoods = JSON.parse(localStorage.getItem('pos_nutri_weekly_v3')) || {};
    let dayIdx = new Date().getDay();
    dayIdx = dayIdx === 0 ? 6 : dayIdx - 1; // Ajustement Lundi=0
    
    const todayFoods = weeklyFoods[dayIdx] || [];
    if (todayFoods.length === 0) return null;

    const macros = todayFoods.reduce((acc, f) => ({
      k: acc.k + f.k, p: acc.p + f.p, c: acc.c + f.c, fat: acc.f + f.f
    }), { k: 0, p: 0, c: 0, fat: 0 });

    let text = isFr ? "🔥 Mes Macros du jour :\n" : "🔥 Today's Macros:\n";
    text += `Calories : ${macros.k} kcal\nProtéines : ${macros.p}g\nGlucides : ${macros.c}g\nLipides : ${macros.fat}g\n`;
    text += "\nTracké avec Grindup.pro 🥩";
    return text;
  };

  const generateHabitsText = () => {
    const protocols = JSON.parse(localStorage.getItem('pos_protocols')) || [];
    const done = protocols.filter(p => p.done);
    if (done.length === 0) return null;

    let text = isFr ? "🧬 Discipline & Biohacking :\n" : "🧬 Discipline & Biohacking:\n";
    done.forEach(p => {
      text += `✅ ${p.name}\n`;
    });
    text += "\nTracké avec Grindup.pro 🚀";
    return text;
  };

  // --- FONCTION DE PARTAGE ---

  const handleShare = async (type, xpAmount, generatorFunc) => {
    if (shares[type] === todayDate) return;

    const shareText = generatorFunc();
    
    if (!shareText) {
      alert(isFr 
        ? "Tu n'as rien entré aujourd'hui ! Ajoute des données avant de partager." 
        : "You haven't logged anything today! Add data before sharing.");
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Grindup Tracker',
          text: shareText,
        });
        completeShare(type, xpAmount);
      } else {
        navigator.clipboard.writeText(shareText);
        alert(isFr ? "Tes stats ont été copiées ! Colle-les dans ta story Instagram." : "Stats copied! Paste them in your Instagram story.");
        completeShare(type, xpAmount);
      }
    } catch (err) {
      console.log("Partage annulé");
    }
  };

  const completeShare = (type, xpAmount) => {
    setXp(prev => prev + xpAmount);
    setShares(prev => ({ ...prev, [type]: todayDate }));
  };

  const handleClaim = (amount) => {
    alert(vocab.successClaim);
  };

  // 30 XP / jour max
  const tiers = [
    { name: vocab.tier25, cost: 2700, value: 25 }, 
    { name: vocab.tier50, cost: 4500, value: 50 }, 
    { name: vocab.tier75, cost: 6000, value: 75 }, 
    { name: vocab.tier100, cost: 7200, value: 100 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-10">
      
      {/* HEADER GRINDWEAR */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-xl relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ccff00]/10 rounded-full blur-3xl pointer-events-none" />
        <ShoppingBag size={40} className="text-[#ccff00] mx-auto mb-3 relative z-10" />
        <h2 className="text-2xl font-black text-white relative z-10">{vocab.title}</h2>
        <p className="text-xs text-slate-400 mt-1 mb-4 relative z-10">{vocab.desc}</p>
        
        <div className="bg-black/40 border border-slate-700 p-4 rounded-2xl relative z-10">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{vocab.currXp}</p>
          <p className="text-5xl font-black text-[#ccff00]">{xp}</p>
        </div>
      </div>

      {/* BOUTIQUE DE CARTES CADEAUX */}
      <div className="grid grid-cols-2 gap-3">
        {tiers.map(tier => {
          const progress = Math.min((xp / tier.cost) * 100, 100);
          const isUnlocked = xp >= tier.cost;

          return (
            <div key={tier.cost} className={`p-4 rounded-2xl border transition-all ${isUnlocked ? 'bg-slate-800 border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.1)]' : 'bg-slate-800/40 border-slate-700/50'}`}>
              <Gift size={24} className={`mb-2 ${isUnlocked ? 'text-[#ccff00]' : 'text-slate-600'}`} />
              <h4 className="text-white font-black text-sm mb-1">{tier.name}</h4>
              <p className="text-xs font-bold text-slate-400 mb-3">{tier.cost} XP</p>
              
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden mb-3">
                <div 
                  className={`h-full transition-all duration-700 ${isUnlocked ? 'bg-[#ccff00]' : 'bg-slate-600'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <button 
                disabled={!isUnlocked}
                onClick={() => handleClaim(tier.value)}
                className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${isUnlocked ? 'bg-[#ccff00] text-black hover:bg-[#b3e600]' : 'bg-slate-900 text-slate-600 cursor-not-allowed'}`}
              >
                {isUnlocked ? vocab.claim : vocab.locked}
              </button>
            </div>
          );
        })}
      </div>

      {/* MISSIONS DE PARTAGE */}
      <div>
        <h3 className="text-sm font-black text-white mb-3 pl-2 uppercase tracking-wider">{vocab.waysToEarn}</h3>
        
        <div className="space-y-2">
          
          {/* WORKOUT */}
          <button 
            disabled={shares.workout === todayDate}
            onClick={() => handleShare('workout', 10, generateWorkoutText)} 
            className="w-full bg-slate-800 border border-slate-700 p-4 rounded-2xl flex items-center justify-between hover:border-slate-500 transition-colors text-left group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400"><Dumbbell size={20} /></div>
              <div>
                <p className="text-sm font-bold text-white">{vocab.shareWorkout}</p>
                <p className="text-[10px] font-bold text-[#ccff00]">{vocab.shareWorkoutDesc}</p>
              </div>
            </div>
            {shares.workout === todayDate ? (
               <CheckCircle2 size={20} className="text-[#ccff00]" />
            ) : (
              <span className="text-xs font-bold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Share2 size={12}/> {vocab.btnShare}
              </span>
            )}
          </button>

          {/* DIÈTE / NUTRITION (Nouveau) */}
          <button 
            disabled={shares.diet === todayDate}
            onClick={() => handleShare('diet', 10, generateDietText)} 
            className="w-full bg-slate-800 border border-slate-700 p-4 rounded-2xl flex items-center justify-between hover:border-slate-500 transition-colors text-left group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <div className="bg-orange-500/20 p-2 rounded-xl text-orange-400"><UtensilsCrossed size={20} /></div>
              <div>
                <p className="text-sm font-bold text-white">{vocab.shareDiet}</p>
                <p className="text-[10px] font-bold text-[#ccff00]">{vocab.shareDietDesc}</p>
              </div>
            </div>
            {shares.diet === todayDate ? (
               <CheckCircle2 size={20} className="text-[#ccff00]" />
            ) : (
              <span className="text-xs font-bold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Share2 size={12}/> {vocab.btnShare}
              </span>
            )}
          </button>

          {/* HABITUDES / BIOHACKING */}
          <button 
            disabled={shares.habits === todayDate}
            onClick={() => handleShare('habits', 10, generateHabitsText)} 
            className="w-full bg-slate-800 border border-slate-700 p-4 rounded-2xl flex items-center justify-between hover:border-slate-500 transition-colors text-left group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-xl text-blue-400"><Activity size={20} /></div>
              <div>
                <p className="text-sm font-bold text-white">{vocab.shareHabits}</p>
                <p className="text-[10px] font-bold text-[#ccff00]">{vocab.shareHabitsDesc}</p>
              </div>
            </div>
            {shares.habits === todayDate ? (
               <CheckCircle2 size={20} className="text-[#ccff00]" />
            ) : (
              <span className="text-xs font-bold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Share2 size={12}/> {vocab.btnShare}
              </span>
            )}
          </button>

        </div>
      </div>

    </div>
  );
};

export default Reward;
