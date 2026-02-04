import Image from 'next/image';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const sizes: Record<Size, number> = {
  sm: 48,
  md: 80,
  lg: 120,
  xl: 360,
};

export function AppLogo({ size = 'md', className }: { size?: Size; className?: string }) {
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
