import fs from 'fs';

const filePath = process.argv[2];
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log('--- Character:', data.name, '---');
console.log('startingClassId:', data.startingClassId);

const ABILITY_MAP = { 1: "STR", 2: "DEX", 3: "CON", 4: "INT", 5: "WIS", 6: "CHA" };

console.log('\n--- Base Stats ---');
data.stats.forEach(s => console.log(`${ABILITY_MAP[s.id]}: ${s.value}`));

console.log('\n--- Bonus Stats ---');
data.bonusStats.forEach(s => console.log(`${ABILITY_MAP[s.id]}: ${s.value}`));

console.log('\n--- Override Stats ---');
data.overrideStats.forEach(s => console.log(`${ABILITY_MAP[s.id]}: ${s.value}`));

console.log('\n--- Active Modifiers (isGranted: true) ---');
for (const cat in data.modifiers) {
    const list = data.modifiers[cat];
    if (!Array.isArray(list)) continue;
    list.forEach(m => {
        if (!m.isGranted) return;

        // Look for ability score bonuses
        if (m.subType.includes('score')) {
            console.log(`[${cat}] Score Bonus: ${m.subType} = ${m.value} (Type: ${m.type}, ID: ${m.id})`);
        }

        // Look for saving throw proficiencies
        if (m.type === 'proficiency' && m.subType.includes('saving-throw')) {
            console.log(`[${cat}] Prof Bonus: ${m.subType} (CompID: ${m.componentId}, CompTypeID: ${m.componentTypeId})`);
        }

        // Look for general saving throw bonuses
        if (m.type === 'bonus' && m.subType.includes('saving-throw')) {
            console.log(`[${cat}] Save Bonus: ${m.subType} = ${m.value} (StatId: ${m.statId})`);
        }
    });
}

console.log('\n--- Class Features for Prof Tracking ---');
data.classes.forEach(c => {
    console.log(`\nClass: ${c.definition.name} (Lvl ${c.level}, isStarting: ${c.isStartingClass})`);
    c.classFeatures.forEach(f => {
        const name = f.definition.name;
        if (name.toLowerCase().includes('proficiency')) {
            console.log(`  Feature: ${name} (ID: ${f.definition.id})`);
        }
    });
});
