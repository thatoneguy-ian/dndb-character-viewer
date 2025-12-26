import { useState, useCallback } from 'react';
import type { RollResult, DiceType, DiceRoll } from '../types/character';

export function useDice() {
    const [history, setHistory] = useState<RollResult[]>([]);

    const rollDice = useCallback((notation: string, label?: string) => {
        // Regex to parse notation: [count]d[sides][+|-][modifier]
        // Example matches: "d20", "1d20", "2d6+4", "1d8 + 4"
        const regex = /^(\d+)?d(\d+)(?:\s*([+-])\s*(\d+))?$/i;
        const match = notation.trim().match(regex);

        if (!match) return null;

        const count = parseInt(match[1] || '1', 10);
        const sides = parseInt(match[2], 10) as DiceType;
        const sign = match[3] === '-' ? -1 : 1;
        const modifierValue = parseInt(match[4] || '0', 10);
        const modifier = sign * modifierValue;

        const rolls: DiceRoll[] = [];
        let rollSum = 0;

        for (let i = 0; i < count; i++) {
            const val = Math.floor(Math.random() * sides) + 1;
            rolls.push({ sides, value: val });
            rollSum += val;
        }

        const result: RollResult = {
            id: Math.random().toString(36).substring(2, 11),
            notation,
            label,
            rolls,
            modifier,
            total: rollSum + modifier,
            timestamp: Date.now()
        };

        setHistory(prev => [result, ...prev].slice(0, 50)); // Keep last 50
        return result;
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
    }, []);

    return {
        history,
        rollDice,
        clearHistory
    };
}
