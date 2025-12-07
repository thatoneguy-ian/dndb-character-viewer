import * as React from 'react';
import ActionIcon from './ActionIcon';
import BonusActionIcon from './BonusActionIcon';
import ReactionIcon from './ReactionIcon';
import ConcentrationIcon from './ConcentrationIcon';
import { SCHOOL_ICON_MAP } from './spell';

export { ActionIcon, BonusActionIcon, ReactionIcon, ConcentrationIcon };

export const SPELL_QUICK_FILTER_ICONS: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  action: ActionIcon,
  'bonus-action': BonusActionIcon,
  reaction: ReactionIcon,
  concentration: ConcentrationIcon,
};

export { SCHOOL_ICON_MAP };

// No default export to avoid initialization-order/circular import issues
