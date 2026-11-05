import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import ts from 'typescript';
const exports = {};
new Function('exports', ts.transpileModule(fs.readFileSync(new URL('../src/lib/harbour-motion.ts', import.meta.url),'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(exports);
const planes = [exports.harbourMotion(0), exports.harbourMotion(1)];
const frames = planes.map(p => [...p.css.matchAll(/([\d.]+)%\{transform:translate\(([\d.]+)px,([\d.]+)px\)/g)].map(m=>({x:+m[2],y:+m[3]})));
test('planes remain separated through the staggered loop',()=>{
  let minimum=Infinity;
  for(let t=0;t<planes[0].duration;t++) {
    const a=frames[0][(t-planes[0].delay)%planes[0].duration], b=frames[1][(t-planes[1].delay)%planes[0].duration];
    if(a.x<1600&&b.x<1600) minimum=Math.min(minimum,Math.hypot(a.x-b.x,a.y-b.y));
  }
  assert.ok(minimum>26,`Aircraft separation ${minimum}px is smaller than their silhouettes`);
});
test('dock stops are stationary and water turns stay below the outer pier',()=>{
  for(const f of frames) {
    for(let t=71;t<=104;t++) assert.deepEqual(f[t],f[70]);
    for(let t=38;t<=152;t++) assert.ok(f[t].y>=490,'Taxi path crosses the dock fingers');
    for(let t=105;t<152;t++) assert.ok(Math.hypot(f[t+1].x-f[t].x,f[t+1].y-f[t].y)<10,'Taxi speed jumps');
  }
});
test('rollout slows down and the takeoff run accelerates',()=>{
  for(const f of frames) {
    const distance=t=>Math.hypot(f[t+1].x-f[t].x,f[t+1].y-f[t].y);
    assert.ok(distance(18)>distance(28)&&distance(28)>distance(37));
    assert.ok(distance(152)<distance(162)&&distance(162)<distance(171));
  }
});
