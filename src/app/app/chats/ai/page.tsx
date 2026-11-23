'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Send,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  CheckCheck,
  Bot,
  Globe,
} from 'lucide-react';

interface AIMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  detectedLang?: 'fr' | 'ar' | 'en';
}

function cleanAsterisks(raw: string): string {
  if (!raw) return '';
  return raw.replace(/\*{1,4}/g, '').trim();
}

export default function AIChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'ai-init',
      sender: 'ai',
      text: `Bonjour ! Je suis BAC Assistant IA 2027, votre assistant intelligent officiel intégré à la plateforme BAC TCHAD 2027.

Je suis conçu pour vous assister et vous accompagner dans toutes les matières des Séries A4, D et C : explications de cours, méthode de dissertation, résumés, définitions et résolution d'exercices.

Posez-moi votre question, je vous répondrai de manière claire, structurée et pédagogique.`,
      time: 'Maintenant',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const rawContent = textToSend || inputText;
    if (!rawContent.trim() || isTyping) return;

    const userText = cleanAsterisks(rawContent);

    const userMsg: AIMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages.map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      let aiReply = '';
      let detectedLang: 'fr' | 'ar' | 'en' = 'fr';

      if (res.ok) {
        const data = await res.json();
        aiReply = cleanAsterisks(data.reply || '');
        if (data.language) detectedLang = data.language;
      }

      if (!aiReply) {
        aiReply = `Je suis BAC Assistant IA 2027. J'ai bien analysé votre question. En tant qu'assistant éducatif officiel de la plateforme BAC TCHAD 2027, je suis à votre disposition pour vous expliquer les concepts clés des séries A4, D et C.`;
      }

      const aiMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: cleanAsterisks(aiReply),
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        detectedLang,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Failed to get AI reply:', err);
      const errorMsg: AIMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: "Une erreur réseau est survenue. Veuillez vérifier votre connexion et poser à nouveau votre question.",
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const QUICK_QUESTIONS = [
    'Qui est ton créateur ?',
    'Qui es-tu et quel est ton rôle ?',
    'Méthode dissertation philo (A4)',
    'Formules clés et limites Maths (C/D)',
    'SVT : Monohybridisme et génétique (D)',
  ];

  return (
    <div className="flex flex-col h-screen bg-[#0b141a] text-[#e9edef] max-w-lg mx-auto shadow-2xl relative font-sans">
      {/* Header WhatsApp Style */}
      <header className="bg-[#202c33] px-3 py-2.5 flex items-center justify-between border-b border-[#222e35] sticky top-0 z-30 shadow">
        <div className="flex items-center space-x-2.5">
          <Link
            href="/app/chats"
            className="p-1 -ml-1 text-[#8696a0] hover:text-white rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00a884] via-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#202c33] rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="font-semibold text-white text-[15px] leading-tight">
                BAC Assistant IA 2027
              </h1>
              <ShieldCheck className="w-4 h-4 text-[#00a884]" />
            </div>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <Globe className="w-3 h-3" />
              <span>Français • Arabe • Anglais</span>
            </p>
          </div>
        </div>
      </header>

      {/* Suggestion Chips */}
      <div className="bg-[#111b21] px-3 py-2 border-b border-[#202c33] overflow-x-auto flex gap-2 no-scrollbar">
        {QUICK_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="whitespace-nowrap px-3 py-1.5 bg-[#202c33] hover:bg-[#2a3942] text-xs text-[#e9edef] rounded-full border border-slate-700/60 transition-all hover:border-[#00a884]/50 flex items-center gap-1.5 active:scale-95"
          >
            <Sparkles className="w-3 h-3 text-[#00a884]" />
            {q}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(0, 168, 132, 0.03) 0%, transparent 80%)`,
        }}
      >
        <div className="flex justify-center my-2">
          <div className="bg-[#182229] border border-slate-800/80 px-3 py-1 rounded-md text-[11px] text-[#8696a0] text-center max-w-xs shadow-sm">
            Toutes les réponses sont formulées avec soin, sans astérisques, conformément au programme officiel du BAC Tchad.
          </div>
        </div>

        {messages.map((msg) => {
          const isMe = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`relative max-w-[85%] rounded-lg px-3 py-2 text-sm shadow-sm leading-relaxed ${
                  isMe
                    ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                    : 'bg-[#202c33] text-[#e9edef] rounded-tl-none border border-slate-700/30'
                }`}
              >
                {!isMe && (
                  <div className="flex items-center gap-1 mb-1 pb-1 border-b border-white/10 text-xs font-semibold text-[#00a884]">
                    <Sparkles className="w-3 h-3" />
                    BAC Assistant IA
                  </div>
                )}

                <div className="whitespace-pre-wrap font-normal select-text">
                  {cleanAsterisks(msg.text)}
                </div>

                <div className="flex items-center justify-end space-x-1 mt-1 text-[10px] text-[#8696a0]">
                  <span>{msg.time}</span>
                  {isMe && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-start">
            <div className="bg-[#202c33] text-slate-300 rounded-lg rounded-tl-none px-4 py-2.5 text-xs flex items-center space-x-2 border border-slate-700/30">
              <Bot className="w-4 h-4 text-[#00a884] animate-bounce" />
              <span>BAC Assistant IA analyse votre question...</span>
              <span className="flex space-x-1">
                <span className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-pulse" />
                <span className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-pulse delay-100" />
                <span className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-pulse delay-200" />
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Text Only Input Bar */}
      <div className="bg-[#202c33] p-2 border-t border-[#222e35] sticky bottom-0 z-20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <div className="flex-1 flex items-center bg-[#2a3942] rounded-full px-4 py-2 border border-transparent focus-within:border-[#00a884]/50 transition-colors">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Posez votre question à BAC Assistant IA..."
              className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder:text-[#8696a0]"
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="p-2.5 rounded-full bg-[#00a884] hover:bg-[#02906f] active:scale-95 disabled:opacity-40 text-[#111b21] shadow-md transition-all"
            title="Envoyer la question"
          >
            <Send className="w-5 h-5 fill-current" />
          </button>
        </form>
      </div>
    </div>
  );
}
