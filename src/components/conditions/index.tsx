import { CONDITION_SVGS } from '../../assets/conditions-svgs';

export interface IconProps {
  className?: string;
  title?: string;
}

export function ConditionIcon({ name, className, title }: { name: string } & IconProps) {
  const key = name.toLowerCase().replace(/\s+/g, '-');
  const iconData = CONDITION_SVGS[key];

  if (!iconData) {
    // Fallback to a generic icon if the condition is not found
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  }

  return (
    <svg
      viewBox={iconData.viewBox}
      className={className}
      fill="currentColor"
      dangerouslySetInnerHTML={{ __html: iconData.content }}
    >
      {title && <title>{title}</title>}
    </svg>
  );
}

export default ConditionIcon;
