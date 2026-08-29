'use client';
import React, { useState, useEffect } from 'react';
import OwnerShell from '@/components/OwnerShell';

export default function ReportsPage() {
  const [pet, setPet] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const petsRes = await fetch('/api/pets');
      const petsData = await petsRes.json();
      if (petsData.success && petsData.pets?.length > 0) {
        const savedId = localStorage.getItem('petcare_active_pet_id');
        const currentPet = petsData.pets.find((p: any) => p._id === savedId) || petsData.pets[0];
        setPet(currentPet);

        if (currentPet) {
          const actRes = await fetch(`/api/activities?petId=${currentPet._id}`);
          const actData = await actRes.json();
          if (actData.success) {
            setActivities(actData.activities || []);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('pet-changed', loadData);
    return () => window.removeEventListener('pet-changed', loadData);
  }, []);

  const exportTextLog = () => {
    if (!pet || activities.length === 0) return;
    let content = `PETCARE LOG EXPORT\nPet: ${pet.name} (${pet.species || 'dog'})\nGenerated: ${new Date().toLocaleString()}\n----------------------------------------\n\n`;

    activities.forEach((a) => {
      content += `[${new Date(a.createdAt).toLocaleString()}] ${a.title} (Logged by: ${a.performedByName || 'User'})\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pet.name}_care_log_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

  const exportCSV = () => {
    if (!pet || activities.length === 0) return;
    let csv = 'ID,Date,Title,Type,LoggedBy,Notes\n';

    activities.forEach((a) => {
      const title = `"${(a.title || '').replace(/"/g, '""')}"`;
      const notes = `"${(a.notes || '').replace(/"/g, '""')}"`;
      csv += `${a._id},${new Date(a.createdAt).toISOString()},${title},${a.activityType},${a.performedByName || 'User'},${notes}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pet.name}_care_log_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const printHandoffPlan = () => {
    window.print();
  };

  return (
    <OwnerShell>
      <div className="mb-6">
        <h2 className="text-xl font-bold">Care Reports & Export Hub</h2>
        <p className="text-xs opacity-60">
          Export activity logs and generate printable handoff plans for {pet?.name || 'your pet'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center p-6 flex flex-col justify-between">
          <div>
            <span className="text-4xl">📄</span>
            <h3 className="font-bold text-base mt-2">Export Plain Text Log</h3>
            <p className="text-xs opacity-60 mt-1 mb-4">
              Download a clean `.txt` summary ideal for emailing to your veterinarian or pet sitter.
            </p>
          </div>
          <button onClick={exportTextLog} className="btn btn-primary text-xs w-full py-2.5">
            Download .TXT Log
          </button>
        </div>

        <div className="card text-center p-6 flex flex-col justify-between">
          <div>
            <span className="text-4xl">📊</span>
            <h3 className="font-bold text-base mt-2">Export CSV Spreadsheet</h3>
            <p className="text-xs opacity-60 mt-1 mb-4">
              Download structured data to view in Excel, Google Sheets, or custom tracking tools.
            </p>
          </div>
          <button onClick={exportCSV} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg w-full py-2.5 transition-colors">
            Download .CSV Spreadsheet
          </button>
        </div>

        <div className="card text-center p-6 flex flex-col justify-between">
          <div>
            <span className="text-4xl">🖨️</span>
            <h3 className="font-bold text-base mt-2">Print Caretaker Handoff</h3>
            <p className="text-xs opacity-60 mt-1 mb-4">
              Generate a print-ready today-only care plan to hand off in person to caretakers.
            </p>
          </div>
          <button onClick={printHandoffPlan} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg w-full py-2.5 transition-colors">
            Print / Save as PDF
          </button>
        </div>
      </div>
    </OwnerShell>
  );
}

