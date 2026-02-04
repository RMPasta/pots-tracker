import Image from 'next/image';

type Size = 'sm' | 'md' | 'lg' | 'xl' | 'header';

const sizes: Record<Exclude<Size, 'header'>, number> = {
  sm: 48,
  md: 80,
  lg: 120,
  xl: 360,
};

export function AppLogo({ size = 'md', className }: { size?: Size; className?: string }) {
  if (size === 'header') {
    return (
      <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[4px]">
        <Image
          src="/logo.png"
          alt="POTS Tracker"
          width={96}
          height={96}
          className="scale-[1.34] object-center"
          priority
        />
      </div>
    );
  }
  const px = sizes[size];
  return (
    <Image
      src="/logo.png"
      alt="POTS Tracker"
      width={px}
      height={px}
      className={className}
      priority
    />
  );
}
