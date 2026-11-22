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
  Mic,
  MicOff,
  Bot,
  RefreshCw,
  Search,
  Volume2,
} from 'lucide-react';

interface AIMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

// Clean helper ensuring zero asterisks (* or ** or ***)
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

Je suis conçu pour vous accompagner dans toutes les matières des Séries A4, D et C, vous guider avec des explications claires, et répondre à toutes vos questions.

Vous pouvez m'écrire directement ou appuyer sur le micro pour me parler à voix haute. Comment puis-je vous aider aujourd'hui ?`,
      time: 'Maintenant',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'fr-FR';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          setInputText(transcript);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const toggleVoiceListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('La reconnaissance vocale n\'est pas supportée par ce navigateur. Vous pouvez saisir votre message au clavier.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Could not start recognition:', err);
      }
    }
  };

  // Text to speech for vocal response
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const rawContent = textToSend || inputText;
    if (!rawContent.trim() || isTyping) return;

    const userText = cleanAsterisks(rawContent);

    const userMsg: AIMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
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
      if (res.ok) {
        const data = await res.json();
        aiReply = cleanAsterisks(data.reply || '');
      }

      if (!aiReply) {
        aiReply = `Je suis BAC Assistant IA 2027. J'ai bien reçu votre demande sur "${userText}". En tant qu'assistant de la plateforme BAC TCHAD 2027, je suis à vos côtés pour toutes vos révisions en Séries A4, D et C. N'hésitez pas à me poser une question précise sur un cours ou un sujet de baccalauréat.`;
      }

      const aiMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: cleanAsterisks(aiReply),
        time: new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Failed to get AI reply:', err);
      const fallbackMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Je suis BAC Assistant IA 2027. Je réponds à toutes vos questions sur le BAC Tchad, votre programme et les méthodes d'examen. Comment puis-je vous aider ?`,
        time: new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const QUICK_QUESTIONS = [
    'Qui est ton créateur ?',
    'Qui es-tu et quel est ton rôle ?',
    'À propos de la plateforme BAC TCHAD 2027',
    'Dernières infos sur le BAC Tchad',
    'Méthode dissertation philo (A4)',
    'Formules clés et limites Maths (C/D)',
  ];

  return (
    <div className="flex flex-col h-screen bg-[#0b141a] text-slate-100 max-w-lg mx-auto shadow-2xl relative">
      {/* Header WhatsApp Style */}
      <header className="bg-[#202c33] px-3 py-2 flex items-center justify-between border-b border-[#222e35] sticky top-0 z-30 shadow">
        <div className="flex items-center space-x-2">
          <Link
            href="/app/chats"
            className="p-1 -ml-1 text-slate-300 hover:text-white rounded-full transition-colors"
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
              <Sparkles className="w-3 h-3" />
              IA Officielle • Toujours en ligne
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (messages.length > 0) {
                const lastAi = [...messages].reverse().find((m) => m.sender === 'ai');
                if (lastAi) speakText(lastAi.text);
              }
            }}
            title="Écouter la réponse"
            className={`p-2 rounded-full transition-colors ${
              isSpeaking
                ? 'bg-emerald-500 text-white animate-pulse'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Suggestion Chips */}
      <div className="bg-[#111b21] px-3 py-2 border-b border-[#202c33] overflow-x-auto flex gap-2 no-scrollbar">
        {QUICK_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="whitespace-nowrap px-3 py-1.5 bg-[#202c33] hover:bg-[#2a3942] text-xs text-slate-200 rounded-full border border-slate-700/60 transition-all hover:border-emerald-500/50 flex items-center gap-1.5 active:scale-95"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            {q}
          </button>
        ))}
      </div>

      {/* Voice Listening Banner */}
      {isListening && (
        <div className="bg-emerald-950/80 border-b border-emerald-500/30 px-4 py-2 flex items-center justify-between text-xs text-emerald-200 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>J'écoute votre voix... Parlez maintenant</span>
          </div>
          <button
            onClick={toggleVoiceListening}
            className="text-white bg-emerald-700 px-2 py-0.5 rounded text-[10px] font-semibold"
          >
            Arrêter
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(0, 168, 132, 0.03) 0%, transparent 80%)`,
        }}
      >
        <div className="flex justify-center my-2">
          <div className="bg-[#182229] border border-slate-800/80 px-3 py-1 rounded-md text-[11px] text-slate-400 text-center max-w-xs shadow-sm">
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
                  <div className="flex items-center justify-between gap-2 mb-1 pb-1 border-b border-white/10 text-xs font-semibold text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      BAC Assistant IA
                    </span>
                    <button
                      onClick={() => speakText(msg.text)}
                      className="text-slate-400 hover:text-white"
                      title="Écouter à voix haute"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="whitespace-pre-wrap font-normal select-text">
                  {cleanAsterisks(msg.text)}
                </div>

                <div className="flex items-center justify-end space-x-1 mt-1 text-[10px] text-slate-400">
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
              <Bot className="w-4 h-4 text-emerald-400 animate-bounce" />
              <span>BAC Assistant IA réfléchit...</span>
              <span className="flex space-x-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse delay-100" />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse delay-200" />
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="bg-[#202c33] p-2 flex items-center space-x-2 border-t border-[#222e35] sticky bottom-0 z-20">
        <button
          type="button"
          onClick={toggleVoiceListening}
          title={isListening ? 'Arrêter le micro' : 'Parler au micro'}
          className={`p-2.5 rounded-full transition-all flex items-center justify-center ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse shadow-lg scale-110'
              : 'text-slate-300 hover:text-white bg-[#2a3942] hover:bg-[#32444f]'
          }`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-emerald-400" />}
        </button>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex-1 flex items-center bg-[#2a3942] rounded-full px-4 py-1.5 border border-transparent focus-within:border-emerald-500/50 transition-colors"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? 'Écoute en cours...' : 'Posez une question à l\'IA...'}
            className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder-slate-400"
          />
        </form>

        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isTyping}
          className={`p-2.5 rounded-full transition-transform active:scale-90 flex items-center justify-center ${
            inputText.trim() && !isTyping
              ? 'bg-[#00a884] hover:bg-[#02906f] text-white shadow-md'
              : 'bg-[#2a3942] text-slate-500 cursor-not-allowed'
          }`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
