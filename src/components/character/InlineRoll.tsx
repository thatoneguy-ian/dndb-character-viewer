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
            className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 rounded text-red-400 font-black text-[10px] transition-all active:scale-95 cursor-pointer mx-0.5"
            title={`Roll ${notation}`}
        >
            <DiceIcon sides={sides} className="w-3 h-3 transition-transform group-hover:rotate-12" />
            <span>{notation}</span>
        </button>
    );
};
