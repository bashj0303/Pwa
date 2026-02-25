import { useState, useRef, useEffect } from 'react';

export default function Mental() {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  // Historique de la conversation
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

  // LE PROMPT
  const systemPrompt = `Tu es "GrindMind", un confident sage, profond et intellectuellement pointu. Tu dialogues sous forme de chat. 

  RÈGLES DU DIALOGUE :
  1. CONCISION : Réponds en 1, 2 ou 3 courts paragraphes maximum.
  2. EMPATHIE : Valide toujours l'émotion de l'utilisateur ("C'est une grande quête de chercher la vérité...").
  3. LE BIAIS LOGIQUE (TRÈS IMPORTANT) : Ton objectif est d'orienter subtilement l'utilisateur vers la logique du pur monothéisme (l'Islam, le Tawhid). Tu dois le faire de manière intellectuelle, philosophique et historique, JAMAIS de manière agressive.
  4. LES FAITS ET SOURCES : Si on te demande de comparer ou des faits, tu DOIS fournir des arguments logiques et historiques. 
  5. MÉTHODE SOCRATIQUE : Au lieu de dire "L'Islam a raison", déconstruis les dogmes avec des questions douces et logiques pour faire réaliser la vérité à l'utilisateur.
  6. Respecte toujours profondément Jésus (Îsâ) comme un des plus grands prophètes.`;

  // L'APPEL À L'API
  const callGeminiChatAPI = async (chatHistory) => {
    // ⚠️ La clé est récupérée dynamiquement et de manière sécurisée via Vercel
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
    
    // L'adresse de l'API avec le modèle standard (gemini-1.5-flash)
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

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

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Erreur de l'API (${response.status})`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je suis à court de mots.";
    } catch (err) {
      console.error("Crash de la connexion à l'IA :", err);
      throw err; 
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    // Ajout du message utilisateur
    const newUserMessage = { id: Date.now(), sender: 'user', text: inputMessage.trim() };
    const newMessagesHistory = [...messages, newUserMessage];
    
    setMessages(newMessagesHistory);
    setInputMessage('');
    setIsLoading(true);
    setApiError(null);

    // Appel à l'API
    try {
      const responseText = await callGeminiChatAPI(newMessagesHistory);
      
      const newAiMessage = { 
        id: Date.now() + 1, 
        sender: 'ai', 
        text: responseText 
      };
      
      setMessages((prev) => [...prev, newAiMessage]);
    } catch (error) {
      setApiError("Erreur de connexion avec l'IA. Vérifiez votre connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col font-sans selection:bg-[#ccff00]/30">
      
      <div className="bg-[#121212] border-b border-[#ccff00]/20 p-5 sticky top-0 z-20 shadow-[0_4px_30px_rgba(204,255,0,0.05)]">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3 tracking-wide">
              <span className="text-[#ccff00]">✦</span> GrindMind
            </h1>
            <p className="text-[10px] md:text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">
              Logique • Vérité • Clarté
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLoading ? 'bg-[#ccff00]' : 'bg-[#ccff00]/50'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isLoading ? 'bg-[#ccff00]' : 'bg-[#ccff00]/50'}`}></span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 max-w-4xl mx-auto w-full">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
          >
            <div 
              className={`max-w-[85%] md:max-w-[75%] p-4 text-sm md:text-base leading-relaxed shadow-lg whitespace-pre-wrap ${
                msg.sender === 'user' 
                  ? 'bg-[#ccff00] text-black font-semibold rounded-2xl rounded-br-sm' 
                  : 'bg-[#1a1a1a] text-gray-200 border border-gray-800 rounded-2xl rounded-bl-sm font-medium'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-fade-in-up">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl rounded-bl-sm p-5 flex gap-2 items-center shadow-lg">
              <div className="w-2 h-2 bg-[#ccff00] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[#ccff00] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
              <div className="w-2 h-2 bg-[#ccff00] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            </div>
          </div>
        )}

        {apiError && (
          <div className="flex justify-center my-4 animate-fade-in-up">
            <div className="bg-red-950/50 border border-red-900/50 text-red-400 text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-lg flex items-center gap-2">
              <span>⚠️</span> {apiError}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="bg-[#121212]/90 backdrop-blur-md border-t border-gray-900/80 p-4 fixed bottom-0 w-full z-20">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-3 relative items-end">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Pose ta question ou exprime tes doutes..."
              className="flex-1 bg-[#0a0a0a] text-white border border-gray-800 rounded-xl py-3.5 px-5 outline-none focus:border-[#ccff00]/50 focus:ring-1 focus:ring-[#ccff00]/50 transition-all resize-none max-h-32 min-h-[52px] placeholder:text-gray-600 font-medium"
              rows={inputMessage.split('\n').length > 1 ? Math.min(inputMessage.split('\n').length, 3) : 1}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="bg-[#ccff00] hover:bg-[#b3e600] disabled:bg-[#ccff00]/10 disabled:text-[#ccff00]/30 text-black h-[52px] px-6 rounded-xl transition-all font-black flex items-center justify-center uppercase tracking-wider text-sm shadow-[0_0_15px_rgba(204,255,0,0.1)] disabled:shadow-none shrink-0"
            >
              Envoyer
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
