import React from 'react';
import { useAppContext } from '../../context/AppContext';

export const CriticalOverlay: React.FC = () => {
    const { lastCritical } = useAppContext();

    if (!lastCritical) return null;

    // Green for success, Red for failure
    const color = lastCritical === 'success' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)';

    return (
        <div
            className="fixed inset-0 pointer-events-none z-[9999] animate-pulse"
            style={{
                boxShadow: `inset 0 0 40px ${color}, inset 0 0 100px ${color}`
            }}
        />
    );
};
