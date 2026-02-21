import React, { useState, useEffect } from 'react';
import { Gift, ShoppingBag, Share2, Camera, Tag, CheckCircle2, AlertCircle } from 'lucide-react';

const Reward = ({ t, xp, setXp }) => {
  const isFr = t.month === 'mois';

  const vocab = {
    title: isFr ? 'Grindwear Rewards' : 'Grindwear Rewards',
    desc: isFr ? 'Transforme ta discipline en vêtements exclusifs.' : 'Turn your discipline into exclusive gear.',
    currXp: isFr ? 'XP Actuel' : 'Current XP',
    tier25: '25$ Gift Card',
    tier50: '50$ Gift Card',
    tier75: '75$ Gift Card',
    tier100: '100$ Gift Card',
    locked: isFr ? 'Bloqué' : 'Locked',
    claim: isFr ? 'Réclamer' : 'Claim',
    
    waysToEarn: isFr ? 'Comment gagner des XP ?' : 'How to earn XP?',
    
    actionShareTitle: isFr ? 'Partager l\'App' : 'Share the App',
    actionShareDesc: isFr ? '+50 XP (1x par jour)' : '+50 XP (1x per day)',
    actionShareBtn: isFr ? 'Partager' : 'Share',
    
    actionOrderTitle: isFr ? 'Vérifier une Commande' : 'Verify an Order',
    actionOrderDesc: isFr ? '+1000 XP (Achat Grindwear)' : '+1000 XP (Grindwear purchase)',
    actionOrderBtn: isFr ? 'Ajouter Numéro' : 'Add Order #',
    
    actionIgTitle: isFr ? 'Tag nous sur Instagram' : 'Tag us on Instagram',
    actionIgDesc: isFr ? '+500 XP (Photo en Grindwear)' : '+500 XP (Pic wearing Grindwear)',
    actionIgBtn: isFr ? 'Soumettre le @' : 'Submit Handle',

    successOrder: isFr ? 'Commande ajoutée !' : 'Order added!',
    successIg: isFr ? 'En attente de vérification' : 'Pending verification',
    alreadyShared: isFr ? 'Déjà partagé aujourd\'hui' : 'Already shared today'
  };

  // --- LOGIQUE ANTI-SCAM ---
  const [lastShared, setLastShared] = useState(() => localStorage.getItem('pos_last_shared') || null);
  const [claimedOrders, setClaimedOrders] = useState(() => JSON.parse(localStorage.getItem('pos_orders') || '[]'));
  const [pendingIg, setPendingIg] = useState(() => localStorage.getItem('pos_pending_ig') || null);

  useEffect(() => localStorage.setItem('pos_orders', JSON.stringify(claimedOrders)), [claimedOrders]);

  const handleShare = async () => {
    const today = new Date().toDateString();
    if (lastShared === today) {
      alert(vocab.alreadyShared);
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Grindup.pro',
          text: isFr ? 'Découvre Grindup.pro et Grindwear !' : 'Check out Grindup.pro and Grindwear!',
          url: window.location.href,
        });
        // Si le partage réussit :
        setXp(prev => prev + 50);
        setLastShared(today);
        localStorage.setItem('pos_last_shared', today);
      } else {
        // Fallback si le tel ne supporte pas le partage natif
        navigator.clipboard.writeText(window.location.href);
        alert(isFr ? "Lien copié dans le presse-papier !" : "Link copied to clipboard!");
        setXp(prev => prev + 50);
        setLastShared(today);
        localStorage.setItem('pos_last_shared', today);
      }
    } catch (err) {
      console.log("Partage annulé");
    }
  };

  const handleOrder = () => {
    const orderNum = prompt(isFr ? 'Numéro de commande Shopify (ex: #1024) :' : 'Shopify Order Number (e.g. #1024):');
    if (!orderNum) return;
    
    if (claimedOrders.includes(orderNum)) {
      alert(isFr ? 'Cette commande a déjà été utilisée.' : 'This order has already been used.');
      return;
    }

    setClaimedOrders([...claimedOrders, orderNum]);
    setXp(prev => prev + 1000);
    alert(vocab.successOrder);
  };

  const handleIg = () => {
    if (pendingIg) {
      alert(isFr ? `Ton compte ${pendingIg} est en cours de vérification par notre équipe.` : `Your handle ${pendingIg} is pending review by our team.`);
      return;
    }

    const handle = prompt(isFr ? 'Quel est ton @Instagram ?' : 'What is your @Instagram handle?');
    if (!handle) return;

    setPendingIg(handle);
    localStorage.setItem('pos_pending_ig', handle);
    alert(vocab.successIg);
  };

  const handleClaim = (amount) => {
    // Ici, plus tard, ça pourrait envoyer un email automatique ou afficher un code promo
    alert(isFr 
      ? `Félicitations ! Fais un screenshot de cet écran et envoie-le nous sur Instagram pour recevoir ton code promo de ${amount}$.` 
      : `Congrats! Take a screenshot of this and send it to our Instagram to get your $${amount} promo code.`
    );
  };

  // Paliers
  const tiers = [
    { name: vocab.tier25, cost: 2500, value: 25 },
    { name: vocab.tier50, cost: 5000, value: 50 },
    { name: vocab.tier75, cost: 7500, value: 75 },
    { name: vocab.tier100, cost: 10000, value: 100 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-10">
      
      {/* HEADER */}
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
            <div key={tier.cost} className={`p-4 rounded-2xl border transition-all ${isUnlocked ? 'bg-slate-800 border-[#ccff00]' : 'bg-slate-800/40 border-slate-700/50'}`}>
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

      {/* MISSIONS POUR GAGNER DES POINTS */}
      <div>
        <h3 className="text-sm font-black text-white mb-3 pl-2 uppercase tracking-wider">{vocab.waysToEarn}</h3>
        
        <div className="space-y-2">
          {/* Action : SHARE */}
          <button onClick={handleShare} className="w-full bg-slate-800 border border-slate-700 p-4 rounded-2xl flex items-center justify-between hover:border-slate-500 transition-colors text-left group">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-xl text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors"><Share2 size={20} /></div>
              <div>
                <p className="text-sm font-bold text-white">{vocab.actionShareTitle}</p>
                <p className="text-[10px] font-bold text-[#ccff00]">{vocab.actionShareDesc}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg">{vocab.actionShareBtn}</span>
          </button>

          {/* Action : ORDER NUMBER */}
          <button onClick={handleOrder} className="w-full bg-slate-800 border border-slate-700 p-4 rounded-2xl flex items-center justify-between hover:border-slate-500 transition-colors text-left group">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors"><Tag size={20} /></div>
              <div>
                <p className="text-sm font-bold text-white">{vocab.actionOrderTitle}</p>
                <p className="text-[10px] font-bold text-[#ccff00]">{vocab.actionOrderDesc}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg">{vocab.actionOrderBtn}</span>
          </button>

          {/* Action : INSTAGRAM */}
          <button onClick={handleIg} className="w-full bg-slate-800 border border-slate-700 p-4 rounded-2xl flex items-center justify-between hover:border-slate-500 transition-colors text-left group">
            <div className="flex items-center gap-3">
              <div className="bg-pink-500/20 p-2 rounded-xl text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-colors"><Camera size={20} /></div>
              <div>
                <p className="text-sm font-bold text-white">{vocab.actionIgTitle}</p>
                <p className="text-[10px] font-bold text-[#ccff00]">{vocab.actionIgDesc}</p>
              </div>
            </div>
            {pendingIg ? (
              <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2 py-1.5 rounded-lg flex items-center gap-1">
                <AlertCircle size={12}/> Pending
              </span>
            ) : (
              <span className="text-xs font-bold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg">{vocab.actionIgBtn}</span>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};

export default Reward;
