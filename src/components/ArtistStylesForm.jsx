// ArtistStylesForm.jsx
// Reusable form for artist specialty/style selection — all fields are optional.
//
// Three-state chip logic per item in each multi-select group:
//   Unselected  → click → Selected (blue)        "I can do this"
//   Selected    → click → Specialty (amber ★)    "This is my specialty" (max 2 per group)
//   Specialty   → click → Unselected              (removes entirely)
//
// Bug fix: if 2 specialties already exist and a blue (regular) chip is clicked,
// it is simply deselected rather than erroring.

import React from 'react';
import { Star } from 'lucide-react';
import {
  INK_SPECIALTIES,
  DESIGN_SPECIALTIES,
  STYLES,
  SUBJECTS,
} from '../constants/tattooCategories';

export const EMPTY_ARTIST_STYLES = {
  inkSpecialty: '',
  designSpecialty: '',
  styles: [],
  styleSpecialties: [],
  subjects: [],
  subjectSpecialties: [],
};

const ArtistStylesForm = ({ value, onChange }) => {
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
      // Blue chip:
      //   - If fewer than 2 specialties → promote to specialty
      //   - If already 2 specialties → just deselect (remove from regular)
      if (specialties.length < 2) {
        update({ [specialtiesKey]: [...specialties, item] });
      } else {
        update({ [selectedKey]: selected.filter(s => s !== item) });
      }
    } else {
      // Unselected → add as regular
      update({ [selectedKey]: [...selected, item] });
    }
  };

  const handleSingleToggle = (key, val) => {
    update({ [key]: value[key] === val ? '' : val });
  };

  const SingleSelect = ({ fieldKey, options, label, hint }) => (
    <div className="mb-5">
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-0.5">{label}</label>
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
    </div>
  );

  const SpecialtyGroup = ({ label, options, selectedKey, specialtiesKey }) => {
    const selected = value[selectedKey] || [];
    const specialties = value[specialtiesKey] || [];

    return (
      <div className="mb-5">
        <div className="flex flex-wrap items-baseline justify-between gap-1 mb-1">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
          <span className="text-xs text-gray-400 italic">tap once = can do &nbsp;·&nbsp; tap again = ★ specialty (<strong>max 2</strong>)</span>
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
      <SpecialtyGroup
        label="Style"
        options={STYLES}
        selectedKey="styles"
        specialtiesKey="styleSpecialties"
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
