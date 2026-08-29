'use client';
import React, { useState } from 'react';

interface PetContext {
  _id?: string;
  name?: string;
  species?: string;
  breed?: string;
  age?: string;
  weight?: string;
  allergies?: string[];
  conditions?: string[];
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export default function AiAssistantChat({ pet }: { pet?: PetContext }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: `Hello! I'm your PetCare Assistant. How can I help you take care of ${pet?.name || 'your pet'} today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage, pet }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: data.reply || 'I am here to assist with pet care questions!' },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Apologies, I ran into an error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-40 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold p-3.5 rounded-full shadow-2xl flex items-center gap-2 transition-all transform hover:scale-105"
      >
        <span className="text-xl">🤖</span>
        <span className="text-xs pr-1">PetCare AI</span>
      </button>

      {/* Slide-out / Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-20 left-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden h-[480px]">
          {/* Header */}
          <div className="bg-indigo-950/80 p-3.5 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <h4 className="font-bold text-xs text-white">PetCare Assistant</h4>
                <p className="text-[10px] text-indigo-300">
                  Context: {pet?.name || 'Pet'} ({pet?.species || 'dog'})
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] text-xs p-3 rounded-xl leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-800 border border-slate-700/80 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-400 text-xs p-3 rounded-xl rounded-bl-none animate-pulse">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-700 bg-slate-900 flex gap-2">
            <input
              type="text"
              placeholder={`Ask anything about ${pet?.name || 'your pet'}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
