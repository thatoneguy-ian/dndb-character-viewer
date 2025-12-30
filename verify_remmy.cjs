const fs = require('fs');
const path = require('path');

const charData = JSON.parse(fs.readFileSync('exampleJSON/Remmy (Rembrant).json', 'utf8'));

console.log('--- SAVING THROW BONUSES CATEGORY CHECK ---');
const categories = ['race', 'class', 'background', 'item', 'feat', 'condition'];

categories.forEach(cat => {
    if (charData.modifiers[cat]) {
        charData.modifiers[cat].filter(m => m.type === 'bonus' && (m.subType === 'saving-throws' || m.subType === 'saving-throws-bonus' || m.subType.includes('saving-throws'))).forEach(m => {
            console.log(`[${cat}] [${m.type}] ${m.subType} = ${m.value ?? m.fixedValue} (Granted: ${m.isGranted})`);
        });
    }
});
