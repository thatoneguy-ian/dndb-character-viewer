import type { DiceType } from '../../types/character';

interface DiceIconProps {
    sides: DiceType;
    className?: string;
    value?: number;
    style?: React.CSSProperties;
}

export const DiceIcon = ({ sides, className = "w-6 h-6", value, style }: DiceIconProps) => {
    const renderContent = () => {
        const facetOpacity = 0.3;

        switch (sides) {
            case 2:
                return (
                    <>
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="7" strokeOpacity={facetOpacity} />
                    </>
                );
            case 4:
                return (
                    <>
                        <path d="M12 2L2 20h20L12 2z" />
                        <path d="M12 2v18 M2 20l4.5-8 M22 20l-4.5-8" strokeOpacity={facetOpacity} />
                    </>
                );
            case 6:
                return (
                    <>
                        <rect x="4" y="4" width="16" height="16" rx="2" />
                        <path d="M4 4l4 4 M20 4l-4 4 M4 20l4-4 M20 20l-4-4 M8 8h8v8H8z" strokeOpacity={facetOpacity} />
                    </>
                );
            case 8:
                return (
                    <>
                        <path d="M12 2L4 12l8 10 8-10z" />
                        <path d="M4 12h16 M12 2v20 M4 12l8-10 8 10-8 10-8-10" strokeOpacity={facetOpacity} />
                    </>
                );
            case 10:
                return (
                    <>
                        <path d="M12 2L3 12l9 10 9-10z" />
                        <path d="M12 2l-3 10 3 10 3-10z M3 12h18" strokeOpacity={facetOpacity} />
                    </>
                );
            case 12:
                return (
                    <>
                        <path d="M12 2l8 4.5v9L12 20l-8-4.5v-9z" />
                        <path d="M12 7.5L7 11v5l5 3.5 5-3.5v-5z M12 2v5.5 M4 6.5l3 4.5 M20 6.5l-3 4.5 M4 15.5l3-4.5 M20 15.5l-3-4.5" strokeOpacity={facetOpacity} />
                    </>
                );
            case 20:
                return (
                    <>
                        <path d="M12 2L3 7v10l9 5 9-5V7z" />
                        <path d="M12 2l3.5 5.5h-7z M3 7l5.5 .5 3.5-5.5 M21 7l-5.5 .5-3.5-5.5 M3 7v10l5.5 -2.5 M21 7v10l-5.5 -2.5 M12 22l3.5-7.5-3.5-2.5-3.5 2.5 3.5 7.5z M8.5 14.5l3.5 -2.5 3.5 2.5 -3.5 2.5z" strokeOpacity={facetOpacity} />
                    </>
                );
            case 100:
                return (
                    <g transform="scale(0.8) translate(3, 3)">
                        <path d="M6 2L1 12l5 10 5-10z" />
                        <path d="M18 2l-5 10 5 10 5-10z" />
                        <path d="M6 2l-2 10 2 10 2-10z M1 12h10" strokeOpacity={facetOpacity} strokeWidth="1" />
                        <path d="M18 2l-2 10 18 10 2-10z M13 12h10" strokeOpacity={facetOpacity} strokeWidth="1" />
                    </g>
                );
            default:
                return <circle cx="12" cy="12" r="10" />;
        }
    };

    return (
        <div className={`relative flex items-center justify-center ${className}`} style={style}>
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-full h-full opacity-60"
            >
                {renderContent()}
            </svg>
            {value !== undefined && (
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black tracking-tighter text-white">
                    {value}
                </span>
            )}
        </div>
    );
};
