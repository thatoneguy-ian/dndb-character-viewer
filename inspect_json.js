const fs = require('fs');

const file = process.argv[2];
const pattern = process.argv[3];

if (!file) {
    console.log('Usage: node inspect_json.js <file> [pattern]');
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(file, 'utf8'));

if (pattern) {
    const results = [];
    const search = (obj, path = '') => {
        if (!obj || typeof obj !== 'object') return;

        if (Array.isArray(obj)) {
            obj.forEach((item, i) => search(item, `${path}[${i}]`));
        } else {
            for (const key in obj) {
                if (key === 'subType' && String(obj[key]).includes(pattern)) {
                    results.push({ path, ...obj });
                }
                search(obj[key], `${path}.${key}`);
            }
        }
    };
    search(data.modifiers);
    console.log(JSON.stringify(results, null, 2));
} else {
    // Just output basic info
    console.log('Character:', data.name);
    console.log('Stats:', JSON.stringify(data.stats));
    console.log('Modifier keys:', Object.keys(data.modifiers));
}
