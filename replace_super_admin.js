const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            if (!fullPath.includes('node_modules') && !fullPath.includes('.git') && !fullPath.includes('dist')) {
                results = results.concat(walk(fullPath));
            }
        } else {
            if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'backend', 'src')).concat(walk(path.join(__dirname, 'frontend', 'src')));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Fix authorize('Super Admin', 'Admin', ...)
    content = content.replace(/'Super Admin',\s*/g, '');
    
    // Fix types: 'Super Admin' | 'Admin'
    content = content.replace(/'Super Admin'\s*\|\s*/g, '');
    
    // Fix general occurrences in UI or elsewhere
    content = content.replace(/'Super Admin'/g, "'Admin'");
    content = content.replace(/Super Admin/g, 'Admin');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
