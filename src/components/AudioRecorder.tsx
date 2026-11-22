'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Send } from 'lucide-react';

interface AudioRecorderProps {
  onSend: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onSend, onCancel }) => {
  const [isRecording, setIsRecording] = useState(true);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    startRecording();
    return () => {
      stopTracks();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const stopTracks = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Impossible d’accéder au microphone. Veuillez autoriser l’accès dans votre navigateur.');
      onCancel();
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    stopTracks();
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleTogglePlayPreview = () => {
    if (!audioPlayerRef.current && audioUrl) {
      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;
      audio.onended = () => setIsPlayingPreview(false);
    }

    if (audioPlayerRef.current) {
      if (isPlayingPreview) {
        audioPlayerRef.current.pause();
        setIsPlayingPreview(false);
      } else {
        audioPlayerRef.current.play();
        setIsPlayingPreview(true);
      }
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob, recordingDuration);
    }
  };

  return (
    <div className="flex items-center justify-between w-full bg-slate-900 border border-teal-800/40 rounded-2xl px-4 py-2.5 shadow-lg animate-in fade-in slide-in-from-bottom-2">
      {isRecording ? (
        <>
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 font-mono text-sm font-semibold">
              {formatDuration(recordingDuration)}
            </span>
            <div className="flex items-center gap-1">
              <span className="w-1 h-3 bg-red-500/80 rounded animate-pulse" />
              <span className="w-1 h-5 bg-red-500 rounded animate-pulse delay-75" />
              <span className="w-1 h-2 bg-red-500/60 rounded animate-pulse delay-150" />
              <span className="w-1 h-6 bg-red-500 rounded animate-pulse delay-100" />
              <span className="w-1 h-4 bg-red-500/80 rounded animate-pulse" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="p-2 text-slate-400 hover:text-red-400 rounded-full hover:bg-slate-800 transition-colors"
              title="Annuler"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleStopRecording}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors shadow-md"
              title="Arrêter pour écouter"
            >
              <Square className="w-5 h-5 fill-current" />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleTogglePlayPreview}
              className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-full transition-colors"
            >
              {isPlayingPreview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <span className="text-teal-300 font-mono text-sm">
              Note vocale ({formatDuration(recordingDuration)})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="p-2 text-slate-400 hover:text-red-400 rounded-full hover:bg-slate-800 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleSend}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-medium text-sm transition-colors shadow-md"
            >
              <span>Envoyer</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
