export default function HistoryLoading() {
  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <div className="h-14 animate-pulse rounded-2xl bg-white/60 dark:bg-pastel-purple/10" />
      <div className="h-8 w-24 animate-pulse rounded bg-white/60 dark:bg-pastel-purple/10" />
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-2xl bg-white/60 dark:bg-pastel-purple/10"
          />
        ))}
      </div>
    </div>
  );
}
