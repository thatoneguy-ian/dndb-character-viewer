import type { DiceType } from '../../types/character';
import { DICE_SVGS } from '../../assets/dice-svgs';

interface DiceIconProps {
    sides: DiceType | string;
    className?: string;
    value?: number;
    style?: React.CSSProperties;
}

export const DiceIcon = ({ sides, className = "w-6 h-6", value, style }: DiceIconProps) => {
    const diceKey = typeof sides === 'number' ? `d${sides}` : sides;
    const diceData = DICE_SVGS[diceKey] || DICE_SVGS['d20']; // Fallback to d20

    return (
        <div className={`relative flex items-center justify-center ${className}`} style={style}>
            <svg
                viewBox={diceData.viewBox}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.0"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: diceData.content }}
            />
            {value !== undefined && (
                <span
                    className="absolute inset-0 flex items-center justify-center text-[10px] font-black tracking-tighter"
                    style={{
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--bg-card)',
                        borderRadius: '999px',
                        width: '14px',
                        height: '14px',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        boxShadow: '0 0 3px var(--bg-card)'
                    }}
                >
                    {value}
                </span>
            )}
        </div>
    );
};
