const fs = require('fs');
const path = require('path');
const glob = require('glob');

function loadTranslations(dir){
  const files = fs.readdirSync(dir).filter(f=>f.endsWith('.json'));
  const translations = {};
  files.forEach(file=>{ translations[file]=JSON.parse(fs.readFileSync(path.join(dir,file),'utf8')) });
  return {files, translations};
}

function extractKeys(root, patterns){
  const found = new Set();
  patterns.forEach(pattern=>{
    glob.sync(pattern, {nodir:true}).forEach(file=>{
      const content = fs.readFileSync(file,'utf8');
      const re = /\bt\s*\(\s*['`\"]([a-zA-Z][a-zA-Z0-9_\-:\.]*)['`\"]\s*\)/g;
      let m;
      while((m=re.exec(content))){ found.add(m[1]); }
    });
  });
  return found;
}

const translationsDir = path.resolve(__dirname,'../translations');
if(!fs.existsSync(translationsDir)){ console.error('translations dir not found:', translationsDir); process.exit(2); }
const {files, translations} = loadTranslations(translationsDir);
const used = extractKeys(path.resolve(__dirname,'..'), [path.resolve(__dirname,'../**/*.ts'), path.resolve(__dirname,'../**/*.tsx'), path.resolve(__dirname,'../**/*.js')]);

const missingReport = {};
used.forEach(k=>{ const missing=[]; files.forEach(f=>{ if(!(k in translations[f])) missing.push(f) }); if(missing.length) missingReport[k]=missing });
if(Object.keys(missingReport).length){ console.error('Missing keys:', missingReport); process.exit(1); }
console.log('OK - no missing translation keys');
process.exit(0);
