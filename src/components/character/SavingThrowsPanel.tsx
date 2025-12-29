import React, { useState } from 'react';
import type { DDBCharacter } from '../../types/dnd-beyond';
import { getSavingThrows } from '../../dnd-utils';
import { IconChevronDown, IconChevronUp } from '../icons';

interface SavingThrowsPanelProps {
    character: DDBCharacter;
    onRoll: (notation: string, label?: string) => void;
}

export const SavingThrowsPanel: React.FC<SavingThrowsPanelProps> = ({ character, onRoll }) => {
    const [isOpen, setIsOpen] = useState(false);
    const saves = getSavingThrows(character);

    return (
        <div className="mb-2 border rounded-lg backdrop-blur-sm shadow-sm overflow-hidden transition-all duration-300
            bg-[var(--bg-card)] border-[var(--border-color)]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-2.5 text-xs font-black transition-colors
                    text-[var(--text-secondary)] hover:bg-[var(--bg-app)]/50"
            >
                <span className="tracking-widest">SAVING THROWS</span>
                {isOpen ? <IconChevronUp /> : <IconChevronDown />}
            </button>

            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-app)]/30">
                    <div className="grid grid-cols-3 gap-2">
                        {saves.map((save) => (
                            <div key={save.name} className="flex flex-col items-center bg-[var(--bg-input)]/50 p-2 rounded-lg border border-[var(--border-color)]/30 relative group/save">
                                {save.isProficient && (
                                    <div className="absolute top-1.5 left-1.5 w-1 h-1 rounded-full bg-red-600 shadow-[0_0_3px_rgba(220,38,38,0.6)]" title="Proficient" />
                                )}
                                <span className={`text-[9px] font-bold uppercase tracking-tighter ${save.isProficient ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                                    {save.name}
                                </span>
                                <div className="group/roll relative flex items-center justify-center min-w-[32px] mt-1">
                                    <span className={`text-xs font-mono font-bold group-hover/roll:scale-0 transition-transform duration-200 
                                        ${save.bonusValue > 0 ? 'text-[var(--text-success)]' : (save.bonusValue < 0 ? 'text-[var(--color-danger)]' : 'text-[var(--text-secondary)]')}`}>
                                        {save.bonus}
                                    </span>
                                    <button
                                        className="absolute inset-0 bg-red-600 rounded opacity-0 group-hover/roll:opacity-100 transition-opacity duration-200 flex items-center justify-center shadow-lg shadow-red-900/40"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRoll(`1d20${save.bonus}`, `${save.name} Save`);
                                        }}
                                    >
                                        <span className="text-[7px] font-black text-white uppercase tracking-tighter">Roll</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
