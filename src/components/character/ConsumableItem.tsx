import React from 'react';
import type { InventoryItem } from '../../types/character';
import { Card } from '../common';

interface ConsumableItemProps {
    item: InventoryItem;
    isOpen: boolean;
    onClick: () => void;
}

export const ConsumableItem: React.FC<ConsumableItemProps> = ({ item, isOpen, onClick }) => {
    return (
        <Card
            className={`mb-2 p-3 transition-all ${isOpen ? 'ring-2 ring-green-500/50 bg-gray-800/80' : 'bg-gray-800/40 hover:bg-gray-800/60'}`}
            onClick={onClick}
        >
            <div className="flex justify-between items-center gap-4">
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-green-400 uppercase tracking-tight truncate">
                        {item.name}
                    </h4>
                    <div className="flex gap-1 mt-1">
                        {item.tags.map((t, i) => (
                            <span key={i} className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{t}</span>
                        ))}
                    </div>
                </div>
                <div className="flex items-center justify-center min-w-[32px] h-8 bg-gray-900/80 rounded-lg border border-gray-700 shadow-inner">
                    <span className="text-xs font-black text-white">x{item.quantity}</span>
                </div>
            </div>

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[500px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="pt-3 border-t border-gray-700/50 text-xs text-gray-300 leading-relaxed">
                    <div className="font-black text-white text-[10px] uppercase tracking-widest mb-1 italic opacity-50">Item Effect</div>
                    <div dangerouslySetInnerHTML={{ __html: item.description }} />
                </div>
            </div>
        </Card>
    );
};
