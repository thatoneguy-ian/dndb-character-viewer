import React from 'react';
import { CharacterHeader } from './CharacterHeader';
import { StatsGrid } from './StatsGrid';
import { SavingThrowsPanel } from './SavingThrowsPanel';
import { SkillsPanel } from './SkillsPanel';
import { ConditionsRow } from './ConditionsRow';

export const SheetHeader: React.FC = () => {
    return (
        <>
            <CharacterHeader />
            <StatsGrid />
            <SavingThrowsPanel />
            <SkillsPanel />
            <ConditionsRow />
        </>
    );
};
