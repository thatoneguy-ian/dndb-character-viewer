import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import type { CombatCapability } from '../types/character';

export function useCombatActions() {
    const { allActions, allSpells, allInventory } = useAppContext();

    const combatActions = useMemo(() => {
        const capabilities: CombatCapability[] = [];

        // 1. Process Actions (Already categorized in allActions)
        allActions.forEach(action => {
            capabilities.push({
                id: `action-${action.id}`,
                name: action.name,
                cost: action.type,
                type: 'Action',
                rollData: {
                    hitBonus: action.hitBonus,
                    saveDC: action.saveDC,
                    damage: action.damage,
                    damageType: action.damageType
                },
                description: action.description,
                source: action.source,
                range: action.range,
                duration: action.duration,
                target: action.target,
                originalData: action,
                resource: action.resource
            });
        });

        // 2. Process Spells (Only combat-relevant ones)
        allSpells.forEach(spell => {
            const isCombat = spell.damage || spell.hitBonus || spell.saveDC || spell.tags?.some(t =>
                ['Damage', 'Control', 'Buff', 'Debuff', 'Healing', 'Combat'].includes(t)
            ) || spell.castingType === 'Reaction';

            if (isCombat) {
                capabilities.push({
                    id: `spell-${spell.name}`,
                    name: spell.name,
                    cost: spell.castingType || 'Other',
                    type: 'Spell',
                    rollData: {
                        hitBonus: spell.hitBonus,
                        saveDC: spell.saveDC,
                        damage: spell.damage,
                        damageType: spell.damageType
                    },
                    description: spell.description,
                    source: spell.source,
                    range: spell.range,
                    duration: spell.duration,
                    target: spell.target,
                    originalData: spell
                });
            }
        });

        // 3. Process Inventory (Consumables & Combat-tagged items)
        allInventory.forEach(item => {
            const isConsumable = item.type === 'Consumable';
            const isCombatItem = item.tags.includes('Combat') && !allActions.some(a => a.name === item.name);

            if (isConsumable || isCombatItem) {
                let cost: CombatCapability['cost'] = 'Action';

                // Heuristic for common BA consumables
                if (item.name.toLowerCase().includes('healing') || item.name.toLowerCase().includes('potion')) {
                    cost = 'Bonus';
                }

                capabilities.push({
                    id: `item-${item.id}`,
                    name: item.name,
                    cost: cost,
                    type: isConsumable ? 'Consumable' : 'Item',
                    description: item.description,
                    source: 'Inventory',
                    range: '',
                    resource: { current: item.quantity, max: item.quantity },
                    originalData: item
                });
            }
        });

        return capabilities;
    }, [allActions, allSpells, allInventory]);

    const actionsByCost = useMemo(() => {
        return {
            Action: combatActions.filter(a => a.cost === 'Action'),
            Bonus: combatActions.filter(a => a.cost === 'Bonus'),
            Reaction: combatActions.filter(a => a.cost === 'Reaction'),
            Other: combatActions.filter(a => a.cost === 'Other')
        };
    }, [combatActions]);

    return { combatActions, actionsByCost };
}
