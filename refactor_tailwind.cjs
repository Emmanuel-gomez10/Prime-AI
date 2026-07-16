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
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));

let changed = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content
        .replace(/bg-\[#0A0D14\]/g, 'bg-background')
        .replace(/bg-\[#12141D\]/g, 'bg-surface')
        .replace(/text-white\/50/g, 'text-secondary-text')
        .replace(/text-white\/40/g, 'text-secondary-text')
        .replace(/text-white\/60/g, 'text-secondary-text')
        .replace(/text-white\/70/g, 'text-secondary-text')
        .replace(/text-white\/80/g, 'text-primary-text')
        .replace(/text-white\/90/g, 'text-primary-text')
        .replace(/text-white/g, 'text-primary-text')
        .replace(/border-white\/5/g, 'border-divider')
        .replace(/border-white\/10/g, 'border-divider')
        .replace(/border-white\/15/g, 'border-divider')
        .replace(/bg-white\/5/g, 'bg-card-hover')
        .replace(/bg-white\/\[0\.02\]/g, 'bg-card-hover')
        .replace(/bg-white\/\[0\.04\]/g, 'bg-card-hover')
        .replace(/bg-white\/10/g, 'bg-card-hover')
        .replace(/hover:bg-white\/5/g, 'hover:bg-card-hover')
        .replace(/hover:bg-white\/10/g, 'hover:bg-card-hover');
    
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        changed++;
        console.log(`Updated Tailwind colors: ${file}`);
    }
});

console.log(`Done! Modified ${changed} files.`);
