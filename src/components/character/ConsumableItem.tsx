import { MarkdownDescription } from './MarkdownDescription';
import type { InventoryItem } from '../../types/character';
import { Card } from '../common';

interface ConsumableItemProps {
    item: InventoryItem;
    isOpen: boolean;
    onClick: () => void;
    onRoll: (notation: string, label?: string) => void;
}

export const ConsumableItem: React.FC<ConsumableItemProps> = ({ item, isOpen, onClick, onRoll }) => {
    return (
        <Card
            className={`mb-2 p-3 transition-all ${isOpen ? 'ring-2 ring-green-500/50 bg-white dark:bg-gray-800/80 shadow-md' : 'bg-white/50 dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-800/60 shadow-sm'}`}
            onClick={onClick}
        >
            <div className="flex justify-between items-center gap-4">
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black uppercase tracking-tight truncate text-[#00875A] dark:text-green-400">
                        {item.name}
                    </h4>
                    <div className="flex gap-1 mt-1">
                        {item.tags.map((t, i) => (
                            <span key={i} className="text-[9px] text-[#5E6C84] dark:text-gray-500 font-bold uppercase tracking-widest">{t}</span>
                        ))}
                    </div>
                </div>
                <div className="flex items-center justify-center min-w-[32px] h-8 bg-[#EBECF0] dark:bg-gray-900/80 rounded-lg border border-gray-300 dark:border-gray-700 shadow-inner">
                    <span className="text-xs font-black text-[#172B4D] dark:text-white">x{item.quantity}</span>
                </div>
            </div>

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[500px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="pt-3 border-t border-gray-300 dark:border-gray-700/50 text-xs text-[#172B4D] dark:text-gray-300 leading-relaxed">
                    <div className="font-black text-[10px] uppercase tracking-widest mb-1 italic opacity-50 text-[#172B4D] dark:text-white">Item Effect</div>
                    <MarkdownDescription content={item.description} onRoll={onRoll} />
                </div>
            </div>
        </Card>
    );
};
