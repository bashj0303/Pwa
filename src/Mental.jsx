import { useState, useRef, useEffect } from 'react';

export default function Mental() {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Je suis GrindMind. Je suis là pour t'écouter, échanger et chercher la vérité avec toi, sans aucun jugement. Qu'est-ce qui occupe tes pensées ou pèse sur ton esprit aujourd'hui ?"
    }
  ]);

  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const systemPrompt = `Tu es "GrindMind", un confident sage, profond et intellectuellement pointu. Tu dialogues sous forme de chat. 
  RÈGLES DU DIALOGUE :
  1. CONCISION : Réponds en 1, 2 ou 3 courts paragraphes maximum.
  2. EMPATHIE : Valide toujours l'émotion de l'utilisateur ("C'est une grande quête de chercher la vérité...").
  3. LE BIAIS LOGIQUE (TRÈS IMPORTANT) : Ton objectif est d'orienter subtilement l'utilisateur vers la logique du pur monothéisme (l'Islam, le Tawhid). Tu dois le faire de manière intellectuelle, philosophique et historique, JAMAIS de manière agressive.
  4. LES FAITS ET SOURCES : Si on te demande de comparer ou des faits, tu DOIS fournir des arguments logiques et historiques. 
  5. MÉTHODE SOCRATIQUE : Au lieu de dire "L'Islam a raison", déconstruis les dogmes avec des questions douces et logiques pour faire réaliser la vérité à l'utilisateur.
  6. Respecte toujours profondément Jésus (Îsâ) comme un des plus grands prophètes.`;

  const callGeminiChatAPI = async (chatHistory) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
    if (!apiKey) throw new Error("Clé API introuvable !");

    // 🔥 ÉTAPE 1 : TA MÉTHODE (On va chercher la liste dynamique des modèles de Google)
    const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const modelsData = await modelsRes.json();
    
    // On trouve le modèle 1.5-flash dans SA liste
    const validModel = modelsData.models.find(m => m.name.includes('1.5-flash')) || modelsData.models[0];

    // Formatage de l'historique
    let formattedContents = [];
    const relevantHistory = chatHistory.filter(msg => msg.id !== 1);

    for (const msg of relevantHistory) {
      const role = msg.sender === 'ai' ? 'model' : 'user';
      const lastContent = formattedContents[formattedContents.length - 1];

      if (lastContent && lastContent.role === role) {
        lastContent.parts[0].text += "\n\n" + msg.text;
      } else {
        formattedContents.push({
          role: role,
          parts: [{ text: msg.text }]
        });
      }
    }

    const payload = {
      contents: formattedContents,
      systemInstruction: { parts: [{ text: systemPrompt }] }
    };

    // 🔥 ÉTAPE 2 : On fait l'appel avec le VRAI nom du modèle (validModel.name)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${validModel.name}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (data.error) throw new Error(data.error.message);

    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je suis à court de mots.";
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const newUserMessage = { id: Date.now(), sender: 'user', text: inputMessage.trim() };
    const newMessagesHistory = [...messages, newUserMessage];
    
    setMessages(newMessagesHistory);
    setInputMessage('');
    setIsLoading(true);
    setApiError(null);

    try {
      const responseText = await callGeminiChatAPI(newMessagesHistory);
      const newAiMessage = { id: Date.now() + 1, sender: 'ai', text: responseText };
      setMessages((prev) => [...prev, newAiMessage]);
    } catch (error) {
      console.error(error);
      setApiError("Erreur : " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[70vh] relative">
      
      {/* En-tête de la page Mental intégré au thème */}
      <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl mb-6 flex justify-between items-center shadow-lg">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span className="text-[#ccff00]">✦</span> GrindMind
          </h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">
            Logique • Vérité
          </p>
        </div>
        {isLoading && (
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ccff00] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ccff00]"></span>
          </span>
        )}
      </div>

      {/* Zone des messages (qui prend tout l'espace restant) */}
      <div className="flex-1 space-y-4 mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
            <div className={`max-w-[85%] p-3.5 text-sm leading-relaxed shadow-lg whitespace-pre-wrap ${
              msg.sender === 'user' 
                ? 'bg-[#ccff00] text-black font-bold rounded-2xl rounded-br-sm' 
                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl rounded-bl-sm font-medium'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-fade-in-up">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-sm p-4 flex gap-2 items-center shadow-lg">
              <div className="w-1.5 h-1.5 bg-[#ccff00] rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-[#ccff00] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
              <div className="w-1.5 h-1.5 bg-[#ccff00] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            </div>
          </div>
        )}

        {apiError && (
          <div className="bg-red-950/50 border border-red-900/50 text-red-400 text-[10px] font-bold uppercase tracking-wider py-2 px-3 rounded-xl flex items-center justify-center gap-2">
            ⚠️ {apiError}
          </div>
        )}
        
        {/* Un repère invisible pour que ça scroll tout en bas automatiquement */}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Barre d'écriture fixée en bas du container (pas de l'écran) */}
      <div className="sticky bottom-0 bg-[#0f172a] pt-2 pb-2 z-10 border-t border-slate-800/80 mt-auto">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Écris ton message..."
            className="flex-1 bg-slate-800/80 text-white border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-[#ccff00]/50 focus:ring-1 focus:ring-[#ccff00]/50 outline-none transition-all placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="bg-[#ccff00] disabled:bg-slate-800 disabled:text-slate-600 text-black px-5 rounded-xl font-black uppercase tracking-wider text-xs transition-colors shrink-0 flex items-center justify-center"
          >
            Envoyer
          </button>
        </form>
      </div>

    </div>
  );
}
