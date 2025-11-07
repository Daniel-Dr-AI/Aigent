#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const coreDir = path.join(baseDir, 'Aigent_Modules_Core');
const enterpriseDir = path.join(baseDir, 'Aigent_Modules_Enterprise');

const files = [
  ...fs.readdirSync(coreDir).filter(f => f.endsWith('_env.json')).map(f => path.join(coreDir, f)),
  ...fs.readdirSync(enterpriseDir).filter(f => f.endsWith('_env.json')).map(f => path.join(enterpriseDir, f))
];

const vars = new Map();

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const regex = /\$env\.([A-Z_][A-Z0-9_]*)/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const varName = match[1];
    if (!vars.has(varName)) {
      vars.set(varName, new Set());
    }
    vars.get(varName).add(path.relative(baseDir, file));
  }
});

const sorted = Array.from(vars.keys()).sort();

console.log('# Environment Variables Used\n');
console.log(`Total unique variables: ${sorted.length}\n`);
console.log('| Variable Name | Used in Files |');
console.log('|---------------|---------------|');

sorted.forEach(v => {
  const fileList = Array.from(vars.get(v)).join(', ');
  console.log(`| ${v} | ${vars.get(v).size} |`);
});

console.log('\n## Detailed Usage\n');

sorted.forEach(v => {
  console.log(`### ${v}`);
  console.log('Used in:');
  Array.from(vars.get(v)).sort().forEach(file => {
    console.log(`- ${file}`);
  });
  console.log();
});
