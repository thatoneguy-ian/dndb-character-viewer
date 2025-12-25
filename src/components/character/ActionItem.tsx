import React from 'react';
import type { Action } from '../../types/character';
import { Card, Badge } from '../common';

interface ActionItemProps {
    action: Action;
    isOpen: boolean;
    onClick: () => void;
}

export const ActionItem: React.FC<ActionItemProps> = ({ action, isOpen, onClick }) => {
    return (
        <Card
            className={`mb-2 p-3 transition-all ${isOpen ? 'ring-2 ring-red-500/50 bg-gray-800/80' : 'bg-gray-800/40 hover:bg-gray-800/60'}`}
            onClick={onClick}
        >
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-white uppercase tracking-tight truncate">
                        {action.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate max-w-[120px]">
                            {action.attackType || action.source}
                        </span>
                        {action.range && <Badge className="py-0">{action.range}</Badge>}
                    </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                    {action.hitOrDc && (
                        <div className="text-xs font-black text-red-400 font-mono tracking-tighter">
                            {action.hitOrDc}
                        </div>
                    )}
                    {action.damage && (
                        <div className="text-[10px] font-bold text-gray-200">
                            {action.damage.split(' ')[0]} <span className="text-gray-500 ml-0.5">{action.damage.split(' ').slice(1).join(' ')}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[500px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="pt-3 border-t border-gray-700/50 text-xs text-gray-300 leading-relaxed space-y-2">
                    <div className="font-black text-white text-[10px] uppercase tracking-widest mb-1 italic">Description</div>
                    <div dangerouslySetInnerHTML={{ __html: action.description }} />
                </div>
            </div>
        </Card>
    );
};
