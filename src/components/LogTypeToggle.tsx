'use client';

type Mode = 'daily' | 'incident';

type LogTypeToggleProps = {
  value: Mode;
  onChange: (mode: Mode) => void;
};

export function LogTypeToggle({ value, onChange }: LogTypeToggleProps) {
  return (
    <div className="flex gap-2 rounded-full bg-white/80 p-1 shadow-(--shadow-soft) dark:bg-pastel-purple/10">
      <button
        type="button"
        onClick={() => onChange('daily')}
        className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          value === 'daily'
            ? 'bg-pastel-pink text-foreground-soft'
            : 'text-foreground-soft/80 hover:bg-pastel-pink/20'
        }`}
      >
        Daily log
      </button>
      <button
        type="button"
        onClick={() => onChange('incident')}
        className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          value === 'incident'
            ? 'bg-pastel-purple text-foreground-soft'
            : 'text-foreground-soft/80 hover:bg-pastel-purple/20'
        }`}
      >
        Incident
      </button>
    </div>
  );
}
