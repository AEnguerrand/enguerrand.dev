import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=readFileSync(new URL('../src/scripts/geographic-globe.ts',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText.replace("import('three')",'Promise.resolve(THREE)').replace(/export \{\};?/,'');
function fixture(reduced=false,failTexture=false,mode="horizon"){
 let Klass,observer,renderer,loads=0;
 class Events {listeners={};addEventListener(n,fn){this.listeners[n]=fn;}fire(n,e={}){this.listeners[n]?.(e);}}
 const button=new Events();button.hidden=true;button.setAttribute=()=>{};
 const canvas=new Events();canvas.getBoundingClientRect=()=>({width:900,height:300});
 const doc=new Events();doc.hidden=false;
 const media=new Events();media.matches=reduced;
 class Base extends Events {dataset={texture:'/earth.webp',speed:'.012',mode};attrs=new Set();querySelector(s){return s==='canvas'?canvas:button;}setAttribute(n){this.attrs.add(n);}removeAttribute(n){this.attrs.delete(n);}hasAttribute(n){return this.attrs.has(n);}}
 class Group {rotation={x:0};add() {}}
 class Mesh {rotation={y:0};constructor(g,m){this.geometry=g;this.material=m;}}
 class Disposable {dispose(){this.disposed=true;}}
 class Renderer extends Disposable {constructor(){super();renderer=this;}setPixelRatio(){}setSize(){}render(){this.renders=(this.renders||0)+1;}setAnimationLoop(fn){this.loop=fn;}}
 const THREE={WebGLRenderer:Renderer,TextureLoader:class {async loadAsync(){loads++;if(failTexture)throw Error('texture');return new Disposable();}},SRGBColorSpace:'srgb',Scene:class {add(){}},OrthographicCamera:class {position={z:0}},Group,Mesh,SphereGeometry:Disposable,MeshPhongMaterial:Disposable,ShaderMaterial:Disposable,Vector2:class{},AmbientLight:class{},DirectionalLight:class{position={set(){}}}};
 vm.runInNewContext(code,{THREE,HTMLElement:Base,AbortController,document:doc,devicePixelRatio:2,matchMedia:()=>media,IntersectionObserver:class{constructor(fn){observer=this;this.callback=fn;}observe(){}disconnect(){this.disconnected=true;}},ResizeObserver:class{observe(){}disconnect(){}},customElements:{get:()=>false,define:(_,k)=>Klass=k}});
 const el=new Klass();el.connectedCallback();
 const flush=()=>new Promise(resolve=>setImmediate(resolve));
 return {el,button,canvas,doc,media,flush,visible:async value=>{observer.callback([{isIntersecting:value}]);await flush();},renderer:()=>renderer,loads:()=>loads};
}
test('reduced motion uses the geographic still without loading WebGL',async()=>{const f=fixture(true);await f.visible(true);assert.equal(f.loads(),0);assert.equal(f.renderer(),undefined);assert.equal(f.button.hidden,true);});
test('rotation pauses offscreen, in hidden tabs and for reduced motion',async()=>{const f=fixture();assert.equal(f.loads(),0);await f.visible(true);assert.equal(f.el.dataset.motion,'running');assert.equal(typeof f.renderer().loop,'function');await f.visible(false);assert.equal(f.renderer().loop,null);await f.visible(true);f.doc.hidden=true;f.doc.fire('visibilitychange');assert.equal(f.renderer().loop,null);f.doc.hidden=false;f.doc.fire('visibilitychange');assert.equal(typeof f.renderer().loop,'function');f.media.matches=true;f.media.fire('change');assert.equal(f.renderer().loop,null);assert.equal(f.button.hidden,true);});
test('texture failure retains fallback and releases renderer',async()=>{const f=fixture(false,true);await f.visible(true);assert.equal(f.el.hasAttribute('data-ready'),false);assert.equal(f.renderer().disposed,true);assert.equal(f.button.hidden,true);});
test('context loss retains fallback and does not restart on visibility changes',async()=>{const f=fixture();await f.visible(true);f.canvas.fire('webglcontextlost',{preventDefault(){}});assert.equal(f.el.hasAttribute('data-ready'),false);await f.visible(false);await f.visible(true);assert.equal(f.renderer().loop,null);assert.equal(f.button.hidden,true);});
test('removing globe stops rendering and disposes GPU resources',async()=>{const f=fixture();await f.visible(true);f.el.disconnectedCallback();assert.equal(f.renderer().loop,null);assert.equal(f.renderer().disposed,true);assert.equal(f.el.hasAttribute('data-ready'),false);});

test('Talks mode renders a still globe under reduced motion and accepts the shared map orientation',async()=>{
 const f=fixture(true,false,'sphere');await f.visible(true);
 assert.equal(f.el.hasAttribute('data-ready'),true);
 assert.equal(f.renderer().loop,null);
 f.el.fire('globe-orientation',{detail:[111.89,-40.76,0]});
 assert.ok(Math.abs(f.el.mesh.rotation.y-21.89*Math.PI/180)<1e-10);
 assert.ok(Math.abs(f.el.earth.rotation.x-40.76*Math.PI/180)<1e-10);
 f.el.disconnectedCallback();
});
