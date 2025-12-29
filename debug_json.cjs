const fs = require('fs');
const path = 'c:/StoreLocal/dndcharacterExt/dnd-quick-view/dndb-character-viewer/exampleJSON/Ray Jay Doe.json';
const json = JSON.parse(fs.readFileSync(path, 'utf8'));
const data = json.data || json;

const startingClassId = data.startingClassId;
console.log(`Starting Class ID: ${startingClassId}`);

console.log('\n--- CLASS FEATURES ---');
const featureMap = {};
data.classes.forEach(c => {
    console.log(`Class: ${c.definition.name} (isStarting: ${c.isStartingClass})`);
    c.classFeatures.forEach(f => {
        featureMap[f.definition.id] = `${c.definition.name}: ${f.definition.name}`;
    });
});

const allClassMods = data.modifiers.class || [];
const allRaceMods = data.modifiers.race || [];
const allFeatMods = data.modifiers.feat || [];
const allItemMods = data.modifiers.item || [];
const allBgMods = data.modifiers.background || [];

const allMods = [...allClassMods, ...allRaceMods, ...allFeatMods, ...allItemMods, ...allBgMods];

console.log('\n--- SAMPLE MODIFIERS (First 20) ---');
allMods.slice(0, 20).forEach(m => {
    const featureName = featureMap[m.componentId] || 'Unknown';
    console.log(`- ${m.type}/${m.subType}: val=${m.value}, compId=${m.componentId}, compTypeId=${m.componentTypeId}, Feature=${featureName}`);
});

console.log('\n--- ALL SAVING THROW PROFICIENCIES ---');
allMods
    .filter(m => m && m.type === 'proficiency' && m.subType.includes('saving-throws'))
    .forEach(m => {
        const featureName = featureMap[m.componentId] || 'Unknown';
        console.log(`- ${m.subType}: val=${m.value}, compId=${m.componentId}, compTypeId=${m.componentTypeId}, isGranted=${m.isGranted}, Feature=${featureName}`);
    });

console.log('\n--- GLOBAL SAVING THROW BONUSES ---');
data.modifiers.class.concat(data.modifiers.race, data.modifiers.feat, data.modifiers.item, data.modifiers.background)
    .filter(m => m && m.type === 'bonus' && (m.subType === 'saving-throws' || m.subType === 'saving-throws-bonus'))
    .forEach(m => {
        console.log(`- ${m.subType}: ID=${m.id}, value=${m.value}`);
    });
