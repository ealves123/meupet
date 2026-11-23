import { useState } from 'react';
import type { Pet, Size, Species } from '../lib/types';
import { SIZES, SIZE_LABEL, SPECIES_LABEL } from '../lib/labels';

export function PetForm({ initial, onSave, submitLabel = 'Salvar pet' }: { initial?: Partial<Pet>; onSave: (p: Omit<Pet, 'id'> & { id?: string }) => void; submitLabel?: string }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [species, setSpecies] = useState<Species>(initial?.species ?? 'cao');
  const [size, setSize] = useState<Size>(initial?.size ?? 'medio');
  const [breed, setBreed] = useState(initial?.breed ?? '');
  return (
    <form className="form" onSubmit={e => { e.preventDefault(); if (name.trim()) onSave({ id: initial?.id, name: name.trim(), species, size, breed: breed.trim() || undefined }); }}>
      <label>Nome do pet<input required value={name} onChange={e => setName(e.target.value)} placeholder="Ex.: Thor" autoComplete="off" /></label>
      <fieldset><legend>Espécie</legend>
        <div className="chips">{(Object.keys(SPECIES_LABEL) as Species[]).map(x => <button type="button" key={x} className={`chip small${species === x ? ' on' : ''}`} onClick={() => setSpecies(x)}>{SPECIES_LABEL[x]}</button>)}</div>
      </fieldset>
      <label>Porte
        <select value={size} onChange={e => setSize(e.target.value as Size)}>{SIZES.map(x => <option key={x} value={x}>{SIZE_LABEL[x]}</option>)}</select>
      </label>
      <label>Raça <span className="muted">(opcional)</span><input value={breed} onChange={e => setBreed(e.target.value)} placeholder="Ex.: Shih-tzu" /></label>
      <button className="btn" type="submit">{submitLabel}</button>
    </form>
  );
}
