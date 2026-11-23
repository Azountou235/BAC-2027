'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AudioRecorder } from '@/components/AudioRecorder';
import { AudioPlayer } from '@/components/AudioPlayer';
import {
  Send,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  CheckCheck,
  Mic,
  Bot,
  Volume2,
  Globe,
} from 'lucide-react';

interface AIMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  isAudio?: boolean;
  audioUrl?: string;
  duration?: number;
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

Je suis conçu pour vous accompagner dans toutes les matières des Séries A4, D et C, vous guider avec des explications claires, et répondre à toutes vos questions.

Vous pouvez m'écrire ou m'envoyer une note vocale. Je comprends et réponds en Français, Arabe et Anglais. Comment puis-je vous aider aujourd'hui ?`,
      time: 'Maintenant',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

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
        aiReply = `Je suis BAC Assistant IA 2027. J'ai bien reçu votre demande sur "${userText}". En tant qu'assistant de la plateforme BAC TCHAD 2027, je suis à vos côtés pour toutes vos révisions en Séries A4, D et C.`;
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
      const fallbackMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Je suis BAC Assistant IA 2027. Je réponds à toutes vos questions sur vos cours et révisions du BAC. Comment puis-je vous aider ?`,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle recorded voice note
  const handleAudioSend = async (blob: Blob, duration: number) => {
    setIsRecordingAudio(false);
    const audioUrl = URL.createObjectURL(blob);

    const userAudioMsg: AIMessage = {
      id: `u-audio-${Date.now()}`,
      sender: 'user',
      text: `🎤 Note vocale (${duration}s)`,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      isAudio: true,
      audioUrl,
      duration,
    };

    setMessages((prev) => [...prev, userAudioMsg]);
    setIsTyping(true);

    try {
      // Simulate speech-to-text or multilingual processing via API
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Note vocale reçue de l'utilisateur (${duration} secondes)`,
          isVoiceNote: true,
          audioDuration: duration,
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
        aiReply = `J'ai bien écouté votre note vocale. En tant qu'assistant officiel BAC Assistant IA 2027, je suis à votre disposition pour vous expliquer tout point de cours ou exercice dans vos séries A4, D et C.`;
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
      console.error('Failed to get voice AI reply:', err);
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
    <div className="flex flex-col h-screen bg-[#0b141a] text-slate-100 max-w-lg mx-auto shadow-2xl relative font-sans">
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
              <Globe className="w-3 h-3" />
              <span>Français • Arabe • Anglais</span>
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

                {msg.isAudio && msg.audioUrl ? (
                  <div className="py-1">
                    <AudioPlayer src={msg.audioUrl} duration={msg.duration || 10} isSender={isMe} />
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap font-normal select-text">
                    {cleanAsterisks(msg.text)}
                  </div>
                )}

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
              <span>BAC Assistant IA analyse et réfléchit...</span>
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

      {/* WhatsApp Voice Note & Input Bar */}
      <div className="bg-[#202c33] p-2 border-t border-[#222e35] sticky bottom-0 z-20">
        {isRecordingAudio ? (
          <AudioRecorder
            onSend={handleAudioSend}
            onCancel={() => setIsRecordingAudio(false)}
          />
        ) : (
          <div className="flex items-center space-x-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex-1 flex items-center bg-[#2a3942] rounded-full px-4 py-2 border border-transparent focus-within:border-emerald-500/50 transition-colors"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Message écrit ou envoyez un vocal..."
                className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder-slate-400"
              />
            </form>

            {inputText.trim() ? (
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isTyping}
                className="p-2.5 rounded-full bg-[#00a884] hover:bg-[#02906f] text-white shadow-md transition-transform active:scale-90"
              >
                <Send className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsRecordingAudio(true)}
                title="Enregistrer un message vocal"
                className="p-2.5 rounded-full bg-[#2a3942] hover:bg-[#32444f] text-[#00a884] transition-all active:scale-95"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
