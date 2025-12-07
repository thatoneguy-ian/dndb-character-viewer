import * as React from 'react';
import AbjurationIcon from './AbjurationIcon';
import ConjurationIcon from './ConjurationIcon';
import DivinationIcon from './DivinationIcon';
import EnchantmentIcon from './EnchantmentIcon';
import EvocationIcon from './EvocationIcon';
import IllusionIcon from './IllusionIcon';
import NecromancyIcon from './NecromancyIcon';
import TransmutationIcon from './TransmutationIcon';
import InstantaneousIcon from './InstantaneousIcon';
import MaterialIcon from './MaterialIcon';
import SomaticIcon from './SomaticIcon';
import VocalIcon from './VocalIcon';
import RitualIcon from './RitualIcon';
import UpcastIcon from './UpcastIcon';
import CostIcon from './CostIcon';
import ConsumedIcon from './ConsumedIcon';
import OctagonIcon from './OctagonIcon';

export {
  AbjurationIcon,
  ConjurationIcon,
  DivinationIcon,
  EnchantmentIcon,
  EvocationIcon,
  IllusionIcon,
  NecromancyIcon,
  TransmutationIcon
  , InstantaneousIcon,
  MaterialIcon,
  SomaticIcon,
  VocalIcon,
  RitualIcon,
  UpcastIcon,
  CostIcon,
  ConsumedIcon,
  OctagonIcon
};

export const SCHOOL_ICON_MAP: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  Abjuration: AbjurationIcon,
  Conjuration: ConjurationIcon,
  Divination: DivinationIcon,
  Enchantment: EnchantmentIcon,
  Evocation: EvocationIcon,
  Illusion: IllusionIcon,
  Necromancy: NecromancyIcon,
  Transmutation: TransmutationIcon
};

