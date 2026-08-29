'use client';
import React, { useEffect, useState } from 'react';
import OwnerShell from '@/components/OwnerShell';

export default function PetsPage() {
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('dog');
  const [breed, setBreed] = useState('Golden Retriever');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [avatar, setAvatar] = useState('🐕');
  const [vetName, setVetName] = useState('');
  const [vetPhone, setVetPhone] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [feedingTimes, setFeedingTimes] = useState<string[]>(['08:00', '13:00', '19:00']);

  const loadPets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pets');
      const data = await res.json();
      if (data.success) {
        setPets(data.pets || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
  }, []);

  const handleOpenAdd = () => {
    setEditingPetId(null);
    setName('');
    setSpecies('dog');
    setBreed('Golden Retriever');
    setAge('');
    setWeight('');
    setAvatar('🐕');
    setVetName('');
    setVetPhone('');
    setEmergencyPhone('');
    setFeedingTimes(['08:00', '13:00', '19:00']);
    setShowModal(true);
  };

  const handleOpenEdit = (p: any) => {
    setEditingPetId(p._id);
    setName(p.name || '');
    setSpecies(p.species || 'dog');
    setBreed(p.breed || 'Other');
    setAge(p.age || '');
    setWeight(p.weight || '');
    setAvatar(p.avatar || '🐾');
    setVetName(p.vetInfo?.name || '');
    setVetPhone(p.vetInfo?.phone || '');
    setEmergencyPhone(p.vetInfo?.emergencyPhone || '');
    setFeedingTimes(p.feedingSchedule?.times || ['08:00', '13:00', '19:00']);
    setShowModal(true);
  };

  const handleSavePet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name,
      species,
      type: species,
      breed,
      age,
      weight,
      avatar,
      feedingSchedule: {
        times: feedingTimes,
      },
      vetInfo: {
        name: vetName,
        phone: vetPhone,
        emergencyPhone,
      },
    };

    try {
      if (editingPetId) {
        await fetch(`/api/pets/${editingPetId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/pets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setShowModal(false);
      loadPets();
    } catch (e) {
      console.error(e);
    }
  };

  const handleArchivePet = async (id: string) => {
    if (!confirm('Are you sure you want to archive this pet profile?')) return;
    try {
      await fetch(`/api/pets/${id}`, { method: 'DELETE' });
      loadPets();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <OwnerShell>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">My Pet Profiles</h2>
          <p className="text-xs opacity-60">Manage profiles, feeding schedules, and vet contacts</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary text-xs px-4 py-2">
          + Add New Pet
        </button>
      </div>

      {loading ? (
        <p className="text-xs opacity-50 py-6">Loading pets...</p>
      ) : pets.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-4xl">🐾</span>
          <h3 className="font-bold mt-2">No Pets Registered Yet</h3>
          <p className="text-xs opacity-60 mt-1 mb-4">Add your first pet to start daily care logging!</p>
          <button onClick={handleOpenAdd} className="btn btn-primary text-xs px-4 py-2 mx-auto">
            + Register Pet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((p) => (
            <div key={p._id} className="card relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{p.avatar || '🐾'}</span>
                  <div>
                    <h3 className="font-bold text-lg">{p.name}</h3>
                    <p className="text-xs opacity-75 capitalize">
                      {p.species || p.type} · {p.breed || 'Other'}
                    </p>
                  </div>
                </div>
                <div className="space-y-1 text-xs opacity-80 mt-2">
                  <p>⚖️ Weight: {p.weight || 'Not recorded'}</p>
                  <p>🍖 Daily Meals: {p.feedingSchedule?.times?.length || 3} times/day</p>
                  {p.vetInfo?.name && <p>🩺 Vet: {p.vetInfo.name} ({p.vetInfo.phone || 'No phone'})</p>}
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-3 border-t border-slate-700/50">
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  ✎ Edit Profile
                </button>
                <button
                  onClick={() => handleArchivePet(p._id)}
                  className="text-xs text-rose-400 hover:text-rose-300"
                >
                  Archive
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Pet Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl my-8">
            <h3 className="text-lg font-bold mb-4">
              {editingPetId ? `Edit Profile: ${name}` : 'Register New Pet'}
            </h3>
            <form onSubmit={handleSavePet} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Pet Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Avatar Emoji</label>
                  <select
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
                  >
                    <option value="🐕">🐕 Dog</option>
                    <option value="🐈">🐈 Cat</option>
                    <option value="🦜">🦜 Bird</option>
                    <option value="🐇">🐇 Rabbit</option>
                    <option value="🐟">🐟 Fish</option>
                    <option value="🐾">🐾 Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Species</label>
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
                  >
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="bird">Bird</option>
                    <option value="rabbit">Rabbit</option>
                    <option value="fish">Fish</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Breed</label>
                  <input
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Age</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 years"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Weight</label>
                  <input
                    type="text"
                    placeholder="e.g. 14.5 kg"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
                  />
                </div>
              </div>

              {/* Vet Contact Info */}
              <div className="border-t border-slate-800 pt-3">
                <h4 className="font-bold text-xs text-indigo-400 mb-2">🩺 Veterinarian Contact</h4>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <input
                    type="text"
                    placeholder="Vet / Clinic Name"
                    value={vetName}
                    onChange={(e) => setVetName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Primary Phone"
                    value={vetPhone}
                    onChange={(e) => setVetPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Emergency Hotline Phone"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs rounded-lg border border-slate-700 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary text-xs px-4 py-2">
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </OwnerShell>
  );
}

