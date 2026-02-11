import Image from 'next/image';

type Size = 'sm' | 'md' | 'lg' | 'hero' | 'xl' | 'navTitle' | 'header';

const sizes: Record<Exclude<Size, 'header'>, number> = {
  sm: 48,
  md: 80,
  lg: 120,
  hero: 200,
  xl: 360,
  navTitle: 68,
};

/** Aspect ratio of logo-with-title.png (text below icon) */
const WITH_TITLE_ASPECT = 1.3;

export function AppLogo({
  size = 'md',
  variant = 'icon',
  className,
}: {
  size?: Size;
  variant?: 'icon' | 'withTitle';
  className?: string;
}) {
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
  if (size === 'navTitle') {
    return (
      <Image
        src="/cropped-title-pots.png"
        alt="POTS Companion"
        width={240}
        height={72}
        className={className ? `object-contain ${className}` : 'object-contain'}
        priority
      />
    );
  }
  const px = sizes[size];
  if (variant === 'withTitle') {
    const w = px;
    const h = Math.round(px * WITH_TITLE_ASPECT);
    return (
      <Image
        src="/logo-with-title.png"
        alt="POTS Companion"
        width={w}
        height={h}
        className={className ? `object-contain ${className}` : 'object-contain'}
        priority
      />
    );
  }
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
