import { MarkdownDescription } from './MarkdownDescription';
import type { InventoryItem } from '../../types/character';
import type { DDBCharacter } from '../../types/dnd-beyond';
import { Card } from '../common';

interface ConsumableItemProps {
    item: InventoryItem;
    isOpen: boolean;
    onClick: () => void;
    onRoll: (notation: string, label?: string) => void;
    character?: DDBCharacter | null;
}

export const ConsumableItem: React.FC<ConsumableItemProps> = ({ item, isOpen, onClick, onRoll, character }) => {
    return (
        <Card
            className={`mb-2 p-3 transition-all ${isOpen ? 'ring-2 ring-[var(--text-success)]/50 bg-[var(--bg-card)] shadow-md' : 'bg-[var(--bg-card)]/40 hover:bg-[var(--bg-card)]/60 shadow-sm'}`}
            onClick={onClick}
        >
            <div className="flex justify-between items-center gap-4">
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black uppercase tracking-tight truncate text-[var(--text-success)]">
                        {item.name}
                    </h4>
                    <div className="flex gap-1 mt-1">
                        {item.tags.map((t, i) => (
                            <span key={i} className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">{t}</span>
                        ))}
                    </div>
                </div>
                <div className="flex items-center justify-center min-w-[32px] h-8 bg-[var(--bg-input)] rounded-lg border border-[var(--border-color)] shadow-inner">
                    <span className="text-xs font-black text-[var(--text-primary)]">x{item.quantity}</span>
                </div>
            </div>

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[500px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="pt-3 border-t border-[var(--border-color)] text-xs text-[var(--text-primary)] leading-relaxed">
                    <div className="font-black text-[10px] uppercase tracking-widest mb-1 italic opacity-50 text-[var(--text-primary)]">Item Effect</div>
                    <div className="bg-[var(--bg-card)] p-3 rounded-lg border border-[var(--border-color)]/50 shadow-inner mt-2">
                        <MarkdownDescription content={item.description} onRoll={onRoll} character={character} name={item.name} />
                    </div>
                </div>
            </div>
        </Card>
    );
};
