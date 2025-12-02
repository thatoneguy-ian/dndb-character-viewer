import * as React from 'react';

export interface IconProps {
  className?: string;
  title?: string;
}

// Import inline icon components (tintable via CSS `color` when using `fill="currentColor"`)
import BlindedIcon from './icons/BlindedIcon';
import CharmedIcon from './icons/CharmedIcon';
import DeafenedIcon from './icons/DeafenedIcon';
import FrightenedIcon from './icons/FrightenedIcon';
import GrappledIcon from './icons/GrappledIcon';
import IncapacitatedIcon from './icons/IncapacitatedIcon';
import InvisibleIcon from './icons/InvisibleIcon';
import ParalyzedIcon from './icons/ParalyzedIcon';
import PetrifiedIcon from './icons/PetrifiedIcon';
import PoisonedIcon from './icons/PoisonedIcon';
import ProneIcon from './icons/ProneIcon';
import RestrainedIcon from './icons/RestrainedIcon';
import StunnedIcon from './icons/StunnedIcon';
import UnconsciousIcon from './icons/UnconsciousIcon';

export {
  BlindedIcon,
  CharmedIcon,
  DeafenedIcon,
  FrightenedIcon,
  GrappledIcon,
  IncapacitatedIcon,
  InvisibleIcon,
  ParalyzedIcon,
  PetrifiedIcon,
  PoisonedIcon,
  ProneIcon,
  RestrainedIcon,
  StunnedIcon,
  UnconsciousIcon,
};

const ICON_MAP: Record<string, (props: React.SVGProps<SVGSVGElement>) => React.ReactElement> = {
  blinded: BlindedIcon,
  charmed: CharmedIcon,
  deafened: DeafenedIcon,
  frightened: FrightenedIcon,
  grappled: GrappledIcon,
  incapacitated: IncapacitatedIcon,
  invisible: InvisibleIcon,
  paralyzed: ParalyzedIcon,
  petrified: PetrifiedIcon,
  poisoned: PoisonedIcon,
  prone: ProneIcon,
  restrained: RestrainedIcon,
  stunned: StunnedIcon,
  unconscious: UnconsciousIcon,
};

export function ConditionIcon({ name, className, title }: { name: string } & IconProps) {
  const key = name.toLowerCase();
  const Icon = ICON_MAP[key];
  if (Icon) {
    if (title) return (
      <Icon className={className}>
        <title>{title}</title>
      </Icon>
    );
    return <Icon className={className} />;
  }

  // fallback to loading the raw asset (keeps backwards compatibility)
  const fileName = key;
  const src = new URL(`../../assets/conditions/${fileName}.svg`, import.meta.url).href;
  return (
    <img
      src={src}
      alt={title || name}
      title={title || name}
      className={className}
      style={{ width: '1.25rem', height: '1.25rem', objectFit: 'contain', color: 'currentColor' }}
      aria-hidden={title ? undefined : true}
    />
  );
}

export default ConditionIcon;
