// Separate the crowns from the original 1600 × 700 hero painting.
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
// Trunk x, tip y and fixed lower anchor in source pixels.
const crowns = [
  [0,411,572],[34,372,585],[73,432,577],[108,435,586],[151,461,590],
  [194,501,596],[233,470,604],[278,530,604],[310,504,610],[355,541,616],
  [374,563,617],[407,548,625],[437,567,627],[471,586,634],[492,561,636],
  [525,564,642],[557,599,652],[580,593,652],[607,593,658],[625,613,661],
  [650,632,664],[670,611,669],[704,627,671],[720,644,673],
  [978,612,658],[1016,594,652],[1053,576,639],[1079,552,632],[1115,560,625],
  [1149,505,614],[1186,543,609],[1212,562,608],[1230,544,606],[1255,554,603],
  [1281,511,599],[1311,493,597],[1344,516,595],[1360,527,595],[1388,475,592],
  [1430,467,586],[1483,419,576],[1518,444,570],[1556,372,568],[1597,405,569],
];

const art = 'public/images/scenic';
const {data: original, info: {width, height}} = await sharp(art + '/forest.webp').removeAlpha().raw().toBuffer({resolveWithObject: true});
const count = width * height;
const soft = await sharp(art + '/forest.webp').removeAlpha().blur(9).raw().toBuffer();
const owner = new Int16Array(count).fill(-1);
const scores = new Float32Array(count).fill(Infinity);
const core = Buffer.alloc(count);
const smooth = t => { t = Math.max(0, Math.min(t, 1)); return t*t*(3-2*t); };

// Draw shorter trees first and crop each sprite to its original source pixels.
const trees = crowns.toSorted((a,b) => (a[2]-a[1])-(b[2]-b[1])).map(([x,tip,root]) => {
  const radius = Math.ceil(8+(root-tip)*0.51);
  const left=Math.max(0,x-radius), right=Math.min(width,x+radius+1);
  return {x,tip,root,left,top:tip-4,width:right-left,height:root-tip+5};
});
for (const [id, t] of trees.entries()) {
  for (let y=t.top; y<t.root; y++) {
    const radius=5+.50*Math.max(0,y-t.tip);
    for (let x=Math.max(0,Math.ceil(t.x-radius)); x<=Math.min(width-1,t.x+radius); x++) {
      const i=y*width+x;
      const score=Math.abs(x-t.x)/radius + .15*(y-t.top)/t.height;
      if (score < scores[i]) { owner[i]=id; scores[i]=score; }
    }
  }
}
for (let i=0;i<count;i++) {
  if (owner[i]<0) continue;
  const g=original[3*i+1], b=original[3*i+2];
  if ((b<208 && b-g<43) || (b<158 && b-g<64)) core[i]=255;
}
async function maskBlur(radius) {
  return sharp(core,{raw:{width,height,channels:1}}).blur(radius).greyscale().raw().toBuffer();
}
const fringe=await maskBlur(2);
const edge=await maskBlur(.7);
const density=await maskBlur(9);

// Estimate hidden sky and ridges using only pixels outside the needles
// and their antialiased fringe. Coarse levels supply colour in large holes.
// Existing visible landscape is copied straight from the painting.
const levels=[];
let level={w:width,h:height,data:new Float32Array(count*4)};
for (let i=0;i<count;i++) {
  if (core[i] || fringe[i]>2) continue;
  for (let c=0;c<3;c++) level.data[4*i+c]=original[3*i+c];
  level.data[4*i+3]=1;
}
levels.push(level);
while (level.w>1 || level.h>1) {
  const w=Math.ceil(level.w/2), h=Math.ceil(level.h/2);
  const data=new Float32Array(w*h*4);
  for (let y=0;y<level.h;y++) for (let x=0;x<level.w;x++) {
    const from=(y*level.w+x)*4, to=((y>>1)*w+(x>>1))*4;
    for (let c=0;c<4;c++) data[to+c]+=level.data[from+c];
  }
  level={w,h,data}; levels.push(level);
}
function background(x,y) {
  for (let n=0;n<levels.length;n++) {
    const {w,h,data}=levels[n], scale=2**n;
    const u=(x+.5)/scale-.5, v=(y+.5)/scale-.5;
    const u0=Math.floor(u), v0=Math.floor(v);
    const sums=[0,0,0,0];
    for (let dy=0;dy<2;dy++) for (let dx=0;dx<2;dx++) {
      const col=Math.max(0,Math.min(w-1,u0+dx)), row=Math.max(0,Math.min(h-1,v0+dy));
      const weight=(dx?u-u0:1-u+u0)*(dy?v-v0:1-v+v0);
      for (let c=0;c<4;c++) sums[c]+=weight*data[(row*w+col)*4+c];
    }
    if (sums[3]>.12*scale*scale || n===levels.length-1)
      return sums.slice(0,3).map(v=>v/sums[3]);
  }
}

const plate=Buffer.from(original);
const rgba=Buffer.alloc(count*4);
for (let y=0;y<height;y++) for (let x=0;x<width;x++) {
  const i=y*width+x, id=owner[i];
  if (id<0 || (!core[i] && edge[i]<=2)) continue;
  const tree=trees[id], fade=smooth((tree.root-y)/30);
  const inferred=background(x,y);
  // Leave clean ridge and sky pixels in the fixed plate, including the
  // pinholes between needles. Only mixed edge colours need unmatting.
  if (!core[i] && Math.max(...inferred.map((v,c)=>v-original[3*i+c]))<5) continue;
  // Deep inside the overlapping forest, retain a soft understory behind
  // the trunks. Do not use blurred tree pixels around an exposed silhouette.
  const understory=smooth((density[i]/255-.68)/.25)*smooth((y-tree.tip-30)/70);
  let alpha=0;
  for (let c=0;c<3;c++) {
    const s=original[3*i+c], hidden=inferred[c]*(1-understory)+soft[3*i+c]*understory;
    const b=Math.round(s+(hidden-s)*fade);
    plate[3*i+c]=b;
    if (s<b) alpha=Math.max(alpha,(b-s)/b);
    if (s>b) alpha=Math.max(alpha,(s-b)/(255-b));
  }
  // Solid branches occlude what is behind them. Recover the unblended
  // colour of edge pixels so they do not carry a light rim when rotated.
  const a=Math.min(255,Math.ceil(255*Math.max(alpha,fade*smooth((fringe[i]-95)/105))));
  if (!a) continue;
  rgba[4*i+3]=a;
  for (let c=0;c<3;c++) {
    const b=plate[3*i+c], s=original[3*i+c];
    rgba[4*i+c]=Math.round(b+(s-b)*255/a);
  }
}

const atlasWidth=1024, gap=3;
let ax=gap, ay=gap, rowHeight=0;
for (const t of trees) {
  if (ax+t.width+gap>atlasWidth) {ax=gap;ay+=rowHeight+gap;rowHeight=0;}
  t.ax=ax; t.ay=ay; ax+=t.width+gap; rowHeight=Math.max(rowHeight,t.height);
}
const atlasHeight=ay+rowHeight+gap, atlas=Buffer.alloc(atlasWidth*atlasHeight*4);
for (const [id,t] of trees.entries()) {
  const sprite=Buffer.alloc(t.width*t.height*4);
  const canExtend=new Uint8Array(t.width*t.height);
  for (let row=0;row<t.height;row++) for (let col=0;col<t.width;col++) {
    const i=(t.top+row)*width+t.left+col, p=row*t.width+col;
    if (owner[i]===id) rgba.copy(sprite,p*4,i*4,i*4+4);
    else if (owner[i]>id && rgba[4*i+3]===255) canExtend[p]=1;
  }
  // Grow hidden paint under opaque nearer branches. This overlap is
  // invisible at rest and prevents cracks when two adjacent trees separate.
  for (let step=0;step<9;step++) {
    const prev=Buffer.from(sprite);
    for (let p=0;p<canExtend.length;p++) {
      if (!canExtend[p] || prev[4*p+3]) continue;
      const neighbours=[p-t.width,p+t.width];
      if (p%t.width>0) neighbours.push(p-1);
      if (p%t.width<t.width-1) neighbours.push(p+1);
      const q=neighbours.find(q=>q>=0 && q<canExtend.length && prev[4*q+3]>=245);
      if (q!==undefined) prev.copy(sprite,4*p,4*q,4*q+4);
    }
  }
  for (let y=0;y<t.height;y++) sprite.copy(atlas,((t.ay+y)*atlasWidth+t.ax)*4,y*t.width*4,(y+1)*t.width*4);
}
await sharp(plate,{raw:{width,height,channels:3}}).webp({lossless:true}).toFile(art+'/forest-plate.webp');
await sharp(atlas,{raw:{width:atlasWidth,height:atlasHeight,channels:4}}).webp({lossless:true}).toFile(art+'/forest-trees.webp');
await writeFile('src/components/home/forest-trees.json', JSON.stringify({atlasWidth,atlasHeight,trees},null,2)+'\n');
