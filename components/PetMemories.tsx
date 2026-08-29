'use client';
import React, { useState, useEffect } from 'react';

interface MemoryItem {
  _id: string;
  title: string;
  caption: string;
  date: string;
  photoUrl?: string;
  createdByName?: string;
}

interface PetMemoriesProps {
  petId: string;
  petName: string;
}

export default function PetMemories({ petId, petName }: PetMemoriesProps) {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [photoUrl, setPhotoUrl] = useState('');

  const fetchMemories = async () => {
    if (!petId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/memories?petId=${petId}`);
      const data = await res.json();
      if (data.success) {
        setMemories(data.memories || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [petId]);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petId, title, caption, date, photoUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setTitle('');
        setCaption('');
        setPhotoUrl('');
        setShowAddModal(false);
        fetchMemories();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this memory?')) return;
    try {
      await fetch(`/api/memories?id=${id}`, { method: 'DELETE' });
      fetchMemories();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="card my-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">📸 {petName}'s Memories</h2>
          <small className="opacity-75">Milestones, photos & special moments</small>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary text-xs"
        >
          + Add Memory
        </button>
      </div>

      {loading ? (
        <p className="text-xs opacity-50 py-4">Loading memories...</p>
      ) : memories.length === 0 ? (
        <div className="text-center py-8 opacity-60">
          <p className="text-sm">No memories recorded yet.</p>
          <small>Add photos of first walks, birthdays, or special training milestones!</small>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {memories.map((m) => (
            <div key={m._id} className="border border-slate-700/50 rounded-xl overflow-hidden bg-slate-900/40 p-3">
              {m.photoUrl && (
                <img
                  src={m.photoUrl}
                  alt={m.title}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
              )}
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm">{m.title}</h4>
                  <span className="text-xs opacity-60 font-mono">{m.date}</span>
                </div>
                <button
                  onClick={() => handleDeleteMemory(m._id)}
                  className="text-xs opacity-50 hover:opacity-100"
                  title="Delete memory"
                >
                  🗑
                </button>
              </div>
              {m.caption && <p className="text-xs opacity-80 mt-2">{m.caption}</p>}
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Add Memory for {petName}</h3>
            <form onSubmit={handleAddMemory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. First Day Home, Got a new toy"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Caption / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Describe this milestone..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Photo URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs rounded-lg border border-slate-700 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary text-xs px-4 py-2">
                  Save Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
