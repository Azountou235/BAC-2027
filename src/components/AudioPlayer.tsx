'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  duration?: number;
  isSender?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, duration = 0, isSender = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setAudioDuration(Math.round(audio.duration));
      }
    };

    audio.ontimeupdate = () => {
      setCurrentTime(Math.round(audio.currentTime));
    };

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const togglePlaybackRate = () => {
    const rates = [1, 1.5, 2];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const waveformBars = [12, 24, 18, 32, 26, 14, 28, 20, 36, 22, 16, 30, 24, 18, 26, 12];

  return (
    <div
      className={`flex items-center gap-3 p-2.5 rounded-2xl w-64 max-w-full ${
        isSender ? 'bg-teal-700/60 text-white' : 'bg-slate-800/90 text-slate-100 border border-slate-700/50'
      }`}
    >
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-95 shadow-md ${
          isSender ? 'bg-white text-teal-800' : 'bg-teal-500 text-white hover:bg-teal-600'
        }`}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
      </button>

      <div className="flex-1 flex flex-col justify-center gap-1.5 overflow-hidden">
        {/* Animated Soundwave / Progress */}
        <div className="relative flex items-center gap-0.5 h-6">
          {waveformBars.map((barHeight, idx) => {
            const progress = audioDuration > 0 ? currentTime / audioDuration : 0;
            const barProgress = idx / waveformBars.length;
            const isPlayed = barProgress <= progress;

            return (
              <div
                key={idx}
                style={{ height: `${barHeight}px` }}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isPlayed
                    ? isSender
                      ? 'bg-white'
                      : 'bg-teal-400'
                    : isSender
                    ? 'bg-teal-900/60'
                    : 'bg-slate-600'
                }`}
              />
            );
          })}
          <input
            type="range"
            min="0"
            max={audioDuration || 1}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 opacity-0 cursor-pointer w-full"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono opacity-80">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(audioDuration)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={togglePlaybackRate}
        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${
          isSender ? 'bg-teal-800 text-teal-100' : 'bg-slate-700 text-slate-200'
        }`}
      >
        {playbackRate}x
      </button>
    </div>
  );
};
