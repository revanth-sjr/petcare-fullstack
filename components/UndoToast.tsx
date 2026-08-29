'use client';
import React, { useEffect, useState } from 'react';

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onClose: () => void;
  durationSeconds?: number;
}

export default function UndoToast({
  message,
  onUndo,
  onClose,
  durationSeconds = 8,
}: UndoToastProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onClose();
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center justify-between gap-4 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-slate-700 animate-bounce-short">
      <div className="flex items-center gap-2 text-sm font-medium">
        <span>{message}</span>
        <span className="text-xs opacity-75 font-mono">({timeLeft}s)</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onUndo}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors"
        >
          Undo
        </button>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xs px-2 py-1"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
