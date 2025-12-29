const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
if (!filePath) {
    console.error('Please provide a file path');
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log('--- Character:', data.name, '---');
console.log('Stats (Base):');
data.stats.forEach(s => {
    console.log(`Stat ${s.id}: ${s.value}`);
});

console.log('\nBonus Stats:');
data.bonusStats.forEach(s => {
    console.log(`Stat ${s.id}: ${s.value}`);
});

console.log('\nOverride Stats:');
data.overrideStats.forEach(s => {
    console.log(`Stat ${s.id}: ${s.value}`);
});

console.log('\nRelevant Modifiers:');
const ABILITY_MAP = { 1: "STR", 2: "DEX", 3: "CON", 4: "INT", 5: "WIS", 6: "CHA" };

function scanMods(mods, source) {
    if (!mods) return;
    mods.forEach(m => {
        if (m.subType.includes('score') || m.subType.includes('saving-throw')) {
            console.log(`[${source}] Type: ${m.type}, SubType: ${m.subType}, Value: ${m.value}`);
        }
    });
}

scanMods(data.modifiers.race, 'Race');
scanMods(data.modifiers.class, 'Class');
scanMods(data.modifiers.feat, 'Feat');
scanMods(data.modifiers.item, 'Item');
scanMods(data.modifiers.background, 'Background');
scanMods(data.modifiers.condition, 'Condition');
