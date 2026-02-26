// ArtistStylesForm.jsx
// Reusable form for artist specialty/style selection used in both Signup and ProfilePage.
//
// Three-state chip logic per item in each multi-select group:
//   Unselected  → click → Selected (blue)   "I can do this"
//   Selected    → click → Specialty (amber ★) "This is my specialty" (max 2 per group)
//   Specialty   → click → Unselected         (removes entirely)
//
// inkSpecialty and designSpecialty are simple required single-selects.

import React, { useState } from 'react';
import { Star, AlertCircle } from 'lucide-react';
import {
  INK_SPECIALTIES,
  DESIGN_SPECIALTIES,
  FOUNDATIONAL_STYLES,
  TECHNIQUES,
  SUBJECTS,
} from '../constants/tattooCategories';

// value shape:
// {
//   inkSpecialty: string,
//   designSpecialty: string,
//   foundationalStyles: string[],
//   foundationalStyleSpecialties: string[],
//   techniques: string[],
//   techniqueSpecialties: string[],
//   subjects: string[],
//   subjectSpecialties: string[],
// }
export const EMPTY_ARTIST_STYLES = {
  inkSpecialty: '',
  designSpecialty: '',
  foundationalStyles: [],
  foundationalStyleSpecialties: [],
  techniques: [],
  techniqueSpecialties: [],
  subjects: [],
  subjectSpecialties: [],
};

const ArtistStylesForm = ({ value, onChange }) => {
  const [chipError, setChipError] = useState('');

  const update = (patch) => onChange({ ...value, ...patch });

  const handleChipToggle = (item, selectedKey, specialtiesKey) => {
    const selected = value[selectedKey] || [];
    const specialties = value[specialtiesKey] || [];

    if (specialties.includes(item)) {
      // Gold chip → remove entirely
      update({
        [selectedKey]: selected.filter(s => s !== item),
        [specialtiesKey]: specialties.filter(s => s !== item),
      });
    } else if (selected.includes(item)) {
      // Blue chip → try to promote to specialty
      if (specialties.length >= 2) {
        setChipError('Max 2 specialties per group — click a ★ chip to remove it first.');
        setTimeout(() => setChipError(''), 4000);
        return;
      }
      update({ [specialtiesKey]: [...specialties, item] });
    } else {
      // Unselected → add as regular
      update({ [selectedKey]: [...selected, item] });
    }
  };

  // Single-select toggle (inkSpecialty, designSpecialty)
  const handleSingleToggle = (key, val) => {
    update({ [key]: value[key] === val ? '' : val });
  };

  const SingleSelect = ({ fieldKey, options, label, hint }) => (
    <div className="mb-5">
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-0.5">
        {label} <span className="text-red-500">*</span>
      </label>
      {hint && <p className="text-xs text-gray-400 italic mb-2">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => handleSingleToggle(fieldKey, opt)}
            className={`px-3 py-1.5 text-sm rounded-full border font-medium transition-colors ${
              value[fieldKey] === opt
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {!value[fieldKey] && (
        <p className="text-xs text-red-500 mt-1">Required — please select one</p>
      )}
    </div>
  );

  const SpecialtyGroup = ({ label, options, selectedKey, specialtiesKey }) => {
    const selected = value[selectedKey] || [];
    const specialties = value[specialtiesKey] || [];

    return (
      <div className="mb-5">
        <div className="flex flex-wrap items-baseline justify-between gap-1 mb-1">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
          <span className="text-xs text-gray-400 italic">tap once = can do &nbsp;·&nbsp; tap again = ★ specialty (max 2)</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {options.map(opt => {
            const isSpecialty = specialties.includes(opt);
            const isSelected = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleChipToggle(opt, selectedKey, specialtiesKey)}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border font-medium transition-all ${
                  isSpecialty
                    ? 'bg-amber-400 text-white border-amber-400 shadow-sm'
                    : isSelected
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                }`}
              >
                {isSpecialty && <Star size={9} fill="currentColor" />}
                {opt}
              </button>
            );
          })}
        </div>
        {specialties.length === 0 && (
          <p className="text-xs text-amber-600 mt-1">Tap a chip twice to mark your specialty (at least 1 required)</p>
        )}
      </div>
    );
  };

  return (
    <div>
      <SingleSelect
        fieldKey="inkSpecialty"
        options={INK_SPECIALTIES}
        label="Ink Specialty"
        hint="Your specialty — not a restriction on what you can do."
      />
      <SingleSelect
        fieldKey="designSpecialty"
        options={DESIGN_SPECIALTIES}
        label="Design Specialty"
        hint="Your specialty — not a restriction on what you can do."
      />

      {chipError && (
        <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700 mb-4">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          {chipError}
        </div>
      )}

      <SpecialtyGroup
        label="Foundational Style"
        options={FOUNDATIONAL_STYLES}
        selectedKey="foundationalStyles"
        specialtiesKey="foundationalStyleSpecialties"
      />
      <SpecialtyGroup
        label="Technique / Finish"
        options={TECHNIQUES}
        selectedKey="techniques"
        specialtiesKey="techniqueSpecialties"
      />
      <SpecialtyGroup
        label="Subject"
        options={SUBJECTS}
        selectedKey="subjects"
        specialtiesKey="subjectSpecialties"
      />
    </div>
  );
};

export default ArtistStylesForm;
