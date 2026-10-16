/**
 * src/components/OnboardingModal.tsx
 *
 * Fast 30-second onboarding to pick interests once.
 * Unlocks the student's personalized "Top Picks" immediately.
 */

import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import { THEME, StudentInterest } from '../theme';

interface OnboardingModalProps {
  isOpen: boolean;
  initialInterests?: string[];
  onSaveInterests: (interests: string[]) => Promise<void>;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  initialInterests = [],
  onSaveInterests,
  onClose,
}) => {
  const [selected, setSelected] = useState<string[]>(initialInterests);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const toggleInterest = (interest: string) => {
    setSelected((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const applyPreset = (preset: string[]) => {
    setSelected(preset);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSaveInterests(selected);
      if (onClose) onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-[#0F2B5C] to-[#1E3A8A] text-white">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Tailor Your Campus Feed
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 leading-relaxed">
            Pick what matters to you. We filter out noise and surface your top 3–5 events
            ranked by relevance and nearest deadline.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Presets */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              Quick Picks:
            </span>
            <button
              onClick={() => applyPreset(['Coding', 'Robotics', 'Hackathons'])}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              💻 Tech & Dev
            </button>
            <button
              onClick={() => applyPreset(['Music', 'Dance', 'Design'])}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              🎨 Arts & Culture
            </button>
            <button
              onClick={() => applyPreset([...THEME.interests])}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              🌟 All
            </button>
          </div>

          {/* 10 Core Interest Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {THEME.interests.map((interest) => {
              const isChecked = selected.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                    isChecked
                      ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{interest}</span>
                  {isChecked ? (
                    <Check className="w-4 h-4 text-blue-600" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-300" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Info footer */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>{selected.length} interests selected</span>
            <span className="text-[11px] text-slate-400">Can change anytime in Settings</span>
          </div>

          {/* Submit */}
          <button
            onClick={handleSave}
            disabled={saving || selected.length === 0}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{saving ? 'Personalizing Feed...' : 'Save & Show My Top Picks'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
