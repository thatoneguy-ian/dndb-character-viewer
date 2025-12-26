import { useEffect, useRef } from 'react';
import type { RollResult } from '../../types/character';
import { DiceIcon } from './DiceIcon';

interface DiceLogProps {
    history: RollResult[];
    onClear: () => void;
}

export const DiceLog = ({ history, onClear }: DiceLogProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [history]);

    if (history.length === 0) return null;

    return (
        <div className="bg-[var(--bg-app)] border-t border-[var(--border-color)] p-2 z-40 transition-colors duration-300">
            <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Roll History</span>
                <button onClick={onClear} className="text-[10px] text-[var(--text-secondary)] hover:text-[var(--color-action)] font-bold uppercase transition-colors">Clear</button>
            </div>
            <div ref={scrollRef} className="max-h-32 overflow-y-auto custom-scrollbar space-y-2 px-2 py-1">
                {history.map((roll, idx) => {
                    const isLatest = idx === 0;
                    return (
                        <div
                            key={roll.id}
                            className={`transition-all duration-300 rounded-lg p-2 border flex items-center justify-between animate-in slide-in-from-bottom-2 
                                ${isLatest
                                    ? 'bg-[var(--bg-card)] border-[var(--color-action)]/50 ring-1 ring-[var(--color-action)]/20 shadow-lg shadow-black/5 opacity-100'
                                    : 'bg-[var(--bg-card)]/50 border-[var(--border-color)] opacity-50 hover:opacity-100 hover:bg-[var(--bg-card)] shadow-sm shadow-black/5'
                                }`}
                        >
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    {roll.label && <span className="text-[10px] font-black uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>{roll.label}</span>}
                                    <span
                                        className="text-[9px] font-bold uppercase tracking-tighter"
                                        style={{ color: isLatest ? 'var(--color-action)' : 'var(--text-secondary)' }}
                                    >
                                        {roll.notation}
                                    </span>
                                </div>
                                <div className="flex gap-1 items-center overflow-x-auto no-scrollbar max-w-[180px]">
                                    {roll.rolls.map((r, i) => (
                                        <DiceIcon
                                            key={i}
                                            sides={r.sides}
                                            value={r.value}
                                            className="w-5 h-5"
                                            style={{ color: isLatest ? 'var(--color-action)' : 'var(--text-secondary)' }}
                                        />
                                    ))}
                                    {roll.modifier !== 0 && (
                                        <span
                                            className="text-[10px] font-bold"
                                            style={{ color: isLatest ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                                        >
                                            {roll.modifier > 0 ? '+' : ''}{roll.modifier}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className={`text-xl font-black px-3 py-1 rounded-md border text-center min-w-[44px] shadow-inner transition-all
                                ${isLatest
                                    ? 'text-white bg-[var(--color-action)] border-[var(--color-action)]'
                                    : 'text-[var(--text-primary)] bg-[var(--bg-input)] border-[var(--border-color)]'
                                }`}
                            >
                                {roll.total}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
