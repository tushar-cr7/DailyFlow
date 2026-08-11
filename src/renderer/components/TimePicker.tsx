import React, { useState, useEffect, useRef } from 'react';
import { normalizeTimeString } from '@shared/utils/date';

interface TimePickerProps {
  value: string; // "HH:mm" or ""
  onChange: (time: string) => void;
  id?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  id = 'task-time-input',
}) => {
  const [inputText, setInputText] = useState(value || '');
  const nativeInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setInputText(value || '');
  }, [value]);

  const parts = value && value.includes(':') ? value.split(':') : ['', ''];
  const currentHour = parts[0] ? parts[0].padStart(2, '0') : '';
  const currentMinute = parts[1] ? parts[1].padStart(2, '0') : '';

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

  const handleTextChange = (raw: string) => {
    setInputText(raw);
    const normalized = normalizeTimeString(raw);
    if (normalized) {
      onChange(normalized);
    } else if (raw.trim() === '') {
      onChange('');
    }
  };

  const handleBlur = () => {
    if (!inputText.trim()) {
      onChange('');
      setInputText('');
      return;
    }
    const normalized = normalizeTimeString(inputText);
    if (normalized) {
      onChange(normalized);
      setInputText(normalized);
    } else {
      // Revert to canonical value if typed text is invalid
      setInputText(value || '');
    }
  };

  const handleHourChange = (newHour: string) => {
    if (!newHour) {
      onChange('');
      setInputText('');
      return;
    }
    const min = currentMinute || '00';
    const val = `${newHour}:${min}`;
    onChange(val);
    setInputText(val);
  };

  const handleMinuteChange = (newMin: string) => {
    const hr = currentHour || '09';
    const val = `${hr}:${newMin}`;
    onChange(val);
    setInputText(val);
  };

  const handlePresetSelect = (presetVal: string) => {
    onChange(presetVal);
    setInputText(presetVal);
  };

  const handleClear = () => {
    onChange('');
    setInputText('');
  };

  const handleOpenNativePicker = () => {
    const elem = nativeInputRef.current;
    if (elem) {
      try {
        const pickerElem = elem as HTMLInputElement & { showPicker?: () => void };
        if (typeof pickerElem.showPicker === 'function') {
          pickerElem.showPicker();
        } else {
          elem.focus();
          elem.click();
        }
      } catch {
        elem.focus();
      }
    }
  };

  return (
    <div className="space-y-2">
      {/* Primary Input Row */}
      <div className="flex items-center gap-2">
        {/* Hidden/Overlay Native Input for Native Clock Popup */}
        <input
          ref={nativeInputRef}
          type="time"
          value={value || ''}
          onChange={(e) => {
            const val = e.target.value;
            onChange(val);
            setInputText(val);
          }}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
        />

        {/* Text Input Field for direct typing or visual display */}
        <div className="relative flex-1">
          <input
            id={id}
            type="text"
            value={inputText}
            onChange={(e) => handleTextChange(e.target.value)}
            onBlur={handleBlur}
            placeholder="e.g. 09:30 or 2:30pm"
            className="w-full rounded-xl border border-white/15 bg-slate-950/80 px-3.5 py-2.5 pr-9 text-xs text-slate-100 font-mono font-bold focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all backdrop-blur-md placeholder:text-slate-600 placeholder:font-sans"
          />
          <button
            type="button"
            onClick={handleOpenNativePicker}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-300 transition-colors p-1"
            title="Open native clock picker"
          >
            🕘
          </button>
        </div>

        {/* Quick Dropdown Selectors for Hours and Minutes */}
        <div className="flex items-center gap-1.5 shrink-0">
          <select
            value={currentHour}
            onChange={(e) => handleHourChange(e.target.value)}
            aria-label="Select hour"
            className="rounded-xl border border-white/15 bg-slate-950/80 px-2 py-2.5 text-xs font-mono font-bold text-slate-100 focus:border-indigo-400 focus:outline-none backdrop-blur-md cursor-pointer hover:bg-slate-900"
          >
            <option value="" className="bg-slate-900 text-slate-400">HH</option>
            {hours.map((h) => (
              <option key={h} value={h} className="bg-slate-900 text-slate-200">
                {h}h
              </option>
            ))}
          </select>

          <span className="text-slate-400 font-bold text-xs">:</span>

          <select
            value={currentMinute}
            onChange={(e) => handleMinuteChange(e.target.value)}
            aria-label="Select minute"
            className="rounded-xl border border-white/15 bg-slate-950/80 px-2 py-2.5 text-xs font-mono font-bold text-slate-100 focus:border-indigo-400 focus:outline-none backdrop-blur-md cursor-pointer hover:bg-slate-900"
          >
            <option value="" className="bg-slate-900 text-slate-400">MM</option>
            {minutes.map((m) => (
              <option key={m} value={m} className="bg-slate-900 text-slate-200">
                {m}m
              </option>
            ))}
          </select>

          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="px-2.5 py-2.5 rounded-xl border border-white/15 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-rose-900/40 hover:border-rose-500/50 text-xs font-bold transition-all active:scale-95"
              title="Clear scheduled time"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Quick Time Preset Pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { label: '09:00', val: '09:00' },
          { label: '12:00', val: '12:00' },
          { label: '14:00', val: '14:00' },
          { label: '18:00', val: '18:00' },
          { label: '20:00', val: '20:00' },
        ].map((preset) => (
          <button
            key={preset.val}
            type="button"
            onClick={() => handlePresetSelect(preset.val)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all active:scale-95 ${
              value === preset.val
                ? 'bg-indigo-500/30 border-indigo-400 text-indigo-200 shadow-sm'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/15 hover:text-white'
            }`}
          >
            ⏰ {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};
