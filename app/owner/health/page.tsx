'use client';
import React, { useState, useEffect } from 'react';
import OwnerShell from '@/components/OwnerShell';

export default function HealthPage() {
  const [pet, setPet] = useState<any>(null);
  const [weightRecords, setWeightRecords] = useState<any[]>([]);
  const [vaccinationRecords, setVaccinationRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightKg, setWeightKg] = useState('');
  const [weightNotes, setWeightNotes] = useState('');

  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [vaccineName, setVaccineName] = useState('');
  const [administeredOn, setAdministeredOn] = useState(new Date().toISOString().split('T')[0]);
  const [nextDueOn, setNextDueOn] = useState('');

  const loadHealthData = async () => {
    setLoading(true);
    try {
      const petsRes = await fetch('/api/pets');
      const petsData = await petsRes.json();
      if (petsData.success && petsData.pets?.length > 0) {
        const savedId = localStorage.getItem('petcare_active_pet_id');
        const currentPet = petsData.pets.find((p: any) => p._id === savedId) || petsData.pets[0];
        setPet(currentPet);

        if (currentPet) {
          // Fetch weight records
          const wRes = await fetch(`/api/health?petId=${currentPet._id}&recordType=weight`);
          const wData = await wRes.json();
          if (wData.success) setWeightRecords(wData.records || []);

          // Fetch vaccination records
          const vRes = await fetch(`/api/health?petId=${currentPet._id}&recordType=vaccination`);
          const vData = await vRes.json();
          if (vData.success) setVaccinationRecords(vData.records || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealthData();
    window.addEventListener('pet-changed', loadHealthData);
    return () => window.removeEventListener('pet-changed', loadHealthData);
  }, []);

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightKg || !pet) return;

    try {
      await fetch('/api/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petId: pet._id,
          recordType: 'weight',
          weightKg: parseFloat(weightKg),
          notes: weightNotes,
        }),
      });

      // Update pet weight string
      await fetch(`/api/pets/${pet._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight: `${weightKg} kg` }),
      });

      setWeightKg('');
      setWeightNotes('');
      setShowWeightModal(false);
      loadHealthData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddVaccine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaccineName || !pet) return;

    try {
      await fetch('/api/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petId: pet._id,
          recordType: 'vaccination',
          vaccinationName: vaccineName,
          administeredOn,
          nextDueOn,
        }),
      });

      setVaccineName('');
      setNextDueOn('');
      setShowVaccineModal(false);
      loadHealthData();
    } catch (e) {
      console.error(e);
    }
  };

  // 5% Weight Swing Calculation
  let weightAlert: string | null = null;
  if (weightRecords.length >= 2) {
    const latest = weightRecords[0].weightKg;
    const previous = weightRecords[1].weightKg;
    if (latest && previous) {
      const diff = Math.abs(latest - previous);
      const percentChange = (diff / previous) * 100;
      if (percentChange >= 5) {
        weightAlert = `⚠️ Swing Alert: Weight shifted by ${percentChange.toFixed(1)}% between last 2 readings (${previous}kg ➔ ${latest}kg). Mention this to your vet.`;
      }
    }
  }

  // Vaccination Due Status Helper
  const getVaccineStatus = (dueDateStr?: string) => {
    if (!dueDateStr) return { label: 'Recorded', class: 'bg-slate-700 text-slate-200' };
    const today = new Date();
    const dueDate = new Date(dueDateStr);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (diffDays < 0) return { label: 'Overdue', class: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
    if (diffDays <= 30) return { label: `Due soon (${diffDays}d)`, class: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    return { label: 'Up to Date', class: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
  };

  return (
    <OwnerShell>
      <div className="mb-6">
        <h2 className="text-xl font-bold">Health & Medical Tracker</h2>
        <p className="text-xs opacity-60">
          Track weight history, swing alerts, and core vaccination due dates for {pet?.name || 'your pet'}
        </p>
      </div>

      {weightAlert && (
        <div className="bg-rose-500/15 border-l-4 border-rose-500 text-rose-200 p-4 rounded-r-xl mb-6 text-xs font-medium">
          {weightAlert}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Log Section */}
        <section className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">⚖️ Weight Tracker</h3>
            <button
              onClick={() => setShowWeightModal(true)}
              className="btn btn-primary text-xs"
            >
              + Log Weight
            </button>
          </div>

          {weightRecords.length === 0 ? (
            <p className="text-xs opacity-50 py-6 text-center">No weight readings recorded.</p>
          ) : (
            <div className="space-y-3">
              {weightRecords.map((w) => (
                <div
                  key={w._id}
                  className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl text-xs"
                >
                  <div>
                    <span className="font-bold text-base text-indigo-300">
                      {w.weightKg} kg
                    </span>
                    {w.notes && <p className="opacity-70 mt-0.5">{w.notes}</p>}
                  </div>
                  <span className="opacity-60 font-mono">{w.date}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Vaccinations Section */}
        <section className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">💉 Vaccinations</h3>
            <button
              onClick={() => setShowVaccineModal(true)}
              className="btn btn-primary text-xs"
            >
              + Record Vaccine
            </button>
          </div>

          {vaccinationRecords.length === 0 ? (
            <p className="text-xs opacity-50 py-6 text-center">No vaccinations recorded.</p>
          ) : (
            <div className="space-y-3">
              {vaccinationRecords.map((v) => {
                const status = getVaccineStatus(v.nextDueOn);
                return (
                  <div
                    key={v._id}
                    className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-sm">{v.vaccinationName}</h4>
                      <p className="opacity-60 mt-0.5">
                        Administered: {v.administeredOn}
                        {v.nextDueOn && ` · Next Due: ${v.nextDueOn}`}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold border px-2 py-0.5 rounded ${status.class}`}
                    >
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Log Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Log Weight for {pet?.name}</h3>
            <form onSubmit={handleAddWeight} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Weight (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 14.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. After morning walk"
                  value={weightNotes}
                  onChange={(e) => setWeightNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWeightModal(false)}
                  className="px-4 py-2 text-xs rounded-lg border border-slate-700 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary text-xs px-4 py-2">
                  Save Weight
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Vaccine Modal */}
      {showVaccineModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Record Vaccination for {pet?.name}</h3>
            <form onSubmit={handleAddVaccine} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Vaccine Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rabies, DHPP, Bordetella"
                  value={vaccineName}
                  onChange={(e) => setVaccineName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Date Administered</label>
                <input
                  type="date"
                  value={administeredOn}
                  onChange={(e) => setAdministeredOn(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Next Due Date (Optional)</label>
                <input
                  type="date"
                  value={nextDueOn}
                  onChange={(e) => setNextDueOn(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVaccineModal(false)}
                  className="px-4 py-2 text-xs rounded-lg border border-slate-700 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary text-xs px-4 py-2">
                  Save Vaccine Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </OwnerShell>
  );
}

