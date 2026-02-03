'use client';

export type Mode = 'incident' | 'daily' | 'insights' | 'export';

type LogTypeToggleProps = {
  value: Mode;
  onChange: (mode: Mode) => void;
};

const OPTIONS: { value: Mode; label: string }[] = [
  { value: 'incident', label: 'Incident' },
  { value: 'daily', label: 'Daily log' },
  { value: 'insights', label: 'Insights' },
  { value: 'export', label: 'Export' },
];

export function LogTypeToggle({ value, onChange }: LogTypeToggleProps) {
  return (
    <div className="flex flex-wrap gap-1.5 rounded-2xl bg-card-bg p-1.5 shadow-(--shadow-soft)">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors ${
            value === opt.value
              ? opt.value === 'incident'
                ? 'bg-btn-primary text-foreground-soft'
                : 'bg-btn-outline text-foreground-soft'
              : 'text-foreground-soft/80 hover:bg-btn-outline/50'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
