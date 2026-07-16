const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.git')) {
                results = results.concat(walk(file));
            }
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.html') || file.endsWith('.json')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));
files.push(path.join(__dirname, 'index.html'));
files.push(path.join(__dirname, 'package.json'));

let changed = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content
        .replace(/StudentFrond AI/g, 'Prime AI')
        .replace(/StudentFrond/g, 'Prime')
        .replace(/studentfrond_/g, 'prime_')
        .replace(/studentfrond/g, 'prime')
        .replace(/StudentUser/g, 'PrimeUser');
    
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        changed++;
        console.log(`Updated: ${file}`);
    }
});

console.log(`Done! Modified ${changed} files.`);
