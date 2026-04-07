
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';

export const PocketopiaAI: React.FC = () => {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: "Hello! I'm the Pocketopia Architect AI. How can I help you with your app development journey or scheduling today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMessage,
        config: {
          systemInstruction: `You are the Pocketopia Architect AI, a specialized assistant for Pocketopia (a division of Hektic Hub). 
          Your expertise:
          1. App Development: Mobile (iOS/Android), Web Applications, E-commerce, AI scheduling/email services, and Custom Enterprise Software.
          2. Scheduling: Users can schedule an appointment by selecting a date and time on the calendar above. You can explain that our consultations are deep-dives into technical architecture.
          3. Tone: Professional, futuristic, knowledgeable, and slightly edgy (consistent with Hektic Hub).
          4. Restrictions: Do not answer questions unrelated to technology, apps, or Hektic Hub. Keep responses concise.`,
          temperature: 0.7,
        },
      });

      const aiText = response.text || "I'm sorry, I couldn't process that. Please try again.";
      setMessages(prev => [...prev, { role: 'assistant', content: aiText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection to the neural network interrupted. Please check your signal and try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 glass-card rounded-[2rem] border border-white/10 overflow-hidden flex flex-col h-[400px] shadow-2xl">
      <div className="bg-red-600/10 px-6 py-4 border-b border-white/10 flex items-center gap-3">
        <div className="p-2 bg-red-600 rounded-lg">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h4 className="font-futuristic text-xs font-black uppercase tracking-widest text-white">Architect AI</h4>
          <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Pocketopia Knowledge Base</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-black/20">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl flex gap-3 ${msg.role === 'user' ? 'bg-red-600/20 text-white rounded-tr-none border border-red-600/30' : 'bg-white/5 text-gray-300 rounded-tl-none border border-white/10'}`}>
              <div className="flex-shrink-0 mt-1">
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-red-500" />}
              </div>
              <p className="text-sm font-light leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10">
              <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-black/40 border-t border-white/10">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about app services or scheduling..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-red-600 transition-all text-white"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-red-500 hover:text-red-400 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
