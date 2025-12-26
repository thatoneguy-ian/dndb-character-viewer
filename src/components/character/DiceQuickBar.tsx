import type { DiceType } from '../../types/character';
import { DiceIcon } from './DiceIcon';

interface DiceQuickBarProps {
    onRoll: (notation: string) => void;
}

export const DiceQuickBar = ({ onRoll }: DiceQuickBarProps) => {
    const dice: DiceType[] = [20, 12, 10, 8, 6, 4, 2, 100];

    return (
        <div className="flex gap-2 p-3 bg-[var(--bg-app)] backdrop-blur-sm border-t border-[var(--border-color)] transition-colors duration-300 overflow-x-auto no-scrollbar shrink-0">
            {dice.map((d) => (
                <button
                    key={d}
                    onClick={() => onRoll(`1d${d}`)}
                    className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
                >
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] flex items-center justify-center group-hover:border-[var(--color-action)]/50 group-hover:bg-[var(--bg-card)] transition-colors shadow-sm shadow-black/5">
                        <DiceIcon sides={d} className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--color-action)] transition-colors" />
                    </div>
                    <span className="text-[10px] font-black text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">d{d}</span>
                </button>
            ))}
        </div>
    );
};
