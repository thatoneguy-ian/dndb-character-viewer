import { DiceIcon } from './DiceIcon';

interface InlineRollProps {
    notation: string;
    onRoll: (notation: string) => void;
}

export const InlineRoll = ({ notation, onRoll }: InlineRollProps) => {
    // Extract sides from notation (e.g. "1d8+4" -> 8)
    const match = notation.match(/d(\d+)/i);
    const sides = match ? parseInt(match[1], 10) as any : 20;

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onRoll(notation);
            }}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-black/20 hover:bg-black/40 border-2 border-[var(--color-action)] rounded text-[var(--text-primary)] font-black text-[11px] transition-all active:scale-95 cursor-pointer mx-0.5 shadow-lg shadow-red-900/20"
            title={`Roll ${notation}`}
        >
            <DiceIcon sides={sides} className="w-4 h-4 transition-transform group-hover:rotate-12" />
            <span className="tracking-tighter">{notation}</span>
        </button>
    );
};
