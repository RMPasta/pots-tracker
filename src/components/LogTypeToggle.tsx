'use client';

type Mode = 'daily' | 'incident';

type LogTypeToggleProps = {
  value: Mode;
  onChange: (mode: Mode) => void;
};

export function LogTypeToggle({ value, onChange }: LogTypeToggleProps) {
  return (
    <div className="flex gap-2 rounded-full bg-card-bg p-1 shadow-(--shadow-soft)">
      <button
        type="button"
        onClick={() => onChange('incident')}
        className={`flex-1 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          value === 'incident'
            ? 'bg-btn-primary text-foreground-soft'
            : 'text-foreground-soft/80 hover:bg-btn-primary/50'
        }`}
      >
        Incident
      </button>
      <button
        type="button"
        onClick={() => onChange('daily')}
        className={`flex-1 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          value === 'daily'
            ? 'bg-btn-outline text-foreground-soft'
            : 'text-foreground-soft/80 hover:bg-btn-outline/50'
        }`}
      >
        Daily log
      </button>
    </div>
  );
}
