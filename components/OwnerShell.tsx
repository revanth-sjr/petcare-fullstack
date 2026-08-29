'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import AiAssistantChat from './AiAssistantChat';

const links = ['Dashboard', 'Pets', 'Health', 'Appointments', 'Care Team', 'Reports', 'Settings'];

export default function OwnerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pets, setPets] = useState<any[]>([]);
  const [activePet, setActivePet] = useState<any>(null);

  useEffect(() => {
    async function loadPets() {
      try {
        const res = await fetch('/api/pets');
        const data = await res.json();
        if (data.success && data.pets?.length > 0) {
          setPets(data.pets);
          // Set active pet from localStorage or first pet
          const savedId = localStorage.getItem('petcare_active_pet_id');
          const found = data.pets.find((p: any) => p._id === savedId) || data.pets[0];
          setActivePet(found);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadPets();
  }, []);

  const handleSelectPet = (petId: string) => {
    const selected = pets.find((p) => p._id === petId);
    if (selected) {
      setActivePet(selected);
      localStorage.setItem('petcare_active_pet_id', petId);
      // Trigger a custom event so child pages re-fetch for new pet
      window.dispatchEvent(new Event('pet-changed'));
    }
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand flex items-center justify-between">
          <span>🐾 PetCare</span>
        </div>

        {/* Pet Switcher */}
        {pets.length > 0 && (
          <div className="my-4 px-2">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Active Pet
            </label>
            <select
              value={activePet?._id || ''}
              onChange={(e) => handleSelectPet(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-xs rounded-lg p-2 font-medium text-white focus:outline-none focus:border-indigo-500"
            >
              {pets.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.avatar || '🐾'} {p.name} ({p.species || p.type})
                </option>
              ))}
            </select>
          </div>
        )}

        <nav className="nav">
          {links.map((x) => {
            const href = '/owner/' + x.toLowerCase().replaceAll(' ', '-');
            const isActive = pathname === href;
            return (
              <Link
                key={x}
                href={href}
                className={isActive ? 'font-bold text-indigo-400 bg-slate-800/80 px-3 py-2 rounded-lg' : 'px-3 py-2'}
              >
                {x}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="content">
        <div className="top flex justify-between items-center mb-6">
          <div>
            <small className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
              OWNER PORTAL
            </small>
            <h1 className="text-2xl font-bold">
              {activePet ? `${activePet.name}'s Care Overview` : 'PetCare Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>

        {children}

        {/* Floating Gemini AI Assistant */}
        <AiAssistantChat pet={activePet} />
      </main>
    </div>
  );
}

