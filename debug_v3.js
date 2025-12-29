import fs from 'fs';

const filePath = process.argv[2];
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log('--- Character:', data.name, '---');
console.log('Stats (Base):');
data.stats.forEach(s => console.log(`${s.id}: ${s.value}`));

console.log('\n--- Active Modifiers (isGranted: true) ---');
for (const cat in data.modifiers) {
    const list = data.modifiers[cat];
    if (!Array.isArray(list)) continue;
    list.forEach(m => {
        if (!m.isGranted) return;
        if (m.subType.includes('score') || m.subType.includes('saving-throw')) {
            console.log(`[${cat}] Type: ${m.type}, Sub: ${m.subType}, Val: ${m.value}, StatId: ${m.statId}, Fixed: ${m.fixedValue}`);
        }
    });
}

console.log('\n--- Classes ---');
data.classes.forEach(c => console.log(`${c.definition.name} Level ${c.level}, isStarting: ${c.isStartingClass}`));
console.log('startingClassId:', data.startingClassId);
