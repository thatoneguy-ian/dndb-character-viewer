import React from 'react';
import { InlineRoll } from './InlineRoll';
import { resolveDDBTags } from '../../dnd-utils';
import { useAppContext } from '../../context/AppContext';

interface MarkdownDescriptionProps {
    content: string;
    name?: string;
    className?: string;
}

export const MarkdownDescription: React.FC<MarkdownDescriptionProps> = ({ content, name, className }) => {
    const { character } = useAppContext();
    if (!content) return null;

    // Resolve DDB placeholder tags first
    const resolvedContent = character ? resolveDDBTags(content, character, name, className) : content;

    // Regex for dice notation (e.g. 1d20, 2d6+4, d8 + 1)
    const diceRegex = /(\b\d*d\d+(?:\s*[+-]\s*\d+)?\b)/gi;

    // Split by the regex but keep the matches
    const parts = resolvedContent.split(diceRegex);

    return (
        <div className="text-[var(--text-secondary)] text-xs leading-relaxed">
            {parts.map((part, index) => {
                if (part.match(diceRegex)) {
                    return <InlineRoll key={index} notation={part} />;
                }
                // Handle simple HTML tags (like <p>, <br>, <strong>) or just return text
                // Since this is used for snippets/descriptions which might have basic HTML
                return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
            })}
        </div>
    );
};
