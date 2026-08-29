'use client';
import React, { useState, useEffect } from 'react';

interface TrashItem {
  _id: string;
  originalActivityId: string;
  activitySnapshot: {
    title: string;
    activityType: string;
    dayKey?: string;
    scheduledTime?: string;
    notes?: string;
  };
  deletedByName?: string;
  deletedAt: string;
}

interface TrashBinModalProps {
  petId: string;
  isOpen: boolean;
  onClose: () => void;
  onRestored: () => void;
}

export default function TrashBinModal({
  petId,
  isOpen,
  onClose,
  onRestored,
}: TrashBinModalProps) {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBinItems = async () => {
    if (!petId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bin?petId=${petId}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBinItems();
    }
  }, [isOpen, petId]);

  const handleAction = async (trashId: string, action: 'restore' | 'delete_permanent') => {
    try {
      const res = await fetch('/api/bin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trashId, action }),
      });
      const data = await res.json();
      if (data.success) {
        fetchBinItems();
        onRestored();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-xl w-full shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold">🗑 Trash Bin — Soft-Deleted Logs</h3>
            <p className="text-xs opacity-60">
              Soft-deleted timeline records. Restoring brings them back into your daily checklist and metrics.
            </p>
          </div>
          <button onClick={onClose} className="text-sm opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>

        {loading ? (
          <p className="text-xs opacity-50 py-6">Loading trash items...</p>
        ) : items.length === 0 ? (
          <p className="text-xs opacity-50 text-center py-8">Trash bin is empty.</p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between bg-slate-800/60 border border-slate-700/50 p-3 rounded-xl"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {item.activitySnapshot?.title || 'Care Event'}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                      {item.activitySnapshot?.activityType}
                    </span>
                  </div>
                  <div className="text-xs opacity-60 mt-1">
                    Deleted by {item.deletedByName || 'User'} on{' '}
                    {new Date(item.deletedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(item._id, 'restore')}
                    className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1.5 rounded-lg"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => handleAction(item._id, 'delete_permanent')}
                    className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1"
                    title="Permanently remove"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs rounded-lg border border-slate-700 hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
