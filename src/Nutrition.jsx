import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Trash2, Flame, RotateCcw, Settings, Target, Zap, Bot, Loader2, Camera, X, ArrowLeft, Calculator, User, Activity, Barcode, ScanLine } from 'lucide-react';

const DB = {
  'poulet': { k: 165, p: 31, c: 0, f: 3.6, u: '100g' },
  'dinde': { k: 135, p: 30, c: 0, f: 1, u: '100g' },
  'boeuf': { k: 250, p: 26, c: 0, f: 15, u: '100g' },
  'riz': { k: 130, p: 2.7, c: 28, f: 0.3, u: '100g' },
  'pates': { k: 131, p: 5, c: 25, f: 1, u: '100g' },
  'patate douce': { k: 86, p: 1.6, c: 20, f: 0.1, u: '100g' },
  'avoine': { k: 380, p: 13, c: 60, f: 7, u: '100g' },
  'whey': { k: 120, p: 24, c: 2, f: 1, u: '1 scoop' },
  'oeuf': { k: 70, p: 6, c: 0.6, f: 5, u: '1 unité' },
  'banane': { k: 90, p: 1, c: 23, f: 0.3, u: '1 unité' },
  'skyr': { k: 60, p: 10, c: 4, f: 0, u: '100g' },
  'amandes': { k: 580, p: 21, c: 22, f: 50, u: '100g' },
  'huile': { k: 90, p: 0, c: 0, f: 10, u: '1 c.à.s' },
  'avocat': { k: 160, p: 2, c: 9, f: 15, u: '100g' }
};

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// ─── Composant Scanner ZXing (rapide, précis, industriel) ────────────────────
const BarcodeScanner = ({ onDetected, onClose, isFr }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const readerRef = useRef(null);
  const detectedRef = useRef(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadZxing = () => new Promise((resolve, reject) => {
      if (window.ZXing) return resolve();
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/@zxing/library@0.19.1/umd/index.min.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });

    const start = async () => {
      try {
        await loadZxing();
        if (cancelled) return;

        const hints = new Map();
        // Formats courants pour les aliments (EAN-13, UPC-A, EAN-8, UPC-E, DataMatrix, QR)
        hints.set(window.ZXing.DecodeHintType.POSSIBLE_FORMATS, [
          window.ZXing.BarcodeFormat.EAN_13,
          window.ZXing.BarcodeFormat.UPC_A,
          window.ZXing.BarcodeFormat.EAN_8,
          window.ZXing.BarcodeFormat.UPC_E,
          window.ZXing.BarcodeFormat.DATA_MATRIX,
          window.ZXing.BarcodeFormat.QR_CODE,
          window.ZXing.BarcodeFormat.CODE_128,
        ]);
        hints.set(window.ZXing.DecodeHintType.TRY_HARDER, true);

        const reader = new window.ZXing.BrowserMultiFormatReader(hints, 200);
        readerRef.current = reader;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setLoading(false);
        }

        // Boucle de décodage rapide avec requestAnimationFrame
        const decode = async () => {
          if (cancelled || detectedRef.current || !videoRef.current) return;
          try {
            const result = await reader.decodeOnce(videoRef.current);
            if (!cancelled && !detectedRef.current && result?.getText()) {
              detectedRef.current = true;
              stopAll();
              onDetected(result.getText());
            }
          } catch (e) {
            // Pas de code détecté ce frame, on réessaie
            if (!cancelled && !detectedRef.current) {
              setTimeout(decode, 150);
            }
          }
        };
        decode();

        // Hint "bouge légèrement" après 5s si rien trouvé
        setTimeout(() => { if (!detectedRef.current && !cancelled) setHint(true); }, 5000);

      } catch (e) {
        if (!cancelled) {
          if (e.name === 'NotAllowedError') setError(isFr ? 'Permission caméra refusée.' : 'Camera permission denied.');
          else setError(isFr ? 'Impossible d\'accéder à la caméra.' : 'Cannot access camera.');
          setLoading(false);
        }
      }
    };

    start();
    return () => { cancelled = true; stopAll(); };
  }, []);

  const stopAll = () => {
    if (readerRef.current) { try { readerRef.current.reset(); } catch {} readerRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col animate-in fade-in duration-200">
      {/* Vidéo plein écran */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        muted playsInline autoPlay
      />

      {/* Overlay sombre sur les bords */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-black/50" />
        {/* Fenêtre transparente au centre */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-72 h-28 bg-transparent rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]" />
        </div>
      </div>

      {/* Cadre de scan animé */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-28 relative">
          {/* Coins */}
          {[['top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-xl'],
            ['top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-xl'],
            ['bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-xl'],
            ['bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-xl']
          ].map(([cls], i) => (
            <div key={i} className={`absolute w-7 h-7 border-[#ccff00] ${cls}`} />
          ))}
          {/* Laser */}
          <div className="absolute left-2 right-2 h-[2px] bg-[#ccff00] shadow-[0_0_8px_2px_rgba(204,255,0,0.7)]"
            style={{ animation: 'laserScan 1.8s ease-in-out infinite', top: '50%' }} />
        </div>
      </div>

      {/* Loading spinner */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="text-center">
            <Loader2 className="animate-spin text-[#ccff00] mx-auto mb-3" size={40} />
            <p className="text-white font-bold text-sm">{isFr ? 'Activation caméra...' : 'Starting camera...'}</p>
          </div>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10 p-6">
          <div className="text-center">
            <Camera size={48} className="text-red-400 mx-auto mb-4" />
            <p className="text-red-400 font-black text-base mb-2">{error}</p>
            <p className="text-slate-400 text-sm">{isFr ? 'Vérifie les permissions de ton navigateur.' : 'Check your browser permissions.'}</p>
          </div>
        </div>
      )}

      {/* UI du bas */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
        {hint && (
          <p className="text-center text-[#ccff00] text-xs font-bold mb-3 animate-pulse">
            {isFr ? '💡 Bouge légèrement le cell ou ajuste la distance' : '💡 Move phone slightly or adjust distance'}
          </p>
        )}
        <p className="text-center text-white/60 text-xs mb-4">
          {isFr ? 'Place le code-barres dans le cadre' : 'Align barcode within the frame'}
        </p>
        <button
          onClick={() => { stopAll(); onClose(); }}
          className="w-full bg-slate-800/90 border border-slate-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 backdrop-blur-sm"
        >
          <X size={18} /> {isFr ? 'Annuler' : 'Cancel'}
        </button>
      </div>

      <style>{`
        @keyframes laserScan {
          0%   { transform: translateY(-28px); opacity: 1; }
          50%  { transform: translateY(28px);  opacity: 0.9; }
          100% { transform: translateY(-28px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// ─── Composant principal Nutrition ───────────────────────────────────────────
const Nutrition = ({ t }) => {
  const isFr = useMemo(() => {
    if (!t) return true;
    const str = JSON.stringify(t).toLowerCase();
    if (str.includes('entraînement') || str.includes('diète') || str.includes('paramètres') || str.includes('accueil') || str.includes('jour')) return true;
    return false;
  }, [t]);

  const vocab = useMemo(() => ({
    title: isFr ? 'Diète' : 'Diet',
    clearAll: isFr ? 'Effacer la journée ?' : 'Clear today?',
    setGoalsTitle: isFr ? 'Ajuster mes objectifs' : 'Adjust goals',
    namePlaceholder: isFr ? 'Ex: Riz' : 'Ex: Rice',
    qtyPlaceholder: isFr ? 'Qté' : 'Qty',
    emptyState: isFr ? 'Aucun repas ce jour-là. Ajoute ton premier plat.' : 'No meals for this day. Add a dish.',
    days: isFr ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    setupTitle: isFr ? 'Configuration Diète' : 'Diet Setup',
    btnCalc: isFr ? 'Calculateur IA' : 'AI Calculator',
    btnManual: isFr ? 'Entrée Manuelle' : 'Manual Entry',
    aiCoachTitle: isFr ? 'Photo ou Description :' : 'Photo or Description:',
    aiCoachPlaceholder: isFr ? 'ex: 2 cuillères de nutella...' : 'e.g. 2 spoons of nutella...',
    aiBtnScan: isFr ? 'Scanner le repas' : 'Scan Meal',
    aiLoading: isFr ? 'Analyse en cours...' : 'Analyzing...',
    aiClose: isFr ? 'Fermer IA' : 'Close AI',
    aiOpen: isFr ? 'Scanner repas avec IA ✨' : 'Scan meal with AI ✨',
    saveBtn: isFr ? 'Enregistrer' : 'Save Goals',
    calories: isFr ? 'Calories' : 'Calories',
    protein: isFr ? 'Protéines (g)' : 'Protein (g)',
    carbs: isFr ? 'Glucides (g)' : 'Carbs (g)',
    fat: isFr ? 'Lipides (g)' : 'Fat (g)',
    calcTitle: isFr ? 'Calcul des Macros' : 'Macro Calculation',
    back: isFr ? 'Retour' : 'Back',
    sex: isFr ? 'Sexe' : 'Sex', male: isFr ? 'Homme' : 'Male', female: isFr ? 'Femme' : 'Female',
    age: isFr ? 'Âge' : 'Age', weight: isFr ? 'Poids (kg)' : 'Weight (kg)', height: isFr ? 'Taille (cm)' : 'Height (cm)',
    job: isFr ? 'Activité de tous les jours' : 'Daily Activity',
    job1: isFr ? 'Sédentaire (Bureau, Assis)' : 'Sedentary (Desk job)',
    job2: isFr ? 'Léger (Debout, Marche)' : 'Light (Standing, Walking)',
    job3: isFr ? 'Très Actif (Travail physique)' : 'Very Active (Physical job)',
    sport: isFr ? 'Entraînements / Semaine' : 'Workouts / Week',
    goal: isFr ? 'Objectif' : 'Goal',
    goal1: isFr ? 'Perte de gras (Cut)' : 'Lose Fat (Cut)',
    goal2: isFr ? 'Maintien' : 'Maintain',
    goal3: isFr ? 'Prise de masse (Bulk)' : 'Build Muscle (Bulk)',
    calcBtnText: isFr ? 'Générer mon programme' : 'Generate my plan',
    // ── Nouveaux pour le scanner ──
    scanBtn: isFr ? 'Scanner' : 'Scan',
    scanLoading: isFr ? 'Recherche produit...' : 'Looking up product...',
    scanSuccess: isFr ? 'Produit trouvé ✅' : 'Product found ✅',
    scanNotFound: isFr ? '❌ Produit introuvable. Ajoute manuellement.' : '❌ Product not found. Add manually.',
    scanError: isFr ? 'Erreur de connexion.' : 'Connection error.',
    scanCode: isFr ? 'Code détecté :' : 'Code detected:',
  }), [isFr]);

  const getTodayIndex = () => { let day = new Date().getDay(); return day === 0 ? 6 : day - 1; };

  const [setupState, setSetupState] = useState(() => localStorage.getItem('pos_nutri_setup') || 'none');
  const [setupMode, setSetupMode] = useState('menu');
  const [goals, setGoals] = useState(() => JSON.parse(localStorage.getItem('pos_nutri_goals')) || null);
  const [activeDay, setActiveDay] = useState(getTodayIndex());
  const [weeklyFoods, setWeeklyFoods] = useState(() => JSON.parse(localStorage.getItem('pos_nutri_weekly_v4')) || { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] });
  const [showSettings, setShowSettings] = useState(false);
  const [timeStr, setTimeStr] = useState(`${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`);
  const [totals, setTotals] = useState({ k: 0, p: 0, c: 0, f: 0 });
  const [form, setForm] = useState({ name: '', qty: '', k: '', p: '', c: '', f: '' });
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const fileInputRef = useRef(null);
  const [calcData, setCalcData] = useState({ sex: 'M', age: '', weight: '', height: '', job: '1.2', sport: '0', goal: 'cut' });

  // ── Scanner states ──
  const [showScanner, setShowScanner] = useState(false);
  const [scanStatus, setScanStatus] = useState(null); // null | 'loading' | 'success' | 'notfound' | 'error'
  const [scannedCode, setScannedCode] = useState(null);
  // Modal quantité après scan
  const [scannedProduct, setScannedProduct] = useState(null); // { name, k100, p100, c100, f100 }
  const [scanQty, setScanQty] = useState('100');

  useEffect(() => localStorage.setItem('pos_nutri_weekly_v4', JSON.stringify(weeklyFoods)), [weeklyFoods]);
  useEffect(() => { if (goals) localStorage.setItem('pos_nutri_goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => localStorage.setItem('pos_nutri_setup', setupState), [setupState]);

  useEffect(() => {
    const dayFoods = weeklyFoods[activeDay] || [];
    const tTotal = dayFoods.reduce((acc, item) => ({
      k: acc.k + (Number(item.k) || 0), p: acc.p + (Number(item.p) || 0),
      c: acc.c + (Number(item.c) || 0), f: acc.f + (Number(item.f) || 0),
    }), { k: 0, p: 0, c: 0, f: 0 });
    setTotals(tTotal);
  }, [weeklyFoods, activeDay]);

  // ── Handler Open Food Facts ──────────────────────────────────────────────
  const handleBarcodeDetected = async (barcode) => {
    setShowScanner(false);
    const cleanBarcode = barcode.trim().replace(/[^0-9]/g, '');
    setScannedCode(cleanBarcode);
    setScanStatus('loading');

    const urls = [
      `https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}?fields=product_name,product_name_fr,product_name_en,brands,serving_size,serving_quantity,nutriments`,
      `https://world.openfoodfacts.org/api/v0/product/${cleanBarcode}.json`,
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, { headers: { 'User-Agent': 'GrindupPro/1.0' } });
        if (!res.ok) continue;
        const data = await res.json();
        if (data.status !== 1 || !data.product) continue;

        const p = data.product;
        const n = p.nutriments || {};

        // ── Toujours utiliser les valeurs _100g (jamais _serving qui varie) ──
        const get100 = (key) => {
          // Priorité : key_100g → key-100g → key (fallback)
          const v = n[`${key}_100g`] ?? n[`${key}-100g`] ?? null;
          return v !== null ? Number(Number(v).toFixed(2)) : null;
        };

        // ── Calories : toujours en kcal ──
        let kcal100 = get100('energy-kcal');
        if (kcal100 === null || kcal100 === 0) {
          // Essayer energy-kj_100g puis energy_100g et convertir
          const kj = get100('energy-kj') ?? get100('energy');
          if (kj && kj > 0) kcal100 = Number((kj / 4.184).toFixed(1));
          else kcal100 = 0;
        }

        const proteins100 = get100('proteins') ?? 0;
        const carbs100    = get100('carbohydrates') ?? 0;
        const fat100      = get100('fat') ?? 0;

        // ── Nom du produit ──
        const productName =
          p.product_name_fr ||
          p.product_name_en ||
          p.product_name    ||
          p.generic_name_fr ||
          p.generic_name    ||
          (isFr ? 'Produit scanné' : 'Scanned product');

        // ── Portion : extraire les grammes si disponible ──
        let servingGrams = null;
        const servingQty = p.serving_quantity; // champ numérique direct si dispo
        if (servingQty && Number(servingQty) > 0) {
          servingGrams = String(Math.round(Number(servingQty)));
        } else if (p.serving_size) {
          const match = p.serving_size.match(/(\d+(?:[.,]\d+)?)\s*g/i);
          if (match) servingGrams = String(Math.round(Number(match[1].replace(',', '.'))));
        }

        setScannedProduct({
          name: productName,
          brand: p.brands || '',
          k100: kcal100,
          p100: proteins100,
          c100: carbs100,
          f100: fat100,
          servingSize: servingGrams,
          rawBarcode: cleanBarcode,
        });
        setScanQty(servingGrams || '100');
        setScanStatus(null);
        setScannedCode(null);
        return;

      } catch (e) {
        continue;
      }
    }

    setScanStatus('notfound');
    setTimeout(() => { setScanStatus(null); setScannedCode(null); }, 4000);
  };

  // ── Confirmer ajout avec quantité choisie ──────────────────────────────
  const confirmScannedProduct = () => {
    if (!scannedProduct) return;
    const qty = parseFloat(scanQty) || 100;
    const ratio = qty / 100;
    const newFood = {
      id: Date.now(),
      time: timeStr,
      name: `${scannedProduct.name} (${qty}g) 📷`,
      k: Math.round(scannedProduct.k100 * ratio),
      p: Math.round(scannedProduct.p100 * ratio),
      c: Math.round(scannedProduct.c100 * ratio),
      f: Math.round(scannedProduct.f100 * ratio),
    };
    setWeeklyFoods(prev => ({
      ...prev,
      [activeDay]: [...prev[activeDay], newFood].sort((a, b) => a.time.localeCompare(b.time))
    }));
    setScannedProduct(null);
  };

  // ── Fonctions existantes ─────────────────────────────────────────────────
  const processMacroCalculation = () => {
    if (!calcData.age || !calcData.weight || !calcData.height) return alert(isFr ? "Veuillez remplir tous les champs." : "Please fill all fields.");
    let bmr = 0;
    const w = parseFloat(calcData.weight), h = parseFloat(calcData.height), a = parseInt(calcData.age);
    if (calcData.sex === 'M') bmr = (10 * w) + (6.25 * h) - (5 * a) + 5;
    else bmr = (10 * w) + (6.25 * h) - (5 * a) - 161;
    let activityMultiplier = parseFloat(calcData.job);
    const sportLvl = parseInt(calcData.sport);
    if (sportLvl === 1) activityMultiplier += 0.15;
    else if (sportLvl === 2) activityMultiplier += 0.35;
    else if (sportLvl === 3) activityMultiplier += 0.50;
    let tdee = bmr * activityMultiplier;
    let targetCals = tdee;
    let pRatio, cRatio, fRatio;
    if (calcData.goal === 'cut') { targetCals -= 500; pRatio = 0.35; cRatio = 0.40; fRatio = 0.25; }
    else if (calcData.goal === 'bulk') { targetCals += 300; pRatio = 0.25; cRatio = 0.50; fRatio = 0.25; }
    else { pRatio = 0.30; cRatio = 0.45; fRatio = 0.25; }
    setGoals({ calories: Math.round(targetCals), protein: Math.round((targetCals * pRatio) / 4), carbs: Math.round((targetCals * cRatio) / 4), fat: Math.round((targetCals * fRatio) / 9) });
    setSetupState('done');
  };

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 800;
      const scaleSize = MAX_WIDTH / img.width;
      canvas.width = MAX_WIDTH;
      canvas.height = img.height * scaleSize;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setImageBase64(canvas.toDataURL('image/jpeg', 0.7).split(',')[1]);
    };
    img.src = previewUrl;
  };

  const removeImage = () => { setImagePreview(null); setImageBase64(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const handleAIAnalyze = async () => {
    if (!aiInput.trim() && !imageBase64) return;
    setIsAiLoading(true);
    try {
      const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
      const modelsData = await modelsRes.json();
      const validModel = modelsData.models.find(m => m.name.includes('1.5-flash')) || modelsData.models[0];
      let promptText = `Act as a nutrition expert. Analyze this: "${aiInput}". Estimate macros. Return ONLY JSON: {"name": "Food Name", "k": calories, "p": protein, "c": carbs, "f": fat}. Use English for name.`;
      if (isFr) promptText = `Agis en expert nutrition. Analyse ceci: "${aiInput}". Estime les macros. Retourne UNIQUEMENT du JSON: {"name": "Nom", "k": calories, "p": proteines, "c": glucides, "f": lipides}. Utilise le Français pour le nom.`;
      const promptParts = [{ text: promptText }];
      if (imageBase64) promptParts.push({ inlineData: { mimeType: "image/jpeg", data: imageBase64 } });
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${validModel.name}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: promptParts }] })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      let rawText = data.candidates[0].content.parts[0].text;
      const cleanJson = rawText.substring(rawText.indexOf('{'), rawText.lastIndexOf('}') + 1);
      const parsed = JSON.parse(cleanJson);
      const newFood = { id: Date.now(), time: timeStr, name: parsed.name + (imageBase64 ? " 📸" : " 🤖"), k: Number(parsed.k), p: Number(parsed.p), c: Number(parsed.c), f: Number(parsed.f) };
      setWeeklyFoods(prev => ({ ...prev, [activeDay]: [...prev[activeDay], newFood].sort((a, b) => a.time.localeCompare(b.time)) }));
      setAiInput(''); removeImage(); setShowAIPanel(false);
    } catch (e) { alert("Erreur IA: " + e.message); } finally { setIsAiLoading(false); }
  };

  const handleAutoCalc = (newName, newQty) => {
    setForm(prev => ({ ...prev, name: newName, qty: newQty }));
    const matchKey = Object.keys(DB).find(key => newName.toLowerCase().includes(key));
    const parsedQty = parseFloat(newQty);
    if (matchKey && parsedQty > 0) {
      const data = DB[matchKey];
      const ratio = data.u.includes('100g') ? parsedQty / 100 : parsedQty;
      setForm(prev => ({ ...prev, k: Math.round(data.k * ratio), p: Math.round(data.p * ratio), c: Math.round(data.c * ratio), f: Math.round(data.f * ratio) }));
    }
  };

  const finalizeAddEntry = () => {
    if (!form.name) return;
    const finalName = form.name.charAt(0).toUpperCase() + form.name.slice(1) + (form.qty ? ` (${form.qty})` : '');
    const newFood = { id: Date.now(), time: timeStr, name: finalName, k: Number(form.k) || 0, p: Number(form.p) || 0, c: Number(form.c) || 0, f: Number(form.f) || 0 };
    setWeeklyFoods(prev => ({ ...prev, [activeDay]: [...prev[activeDay], newFood].sort((a, b) => a.time.localeCompare(b.time)) }));
    setForm({ name: '', qty: '', k: '', p: '', c: '', f: '' });
  };

  const getPercent = (current, max) => Math.min(100, Math.round((current / (max || 1)) * 100));

  // ── Setup screens (inchangés) ─────────────────────────────────────────────
  if (setupState === 'none') {
    if (setupMode === 'menu') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-in zoom-in duration-300 px-4">
          <div className="bg-[#ccff00]/10 p-6 rounded-full border border-[#ccff00]/30 shadow-[0_0_30px_rgba(204,255,0,0.15)]"><Target size={64} className="text-[#ccff00]" /></div>
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">{vocab.setupTitle}</h2>
            <p className="text-slate-400 text-sm max-w-[250px] mx-auto">{isFr ? "Configure tes macros pour commencer ton suivi." : "Configure your macros to start tracking."}</p>
          </div>
          <div className="w-full space-y-3 max-w-sm">
            <button onClick={() => setSetupMode('calc')} className="w-full bg-[#ccff00] text-black font-black py-4 rounded-2xl flex justify-center items-center gap-2 shadow-lg hover:scale-[1.02] transition-transform"><Calculator size={20}/> {vocab.btnCalc}</button>
            <button onClick={() => { setGoals({ calories: 2000, protein: 150, carbs: 200, fat: 60 }); setSetupState('done'); }} className="w-full bg-slate-800/80 backdrop-blur-sm text-white font-bold py-4 rounded-2xl border border-slate-700 hover:bg-slate-700 transition-colors">{vocab.btnManual}</button>
          </div>
        </div>
      );
    }
    if (setupMode === 'calc') {
      return (
        <div className="max-w-md mx-auto min-h-[80vh] pb-24 animate-in slide-in-from-right duration-300">
          <button onClick={() => setSetupMode('menu')} className="text-slate-400 flex items-center gap-2 mb-6 hover:text-white transition-colors"><ArrowLeft size={18} /> {vocab.back}</button>
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2"><Calculator className="text-[#ccff00]"/> {vocab.calcTitle}</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{vocab.sex}</label>
              <div className="flex gap-3">
                <button onClick={() => setCalcData({...calcData, sex: 'M'})} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${calcData.sex === 'M' ? 'bg-blue-500 text-white shadow-lg border-2 border-blue-400' : 'bg-slate-800 text-slate-400 border-2 border-slate-800'}`}><User size={18}/> {vocab.male}</button>
                <button onClick={() => setCalcData({...calcData, sex: 'F'})} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${calcData.sex === 'F' ? 'bg-pink-500 text-white shadow-lg border-2 border-pink-400' : 'bg-slate-800 text-slate-400 border-2 border-slate-800'}`}><User size={18}/> {vocab.female}</button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{label: vocab.age, key: 'age', ph: '25'}, {label: vocab.weight, key: 'weight', ph: '75'}, {label: vocab.height, key: 'height', ph: '175'}].map(f => (
                <div key={f.key} className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{f.label}</label>
                  <input type="number" value={calcData[f.key]} onChange={e => setCalcData({...calcData, [f.key]: e.target.value})} placeholder={`Ex: ${f.ph}`} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-white font-black text-center outline-none focus:border-[#ccff00]" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{vocab.job}</label>
              <select value={calcData.job} onChange={e => setCalcData({...calcData, job: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-[#ccff00] appearance-none">
                <option value="1.2">{vocab.job1}</option><option value="1.375">{vocab.job2}</option><option value="1.55">{vocab.job3}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{vocab.sport}</label>
              <div className="grid grid-cols-4 gap-2">
                {[{v: '0', l: '0'}, {v: '1', l: '1-2'}, {v: '2', l: '3-5'}, {v: '3', l: '6+'}].map(opt => (
                  <button key={opt.v} onClick={() => setCalcData({...calcData, sport: opt.v})} className={`py-3 rounded-xl font-bold transition-colors ${calcData.sport === opt.v ? 'bg-[#ccff00] text-black shadow-md' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>{opt.l}</button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{vocab.goal}</label>
              <div className="flex flex-col gap-2">
                {[{v:'cut',l:vocab.goal1,c:'text-orange-500 border-orange-500/50'},{v:'maintain',l:vocab.goal2,c:'text-blue-500 border-blue-500/50'},{v:'bulk',l:vocab.goal3,c:'text-purple-500 border-purple-500/50'}].map(opt => (
                  <button key={opt.v} onClick={() => setCalcData({...calcData, goal: opt.v})} className={`py-3 px-4 rounded-xl font-bold text-left flex justify-between items-center transition-all ${calcData.goal === opt.v ? `bg-slate-800 border-2 ${opt.c}` : 'bg-slate-800/50 border-2 border-transparent text-slate-400'}`}>
                    <span className={calcData.goal === opt.v ? opt.c.split(' ')[0] : ''}>{opt.l}</span>
                    {calcData.goal === opt.v && <Zap size={18} className={opt.c.split(' ')[0]} />}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={processMacroCalculation} className="w-full mt-8 bg-gradient-to-r from-[#ccff00] to-[#a3cc00] text-black font-black py-4 rounded-2xl flex justify-center items-center gap-2 shadow-xl hover:scale-[1.02] transition-transform">
              <Target size={20} /> {vocab.calcBtnText}
            </button>
          </div>
        </div>
      );
    }
  }

  // ── Dashboard principal ───────────────────────────────────────────────────
  return (
    <div className="space-y-4 pb-64 animate-in fade-in duration-300">

      {/* Scanner overlay */}
      {showScanner && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setShowScanner(false)}
          isFr={isFr}
        />
      )}

      {/* ✅ MODAL QUANTITÉ après scan réussi */}
      {scannedProduct && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-end justify-center animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border-t border-slate-700 rounded-t-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            
            {/* Header produit */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-[#ccff00] bg-[#ccff00]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">📷 Open Food Facts</span>
                </div>
                <h3 className="text-white font-black text-lg leading-tight">{scannedProduct.name}</h3>
                {scannedProduct.brand && <p className="text-slate-500 text-xs mt-0.5">{scannedProduct.brand}</p>}
              </div>
              <button onClick={() => setScannedProduct(null)} className="ml-3 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white border border-slate-700">
                <X size={18} />
              </button>
            </div>

            {/* Macros /100g */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 mb-5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">{isFr ? 'Valeurs nutritionnelles / 100g' : 'Nutrition facts / 100g'}</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { l: isFr ? 'Kcal' : 'Kcal', v: scannedProduct.k100, c: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
                  { l: isFr ? 'Prot.' : 'Prot.', v: `${scannedProduct.p100}g`, c: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                  { l: isFr ? 'Gluc.' : 'Carbs', v: `${scannedProduct.c100}g`, c: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                  { l: isFr ? 'Lip.' : 'Fat', v: `${scannedProduct.f100}g`, c: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
                ].map((s, i) => (
                  <div key={i} className={`flex flex-col items-center py-2 px-1 rounded-xl border ${s.bg}`}>
                    <span className={`text-base font-black ${s.c}`}>{s.v}</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">{s.l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sélecteur quantité */}
            <div className="mb-5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                {isFr ? 'Quelle quantité vas-tu manger ?' : 'How much are you eating?'}
              </label>

              {/* Boutons rapides */}
              <div className="flex gap-2 mb-3">
                {(scannedProduct.servingSize
                  ? [scannedProduct.servingSize.replace(/[^0-9.]/g, '') || '30', '50', '100', '150']
                  : ['30', '50', '100', '150']
                ).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setScanQty(String(q))}
                    className={`flex-1 py-2 rounded-xl font-black text-xs transition-all ${
                      String(scanQty) === String(q)
                        ? 'bg-[#ccff00] text-black shadow-md'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-[#ccff00]/50'
                    }`}
                  >
                    {q}g
                    {i === 0 && scannedProduct.servingSize && (
                      <span className="block text-[8px] opacity-60">{isFr ? 'portion' : 'serving'}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Input custom */}
              <div className="relative">
                <input
                  type="number"
                  value={scanQty}
                  onChange={e => setScanQty(e.target.value)}
                  className="w-full bg-slate-800 border-2 border-slate-700 focus:border-[#ccff00] rounded-xl px-4 py-3 text-white font-black text-center text-xl outline-none transition-colors"
                  min="1"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">g</span>
              </div>
            </div>

            {/* Preview macros calculées */}
            {scanQty && parseFloat(scanQty) > 0 && (
              <div className="bg-[#ccff00]/5 border border-[#ccff00]/20 rounded-2xl p-3 mb-5">
                <p className="text-[10px] font-bold text-[#ccff00]/70 uppercase tracking-wider mb-2">
                  {isFr ? `Pour ${scanQty}g :` : `For ${scanQty}g:`}
                </p>
                <div className="flex gap-3 justify-center">
                  {(() => {
                    const r = parseFloat(scanQty) / 100;
                    return [
                      { l: 'Kcal', v: Math.round(scannedProduct.k100 * r), c: 'text-orange-400' },
                      { l: 'P', v: `${Math.round(scannedProduct.p100 * r)}g`, c: 'text-blue-400' },
                      { l: 'G', v: `${Math.round(scannedProduct.c100 * r)}g`, c: 'text-amber-400' },
                      { l: 'L', v: `${Math.round(scannedProduct.f100 * r)}g`, c: 'text-purple-400' },
                    ].map((s, i) => (
                      <div key={i} className="text-center">
                        <span className={`text-lg font-black ${s.c}`}>{s.v}</span>
                        <span className="block text-[9px] text-slate-500 font-bold">{s.l}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* Bouton confirmer */}
            <button
              onClick={confirmScannedProduct}
              disabled={!scanQty || parseFloat(scanQty) <= 0}
              className="w-full bg-[#ccff00] disabled:bg-slate-700 disabled:text-slate-500 text-black font-black py-4 rounded-2xl flex justify-center items-center gap-2 hover:scale-[1.02] transition-transform shadow-xl text-sm uppercase tracking-wider"
            >
              <Plus size={18} /> {isFr ? `Ajouter ${scanQty || 0}g à ma journée` : `Add ${scanQty || 0}g to my day`}
            </button>
          </div>
        </div>
      )}

      {scanStatus && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl font-bold text-sm shadow-2xl flex flex-col items-center gap-1 animate-in slide-in-from-top duration-300 border max-w-[90vw] ${
          scanStatus === 'loading' ? 'bg-slate-800 border-slate-700 text-white' :
          scanStatus === 'success' ? 'bg-emerald-900/90 border-emerald-500/50 text-emerald-300' :
          'bg-red-900/90 border-red-500/50 text-red-300'
        }`}>
          <div className="flex items-center gap-2">
            {scanStatus === 'loading' && <Loader2 size={16} className="animate-spin text-[#ccff00]" />}
            {scanStatus === 'loading' && <span>{vocab.scanLoading}</span>}
            {scanStatus === 'success' && <span>{vocab.scanSuccess}</span>}
            {scanStatus === 'notfound' && <span>{vocab.scanNotFound}</span>}
            {scanStatus === 'error' && <span>{vocab.scanError}</span>}
          </div>
          {scannedCode && (
            <span className="text-[10px] text-slate-400 font-mono bg-black/30 px-2 py-0.5 rounded">
              Code: {scannedCode}
            </span>
          )}
        </div>
      )}

      {/* Carte macros du jour */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-[2rem] shadow-xl relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black text-white flex items-center gap-2"><Flame className="text-orange-500" size={20} /> {vocab.title}</h2>
          <div className="flex gap-2">
            <button onClick={() => setShowSettings(true)} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><Settings size={16} /></button>
            <button onClick={() => { if(window.confirm(vocab.clearAll)) setWeeklyFoods(p => ({...p, [activeDay]: []})) }} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors"><RotateCcw size={16} /></button>
          </div>
        </div>
        <div className="flex justify-between items-center bg-black/40 p-1 rounded-xl border border-slate-700/50 mb-5 overflow-x-auto hide-scrollbar">
          {vocab.days.map((d, i) => (
            <button key={i} onClick={() => setActiveDay(i)} className={`flex-1 py-1.5 px-1 sm:px-2 text-[10px] sm:text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${activeDay === i ? 'bg-[#ccff00] text-black shadow-sm' : 'text-slate-500 hover:text-white'}`}>
              {vocab.days[i]}
            </button>
          ))}
        </div>
        {goals && (
          <>
            <div className="mb-4">
              <div className="flex justify-between items-end mb-1"><span className="text-xs font-bold text-slate-400 uppercase">Calories</span><span className="text-sm font-black text-white">{totals.k} <span className="text-[10px] text-slate-500 font-normal">/ {goals.calories} kcal</span></span></div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500" style={{ width: `${getPercent(totals.k, goals.calories)}%` }}></div></div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[{l: vocab.protein, v: totals.p, m: goals.protein, color: 'bg-blue-500'}, {l: vocab.carbs, v: totals.c, m: goals.carbs, color: 'bg-amber-500'}, {l: vocab.fat, v: totals.f, m: goals.fat, color: 'bg-purple-500'}].map((stat, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase truncate">{stat.l}</span>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${stat.color} transition-all duration-500`} style={{ width: `${getPercent(stat.v, stat.m)}%` }}></div></div>
                  <span className="text-[9px] sm:text-[10px] font-black text-slate-300">{stat.v}g <span className="text-slate-600 font-normal">/ {stat.m}</span></span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Liste des repas */}
      <div className="space-y-3 px-1">
        {(weeklyFoods[activeDay] || []).length === 0 && (
          <div className="text-center py-10 text-slate-500 text-xs italic bg-slate-800/10 rounded-2xl border border-dashed border-slate-700/50">{vocab.emptyState}</div>
        )}
        {(weeklyFoods[activeDay] || []).map((item) => (
          <div key={item.id} className="bg-slate-800/60 border border-slate-700/50 p-3 rounded-2xl flex items-center shadow-md">
            <div className="pr-3 border-r border-slate-700/50 mr-3 text-center w-12 shrink-0"><span className="block text-[10px] font-black text-[#ccff00]">{item.time}</span></div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-white text-sm truncate pr-2">{item.name}</h3>
                <span className="text-xs font-black text-orange-500 whitespace-nowrap">{item.k} kcal</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">P: {item.p}g</span>
                <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">G: {item.c}g</span>
                <span className="text-[9px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">L: {item.f}g</span>
              </div>
            </div>
            <button onClick={() => setWeeklyFoods(p => ({...p, [activeDay]: p[activeDay].filter(f => f.id !== item.id)}))} className="ml-2 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition shrink-0"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>

      {/* Barre d'ajout fixe */}
      <div className="fixed bottom-[85px] left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0f172a]/95 backdrop-blur-xl border-y border-slate-800/80 p-3 sm:p-4 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="w-full space-y-2 sm:space-y-3">

          {/* Boutons IA + Scanner */}
          <div className="flex justify-center gap-2 -mt-8 relative z-40">
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-[10px] tracking-widest shadow-lg transition-transform hover:scale-105 ${showAIPanel ? 'bg-slate-800 text-white border border-slate-700' : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'}`}
            >
              <Bot size={15} /> {showAIPanel ? vocab.aiClose : vocab.aiOpen}
            </button>

            {/* ✅ NOUVEAU BOUTON SCANNER */}
            <button
              onClick={() => { setShowAIPanel(false); setShowScanner(true); setScanStatus(null); }}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-black text-[10px] tracking-widest shadow-lg bg-gradient-to-r from-[#ccff00] to-[#a3cc00] text-black hover:scale-105 transition-transform"
            >
              <ScanLine size={15} /> {vocab.scanBtn}
            </button>
          </div>

          {/* Panel IA */}
          {showAIPanel && (
            <div className="bg-slate-800/80 p-3 rounded-xl border border-blue-500/30 animate-in fade-in zoom-in duration-200">
              <label className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-2 block">{vocab.aiCoachTitle}</label>
              {imagePreview && (
                <div className="relative mb-3 inline-block">
                  <img src={imagePreview} alt="Meal" className="h-24 w-24 object-cover rounded-lg border-2 border-[#ccff00]" />
                  <button onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"><X size={12} /></button>
                </div>
              )}
              <div className="flex gap-2 mb-2">
                <textarea value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder={vocab.aiCoachPlaceholder} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 sm:p-3 text-[16px] text-white focus:border-blue-500 outline-none resize-none h-12 sm:h-14" />
                <div className="flex items-center justify-center shrink-0">
                  <input type="file" accept="image/*" capture="environment" onChange={handleImageCapture} ref={fileInputRef} className="hidden" id="camera-upload-nutri" />
                  <label htmlFor="camera-upload-nutri" className="bg-slate-700 hover:bg-slate-600 cursor-pointer h-12 w-12 sm:h-14 sm:w-14 rounded-lg flex items-center justify-center text-white border border-slate-600 transition-colors"><Camera size={20} className="sm:w-6 sm:h-6" /></label>
                </div>
              </div>
              <button onClick={handleAIAnalyze} disabled={isAiLoading || (!aiInput.trim() && !imageBase64)} className="w-full bg-blue-500 disabled:bg-slate-700 text-white font-black py-2.5 rounded-lg flex items-center justify-center gap-2">
                {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                {isAiLoading ? vocab.aiLoading : vocab.aiBtnScan}
              </button>
            </div>
          )}

          {/* Formulaire manuel */}
          {!showAIPanel && (
            <>
              <div className="flex gap-1.5 sm:gap-2">
                <input type="time" value={timeStr} onChange={e => setTimeStr(e.target.value)} className="w-[65px] sm:w-20 shrink-0 bg-slate-900 border border-slate-700 rounded-lg sm:rounded-xl px-0.5 sm:px-1 text-center text-[13px] sm:text-[16px] font-bold text-[#ccff00] outline-none" />
                <input type="text" value={form.name} onChange={e => handleAutoCalc(e.target.value, form.qty)} placeholder={vocab.namePlaceholder} className="flex-1 min-w-0 bg-slate-900 border border-slate-700 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-[14px] sm:text-[16px] font-bold text-white outline-none focus:border-[#ccff00] placeholder-slate-600" />
                <div className="relative w-[65px] sm:w-24 shrink-0">
                  <input type="number" value={form.qty} onChange={e => handleAutoCalc(form.name, e.target.value)} placeholder={vocab.qtyPlaceholder} className="w-full bg-slate-900 border border-slate-700 rounded-lg sm:rounded-xl pl-1 sm:pl-2 pr-5 sm:pr-6 py-1.5 sm:py-2 text-[14px] sm:text-[16px] font-bold text-[#ccff00] outline-none focus:border-[#ccff00] placeholder-slate-600" />
                  <span className="absolute right-1 sm:right-2 top-2 sm:top-3 text-[8px] sm:text-[10px] font-bold text-slate-500 pointer-events-none">g/u</span>
                </div>
              </div>
              <div className="flex gap-1 sm:gap-2">
                {[{l:'Kcal',v:form.k,k:'k',c:'text-orange-500 border-orange-500/30'},{l:isFr?'Pro':'Pro',v:form.p,k:'p',c:'text-blue-500 border-blue-500/30'},{l:isFr?'Glu':'Carb',v:form.c,k:'c',c:'text-amber-500 border-amber-500/30'},{l:isFr?'Lip':'Fat',v:form.f,k:'f',c:'text-purple-500 border-purple-500/30'}].map((f, i) => (
                  <div key={i} className="flex-1 relative mt-2">
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#0f172a] px-1 text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-wider">{f.l}</span>
                    <input type="number" placeholder="-" value={f.v === 0 ? '' : f.v} onChange={e => setForm({...form, [f.k]: e.target.value})} className={`w-full py-1.5 sm:py-2 bg-slate-900 border rounded-lg sm:rounded-xl text-center text-[14px] sm:text-[16px] font-black outline-none ${f.c}`} />
                  </div>
                ))}
                <button onClick={finalizeAddEntry} disabled={!form.name} className="w-10 sm:w-12 shrink-0 bg-[#ccff00] disabled:bg-slate-800 disabled:text-slate-600 text-black rounded-lg sm:rounded-xl hover:bg-[#b3e600] transition font-black flex items-center justify-center mt-2"><Plus size={18} className="sm:w-5 sm:h-5" /></button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal Settings */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-[2rem] w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white flex items-center gap-2"><Settings size={20} className="text-[#ccff00]"/> {vocab.setGoalsTitle}</h3>
              <button onClick={() => setShowSettings(false)} className="bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white hover:bg-red-500/20 transition-colors"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              {[{label:vocab.calories,key:'calories',color:'text-orange-500'},{label:vocab.protein,key:'protein',color:'text-blue-500'},{label:vocab.carbs,key:'carbs',color:'text-amber-500'},{label:vocab.fat,key:'fat',color:'text-purple-500'}].map((item) => (
                <div key={item.key} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50">
                  <label className={`font-black text-sm ${item.color}`}>{item.label}</label>
                  <input type="number" value={goals[item.key]} onChange={(e) => setGoals({...goals, [item.key]: Number(e.target.value)})} className="w-24 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-[16px] text-white font-black text-center outline-none focus:border-[#ccff00]" />
                </div>
              ))}
            </div>
            <button onClick={() => setShowSettings(false)} className="w-full mt-6 bg-[#ccff00] text-black font-black py-4 rounded-xl hover:bg-[#b3e600] transition shadow-lg flex justify-center items-center gap-2"><Target size={20} /> {vocab.saveBtn}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Nutrition;
