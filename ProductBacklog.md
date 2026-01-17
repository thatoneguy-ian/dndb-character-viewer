# Product Backlog: "Combat-Ready" Engine v2.1

**North Star Mission**: Reduce information consumption and decision time during fast-paced combat scenarios.

---

## ✅ Completed Milestones
- **Milestone 6: Data Density** (Duration, Targets, Damage Types, Sticky Accordions) ✅
- **Milestone 7: Flow & Navigation** (Quick Nav Bridge, Roll Scents, Charge Visuals, Sticky HP Banner) ✅

---

## 🎯 Milestone 8: Decision Support & High Impact (TIER 1)
**Goal**: Move from "Displaying Data" to "Guiding Decisions"  
**Priority**: ⭐⭐⭐⭐⭐ Critical Path  
**Focus**: Visual cues, visceral feedback, and tactical clarity.

| ID | Feature | Value | Status |
| :--- | :--- | :---: | :--- |
| **IDEA-036** | **Action Scents (Visual Categorization)** | 95/100 | ✅ COMPLETED |
| **FEAT-204** | Mobile-Optimized Hit Targets (IDEA-013) | 85/100 | ⏳ BACKLOG |
| **IDEA-037** | **Visceral Crits (Screen FX & Feedback)** | 80/100 | ✅ COMPLETED |
| **IDEA-038** | **Spell Slot "Fuel Gauge" Visualizer** | 75/100 | ✅ COMPLETED |
| **FEAT-505** | Light Mode Accent Reconciliation | 70/100 | ⏳ BACKLOG |
| **IDEA-031** | Critical Roll Celebration (Visuals) | 65/100 | 💡 IDEA |

**Success Criteria**:
- ✅ **IDEA-036**: Actions have color-coded borders (Red/Green/Blue) matching their roll-scent intent.
- ✅ **IDEA-037**: Nat 20/Nat 1 results trigger clear visual "moment" feedback (edge flashes).
- ✅ **IDEA-038**: Spell slots presented as a visual bar or battery instead of text lists.
- [ ] **FEAT-204**: Clickable areas for rolls and resources are sized for "Fat Finger" tablet play.

---

## 🏗️ Milestone 9: Foundation & Performance (TIER 2/3)
**Goal**: Technical stabilization, performance at scale, and state persistence  
**Priority**: ⭐⭐⭐ High Value (Internal)  
**Focus**: Architecture, testing, and memory management.

| ID | Feature | Value | Status |
| :--- | :--- | :---: | :--- |
| **IDEA-TECH-009** | **Memoized Tactical Mapping Layer** | 85/100 | 💡 IDEA-TECH |
| **IDEA-TECH-008** | **Schema-First Character Parser (Zod)** | 80/100 | 💡 IDEA-TECH |
| **IDEA-TECH-010** | **Persistent Turn State (Local Storage)** | 75/100 | 💡 IDEA-TECH |
| **IDEA-TECH-002** | Error Handling & Retry Logic | 70/100 | 💡 IDEA-TECH |
| **IDEA-TECH-001** | Split AppContext (Domain Contexts) | 70/100 | 💡 IDEA-TECH |
| **IDEA-TECH-003** | Test Coverage for Calculators | 65/100 | 💡 IDEA-TECH |
| **IDEA-TECH-004** | Code Splitting & Virtualization | 60/100 | 💡 IDEA-TECH |

**Success Criteria**:
- [ ] **IDEA-TECH-009**: High-level Wizard (100+ spells) scrolls dashboard at 60fps.
- [ ] **IDEA-TECH-008**: Zero `any` casts in the character parsing utility.
- [ ] **IDEA-TECH-010**: Refreshing the page preserves spent action economy.

---

## 💤 Future Backlog (Tier 3+)
| ID | Feature | Status |
| :--- | :--- | :--- |
| **IDEA-039** | Interactive Status Reminders | 💡 IDEA |
| **FEAT-205** | Haptic Feedback (Vibration) | ⏳ BACKLOG |
| **FEAT-601** | Auto-Exhaustion Logic | ⏳ BACKLOG |
| **FEAT-702** | Multiattack Workflow | 💤 DEFERRED |

---

## 🧭 Prioritization Framework (Combat-First)
1. **Decision Speed (35%)**: Does this help a player pick an action faster?
2. **Error Prevention (25%)**: Does this prevent "Illegal Moves" or "Forgot my concentration"?
3. **Info Density (20%)**: Does this remove the need to scroll or expand?
4. **Delight (20%)**: Does it feel like a premium gaming experience?
