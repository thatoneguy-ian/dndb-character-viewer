import { MarkdownDescription } from './MarkdownDescription';
import type { Action } from '../../types/character';
import { Card, Badge } from '../common';

interface ActionItemProps {
    action: Action;
    isOpen: boolean;
    onClick: () => void;
    onRoll: (notation: string, label?: string) => void;
}

export const ActionItem: React.FC<ActionItemProps> = ({ action, isOpen, onClick, onRoll }) => {
    return (
        <Card
            className={`mb-2 p-3 transition-all ${isOpen ? 'ring-2 ring-[var(--color-action)]/50 bg-[var(--bg-card)] shadow-md' : 'bg-[var(--bg-card)]/40 hover:bg-[var(--bg-card)]/60 shadow-sm'}`}
            onClick={onClick}
        >
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black uppercase tracking-tight truncate text-[var(--text-primary)]">
                        {action.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest truncate max-w-[120px]">
                            {action.attackType || action.source}
                        </span>
                        {action.range && <Badge className="py-0">{action.range}</Badge>}
                    </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                    {action.hitOrDc && (
                        <button
                            className="group/roll relative flex items-center justify-center min-w-[32px] px-1 py-0.5"
                            onClick={(e) => {
                                e.stopPropagation();
                                const bonus = action.hitOrDc?.replace(/[^0-9+-]/g, '');
                                if (bonus) onRoll(`1d20${bonus.startsWith('+') || bonus.startsWith('-') ? bonus : `+${bonus}`}`, `${action.name} Attack`);
                            }}
                        >
                            <span className="text-xs font-black font-mono tracking-tighter group-hover/roll:scale-0 transition-transform duration-200 text-[var(--color-action)]">{action.hitOrDc}</span>
                            <div className="absolute inset-0 bg-[var(--color-action)] rounded opacity-0 group-hover/roll:opacity-100 transition-opacity duration-200 flex items-center justify-center shadow-lg">
                                <span className="text-[8px] font-black text-white uppercase tracking-tighter">Roll</span>
                            </div>
                        </button>
                    )}
                    {action.damage && (
                        <button
                            className="group/roll relative flex items-center justify-end min-w-[60px] px-1 py-0.5"
                            onClick={(e) => {
                                e.stopPropagation();
                                const notation = action.damage?.split(' ')[0];
                                if (notation) onRoll(notation, `${action.name} Damage`);
                            }}
                        >
                            <div className="text-[10px] font-bold group-hover/roll:scale-0 transition-transform duration-200 text-right text-[var(--text-primary)]">
                                {action.damage.split(' ')[0]} <span className="text-[var(--text-secondary)] ml-0.5">{action.damage.split(' ').slice(1).join(' ')}</span>
                            </div>
                            <div className="absolute inset-0 bg-[var(--text-primary)] rounded opacity-0 group-hover/roll:opacity-100 transition-opacity duration-200 flex items-center justify-center border border-[var(--border-color)] shadow-lg">
                                <span className="text-[8px] font-black text-white uppercase tracking-tighter">Roll Damage</span>
                            </div>
                        </button>
                    )}
                </div>
            </div>

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[500px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="pt-3 border-t border-[var(--border-color)] space-y-2 bg-[var(--bg-app)]/40 p-3 rounded-b-lg">
                    <div className="font-black text-[10px] uppercase tracking-widest mb-1 italic text-[var(--text-primary)]">Description</div>
                    <div className="bg-[var(--bg-card)] p-3 rounded-lg border border-[var(--border-color)]/50 shadow-inner">
                        <MarkdownDescription content={action.description} onRoll={onRoll} />
                    </div>
                </div>
            </div>
        </Card>
    );
};
