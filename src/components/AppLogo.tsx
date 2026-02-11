import Image from 'next/image';

type Size = 'sm' | 'md' | 'lg' | 'hero' | 'xl' | 'header';

const sizes: Record<Exclude<Size, 'header'>, number> = {
  sm: 48,
  md: 80,
  lg: 120,
  hero: 200,
  xl: 360,
};

export function AppLogo({ size = 'md', className }: { size?: Size; className?: string }) {
  if (size === 'header') {
    return (
      <div className="flex shrink-0 items-center justify-center rounded-[4px]">
        <Image
          src="/logo.png"
          alt="POTS Companion"
          width={72}
          height={72}
          className="object-cover"
          priority
        />
      </div>
    );
  }
  const px = sizes[size];
  return (
    <Image
      src="/logo.png"
      alt="POTS Companion"
      width={px}
      height={px}
      className={className ? `object-cover ${className}` : 'object-cover'}
      priority
    />
  );
}
