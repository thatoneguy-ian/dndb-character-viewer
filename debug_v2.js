import fs from 'fs';

const filePath = process.argv[2];
if (!filePath) {
    console.error('Please provide a file path');
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log('--- Character:', data.name, '---');
console.log('Base Stats:', JSON.stringify(data.stats.map(s => ({ id: s.id, value: s.value }))));

const ABILITY_MAP = { 1: "STR", 2: "DEX", 3: "CON", 4: "INT", 5: "WIS", 6: "CHA" };

console.log('\n--- Modifiers scan (score or saving-throw) ---');
for (const category in data.modifiers) {
    const list = data.modifiers[category];
    if (!Array.isArray(list)) continue;
    list.forEach(m => {
        if (m.subType.includes('score') || m.subType.includes('saving-throw')) {
            console.log(`[${category}] Type: ${m.type}, SubType: ${m.subType}, Value: ${m.value}, isGranted: ${m.isGranted}`);
        }
    });
}
