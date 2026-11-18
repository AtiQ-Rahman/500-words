// Checks the written word entries. Run:  node tools/check.js            (everything)
//                                        node tools/check.js 51 100     (only #51-#100)
// Loads tools/words_detail.js and every tools/detail/*.js the same way the app does.
const fs=require('fs'),path=require('path');
const BASE=path.join(__dirname,'..');
const book=fs.readFileSync(path.join(BASE,'tools/words_book.txt'),'utf8').split('\n').filter(l=>/^#\d+-\d+:/.test(l))
  .flatMap(l=>l.replace(/^[^:]*:/,'').split(',').map(w=>w.trim().toLowerCase()).filter(Boolean));
let src=fs.readFileSync(path.join(BASE,'tools/words_detail.js'),'utf8');
const dir=path.join(BASE,'tools/detail');
const parts=fs.existsSync(dir)?fs.readdirSync(dir).filter(f=>f.endsWith('.js')).sort():[];
for(const f of parts)src+='\n'+fs.readFileSync(path.join(dir,f),'utf8');
let WD_DETAIL,WD_CONF;
try{({WD_DETAIL,WD_CONF}=new Function(src+'\nreturn{WD_DETAIL,WD_CONF}')())}catch(e){console.log('JavaScript error:',e.message);process.exit(1)}
const a=+process.argv[2]||1,z=+process.argv[3]||book.length,errs=[];
const bad=(n,m)=>errs.push(`#${n} ${book[n-1]||'?'}: ${m}`);
const BN=/[ঀ-৿]/;
const stem=w=>w.replace(/(e|y)$/,'').slice(0,Math.max(4,Math.min(w.length-1,6)));
for(let n=a;n<=z;n++){const d=WD_DETAIL[n];if(!d){bad(n,'missing');continue}const w=book[n-1];
  for(const k of ['pos','en','bn','mn','ex','exb','syn','ant','fb'])if(typeof d[k]!='string'||!d[k].trim())bad(n,`"${k}" is empty`);
  if(d.forms!=null&&typeof d.forms!='string')bad(n,'"forms" must be text ("" if none)');
  for(const k of ['bn','mn','exb'])if(d[k]&&!BN.test(d[k]))bad(n,`"${k}" should be in বাংলা`);
  if(d.ex&&!d.ex.toLowerCase().includes(stem(w)))bad(n,`example does not contain "${w}"`);
  if(d.fb&&(d.fb.match(/___/g)||[]).length!=1)bad(n,'fill-in sentence needs exactly one ___');
  if(d.fb&&d.fb.toLowerCase().includes(stem(w)))bad(n,'fill-in sentence gives the word away');
  if(!Array.isArray(d.cf))bad(n,'"cf" must be a list ([] if none)');else d.cf.forEach(g=>{if(!WD_CONF[g])bad(n,`close-word group "${g}" does not exist`);else if(!WD_CONF[g].w.some(x=>x.w==w))bad(n,`group "${g}" does not list "${w}"`)})}
for(const[g,G]of Object.entries(WD_CONF)){
  if(!G.t||!G.tip||!Array.isArray(G.w)||G.w.length<2)errs.push(`group ${g}: needs t, tip and at least 2 words`);
  (G.w||[]).forEach(x=>{if(!x.w||!x.u||!x.ex)errs.push(`group ${g}: word "${x.w}" needs w, u, ex`);else if(!x.ex.toLowerCase().includes(stem(x.w)))errs.push(`group ${g}: example for "${x.w}" does not contain it`)});
  (G.q||[]).forEach(([s,ans])=>{if((s.match(/___/g)||[]).length!=1)errs.push(`group ${g}: question needs one ___: ${s}`);if(!(G.w||[]).some(x=>x.w==ans))errs.push(`group ${g}: answer "${ans}" is not one of its words`)});
  if(!Array.isArray(G.q)||G.q.length<2)errs.push(`group ${g}: needs at least 2 questions`)}
const done=Object.keys(WD_DETAIL).length;
if(errs.length){console.log(errs.join('\n'));console.log(`\n${errs.length} problem(s). ${done} words written.`);process.exit(1)}
console.log(`OK: #${a}-#${z} fine. ${done} words written, ${Object.keys(WD_CONF).length} close-word groups.`);
