const fs = require('fs');
const path = require('path');

const charData = JSON.parse(fs.readFileSync('exampleJSON/Ray Jay Doe.json', 'utf8'));

const statNames = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

console.log('--- BASE STATS ---');
charData.stats.forEach((s, i) => {
    console.log(`${statNames[i]}: ${s.value}`);
});

console.log('\n--- CLASSES ---');
charData.classes.forEach(c => {
    console.log(`${c.definition.name} (ID: ${c.definition.id}) Level ${c.level} (Starting: ${c.isStartingClass})`);
});

const featureMap = {};
charData.classes.forEach(c => {
    c.classFeatures.forEach(f => {
        featureMap[f.definition.id] = f.definition;
    });
});

console.log('\n--- SAVING THROW PROFICIENCIES ---');
const allModifiers = [
    ...charData.modifiers.race,
    ...charData.modifiers.class,
    ...charData.modifiers.feat,
    ...charData.modifiers.item,
    ...charData.modifiers.background,
];

allModifiers.filter(m => m.type === 'proficiency' && m.subType.includes('saving-throws')).forEach(m => {
    const feature = featureMap[m.componentId];
    console.log(`[${m.type}] ${m.subType}`);
    console.log(`  - Feature: ${feature ? feature.name : 'Unknown'} (ID: ${m.componentId})`);
    console.log(`  - Level: ${feature ? feature.requiredLevel : 'N/A'}`);
    console.log(`  - Granted: ${m.isGranted}`);
});
