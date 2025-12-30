const fs = require('fs');
const path = require('path');

const charData = JSON.parse(fs.readFileSync('exampleJSON/Remmy (Rembrant).json', 'utf8'));

console.log('Modifiers keys:', Object.keys(charData.modifiers));
console.log('Is item an array?', Array.isArray(charData.modifiers.item));
console.log('Item length:', charData.modifiers.item ? charData.modifiers.item.length : 'N/A');
