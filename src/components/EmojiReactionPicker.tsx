'use client';

import React from 'react';
import { AllowedEmoji } from '@/types';

interface EmojiReactionPickerProps {
  onSelect: (emoji: AllowedEmoji) => void;
  onClose: () => void;
}

export const EMOJIS: AllowedEmoji[] = ['❤️', '😂', '👍', '😮', '😢', '🔥', '👏'];

export const EmojiReactionPicker: React.FC<EmojiReactionPickerProps> = ({ onSelect, onClose }) => {
  return (
    <div className="absolute -top-12 left-0 z-50 flex items-center gap-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-full px-2.5 py-1.5 shadow-2xl animate-in zoom-in-95 duration-150">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => {
            onSelect(emoji);
            onClose();
          }}
          className="text-lg hover:scale-135 active:scale-95 transition-transform duration-100 p-1"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};
