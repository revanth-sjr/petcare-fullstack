'use client';
import React, { useState, useEffect } from 'react';
import OwnerShell from '@/components/OwnerShell';
import UndoToast from '@/components/UndoToast';
import OverFeedingAlert from '@/components/OverFeedingAlert';
import PetMemories from '@/components/PetMemories';
import TrashBinModal from '@/components/TrashBinModal';

function getTodayIST(): string {
  const d = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(d.getTime() + istOffset);
  return istDate.toISOString().split('T')[0];
}

export default function OwnerDashboard() {
  const [pet, setPet] = useState<any>(null);
  const [petsCount, setPetsCount] = useState<number>(0);
  const [activities, setActivities] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Undo Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastLoggedId, setLastLoggedId] = useState<string | null>(null);

  // Trash Bin Modal state
  const [showTrashModal, setShowTrashModal] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch pets
      const petsRes = await fetch('/api/pets');
      const petsData = await petsRes.json();
      if (petsData.success && petsData.pets?.length > 0) {
        setPetsCount(petsData.pets.length);
        const savedId = localStorage.getItem('petcare_active_pet_id');
        const currentPet = petsData.pets.find((p: any) => p._id === savedId) || petsData.pets[0];
        setPet(currentPet);

        if (currentPet) {
          const today = getTodayIST();

          // 2. Fetch today's activities for active pet
          const actRes = await fetch(`/api/activities?petId=${currentPet._id}&dayKey=${today}`);
          const actData = await actRes.json();
          if (actData.success) {
            setActivities(actData.activities || []);
          }

          // 3. Fetch active medications for pet
          const medRes = await fetch(`/api/medications?petId=${currentPet._id}&activeOnly=true`);
          const medData = await medRes.json();
          if (medData.success) {
            setMedications(medData.medications || []);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    window.addEventListener('pet-changed', loadDashboardData);
    return () => window.removeEventListener('pet-changed', loadDashboardData);
  }, []);

  const handleLogActivity = async (activityType: string, title: string) => {
    if (!pet) return;
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petId: pet._id,
          activityType,
          title,
          status: 'completed',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLastLoggedId(data.activity._id);
        setToastMessage(`${title} recorded`);
        loadDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUndo = async () => {
    if (!lastLoggedId) return;
    try {
      await fetch(`/api/activities?id=${lastLoggedId}`, { method: 'DELETE' });
      setToastMessage(null);
      setLastLoggedId(null);
      loadDashboardData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    try {
      await fetch(`/api/activities?id=${id}`, { method: 'DELETE' });
      loadDashboardData();
    } catch (e) {
      console.error(e);
    }
  };

  // Metrics
  const feedingsToday = activities.filter((a) => a.activityType === 'feeding').length;
  const targetFeedings = pet?.feedingSchedule?.times?.length || pet?.dailyTargets?.feeding || 3;
  const completedCount = activities.filter((a) => a.status === 'completed').length;

  return (
    <OwnerShell>
      {/* Over Feeding Alert */}
      {pet && (
        <OverFeedingAlert
          petName={pet.name}
          loggedCount={feedingsToday}
          scheduledTarget={targetFeedings}
        />
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <small className="text-xs text-slate-400">Total Pets</small>
          <div className="stat text-2xl font-bold mt-1">{petsCount}</div>
        </div>
        <div className="card">
          <small className="text-xs text-slate-400">Today's Feedings</small>
          <div className="stat text-2xl font-bold mt-1 text-amber-400">
            {feedingsToday} / {targetFeedings}
          </div>
        </div>
        <div className="card">
          <small className="text-xs text-slate-400">Active Meds</small>
          <div className="stat text-2xl font-bold mt-1 text-indigo-400">
            {medications.length}
          </div>
        </div>
        <div className="card">
          <small className="text-xs text-slate-400">Completed Tasks</small>
          <div className="stat text-2xl font-bold mt-1 text-emerald-400">
            {completedCount}
          </div>
        </div>
      </div>

      {/* Quick Action Logger */}
      {pet && (
        <section className="card mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
            ⚡ Quick Care Logger
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleLogActivity('feeding', 'Logged Meal Feeding')}
              className="btn btn-primary text-xs flex items-center gap-1.5"
            >
              🍖 Log Feeding
            </button>
            <button
              onClick={() => handleLogActivity('walk', 'Logged Outdoor Walk')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              🐕 Log Walk
            </button>
            {medications.map((m) => (
              <button
                key={m._id}
                onClick={() =>
                  handleLogActivity('medication', `Gave ${m.name} (${m.dosage})`)
                }
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
              >
                💊 {m.name} ({m.dosage})
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Today's Timeline & Bin */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="card lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">📋 Today's Timeline</h3>
            {pet && (
              <button
                onClick={() => setShowTrashModal(true)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                🗑 Open Bin
              </button>
            )}
          </div>

          {loading ? (
            <p className="text-xs opacity-50 py-4">Loading today's activity log...</p>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 opacity-60">
              <p className="text-sm">No care logged for today yet.</p>
              <small>Click one of the Quick Care Logger buttons above!</small>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((a) => (
                <div
                  key={a._id}
                  className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {a.activityType === 'feeding'
                        ? '🍖'
                        : a.activityType === 'medication'
                        ? '💊'
                        : a.activityType === 'walk'
                        ? '🐕'
                        : '📋'}
                    </span>
                    <div>
                      <h4 className="font-semibold text-sm">{a.title}</h4>
                      <p className="text-xs opacity-60">
                        Logged by {a.performedByName || 'User'} at{' '}
                        {new Date(a.completionTime || a.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                      Completed
                    </span>
                    <button
                      onClick={() => handleDeleteActivity(a._id)}
                      className="text-xs opacity-40 hover:opacity-100"
                      title="Move to Trash Bin"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pet Details / Vet Info Sidebar */}
        <section className="space-y-6">
          {pet && (
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{pet.avatar || '🐾'}</span>
                <div>
                  <h3 className="font-bold text-lg">{pet.name}</h3>
                  <p className="text-xs opacity-60">
                    {pet.species} · {pet.breed || 'Other'}
                  </p>
                </div>
              </div>

              {pet.vetInfo?.phone && (
                <div className="bg-indigo-950/40 border border-indigo-800/40 rounded-xl p-3 text-xs">
                  <div className="font-bold text-indigo-300 mb-1">
                    🩺 Vet Contact: {pet.vetInfo.name || 'Primary Vet'}
                  </div>
                  <div className="opacity-90">📞 {pet.vetInfo.phone}</div>
                  {pet.vetInfo.emergencyPhone && (
                    <div className="text-rose-300 font-semibold mt-1">
                      🚨 Emergency: {pet.vetInfo.emergencyPhone}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Pet Memories Gallery */}
      {pet && <PetMemories petId={pet._id} petName={pet.name} />}

      {/* Undo Action Toast */}
      {toastMessage && (
        <UndoToast
          message={toastMessage}
          onUndo={handleUndo}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Trash Bin Modal */}
      {pet && (
        <TrashBinModal
          petId={pet._id}
          isOpen={showTrashModal}
          onClose={() => setShowTrashModal(false)}
          onRestored={loadDashboardData}
        />
      )}
    </OwnerShell>
  );
}

