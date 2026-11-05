import sharp from 'sharp';
import views from './floatplane-views.json';
import type { Pose, Scene } from './floatplane-view';

type Face = (color: string, points: number[][]) => void;
type Part = {color: string; width?: number; points: number[][]};
const radians = (degrees: number) => degrees*Math.PI/180;

function airframe(accent: string) {
  const parts: Part[] = [];
  const face: Face = (color, points) => parts.push({color, points});
  const line = (color: string, width: number, points: number[][]) => parts.push({color, width, points});

  // Loft each hull through sections, including the raised bow and keel step.
  for (const side of [-1,1]) {
    const y = side*8;
    const hull = [[-22,.3,2.8,3.1],[-16,1.7,1.6,3.7],[-3,2,1.2,4],
      [-2.9,2,.1,4],[12,2,.35,4.2],[20,1.5,1.7,4.6],[25,.1,4.3,4.7]];
    const rings = hull.map(([x,w,low,high])=>[
      [x,y-w,high],[x,y+w,high],[x,y+w,low+.6],[x,y,low],[x,y-w,low+.6]
    ]);
    loft(rings,['#d6dfda','#99adb1','#69868f','#788f96','#a4b7b8'],face);
    line('#596f77',.8,[[12,side*3,11.8],[16,y,4.1],[-6,side*3.8,10.4],[-8,y,3.9]]);
    if (side === 1) line('#adbfc0',.65,[[9,y,4],[9,-y,4]]);
  }

  const stations = [[-27,.5,13.1,15],[-18,1.5,12.2,15.8],[-7,3.8,9.8,18.8],
    [6,4.8,9.1,19.7],[13,4.4,9.4,18.9],[18,3.6,10.4,16.7],[22,3.2,11,16.4]];
  const body = stations.map(([x,w,b,t])=>[[x,-.76*w,t],[x,.76*w,t],[x,w,t-1.1],
    [x,w,b+1.6],[x,.66*w,b],[x,-.66*w,b],[x,-w,b+1.6],[x,-w,t-1.1]]);
  loft(body,['#f7f4e6','#e1e0cf','#e6e4d5','#b2bec0','#91a4a9','#a2afb1','#d3d9cf','#e8eadd'],face);
  for (const side of [-1,1]) {
    const y=side*4.85;
    face(accent,[[-16,side*1.9,13.4],[13,side*4.5,13.9],[14,side*4.3,13.15],[-16,side*1.9,13.1]]);
    for (const x of [-6,-1,4]) face('#486375',[[x,y,14.2],[x+3.9,y,14.2],[x+3.6,y,18.1],[x+.15,y,18.1]]);
    face('#38566a',[[9,y,14.2],[15,side*4.05,14.6],[12,side*4.15,18.35],[9,y,18.35]]);
    face('#698994',[[15,side*4.06,14.6],[16.9,0,15.1],[13.1,0,18.7],[12,side*4.15,18.35]]);

    const outline=[[10,1],[10.2,36],[8.5,41.5],[5.6,43],[1.3,42.5],[-.9,39],[-2,1]];
    const lower=outline.map(([x,w])=>[x,w*side,19.6+w*.015]);
    const upper=lower.map(([x,y,z])=>[x,y,z+1.1]);
    loft([lower,upper],outline.map(()=> '#94a8ac'),face);
    face('#e4e7df',upper); face('#8499a3',lower);
    line('#6c8188',.75,[[3,side*4,10.2],[5.3,side*23,19.7]]);
    face('#d1dcda',[[-20,0,14],[-22,12*side,14.5],[-26,13*side,14.5],[-27,0,14]]);
  }
  face(accent,[[-17,0,15],[-23,0,23.5],[-26,0,24.5],[-27.4,0,23.5],[-27.1,0,14.4]]);
  const cowling = [18.5,23,24].map((x,i)=>Array.from({length:16},(_,j)=>{
    const angle=2*Math.PI*j/16, r=i===2?3.3:4.05;
    return [x,r*Math.cos(angle),13.9+r*Math.sin(angle)];
  }));
  loft(cowling,Array.from({length:16},(_,i)=>i<8?'#a5b4b8':'#83979d'),face);
  face('#465e68',cowling[2]);
  line('#68808c',.95,[[25.5,0,6],[25.5,0,22]]);
  line('#364b52',1.45,[[24,0,13.9],[26.6,0,13.9]]);
  return parts;
}

function loft(rings: number[][][], colors: string[], face: Face) {
  for (let k=1;k<rings.length;k++) for(let i=0;i<colors.length;i++) {
    const j=(i+1)%colors.length;
    face(colors[i],[rings[k-1][i],rings[k][i],rings[k][j],rings[k-1][j]]);
  }
}

function render(parts: Part[], yaw: number, elevation: number, density: number) {
  const c=Math.cos(radians(yaw)), s=Math.sin(radians(yaw));
  const low=Math.sin(radians(elevation)), up=Math.cos(radians(elevation));
  const project=([x,y,z]: number[])=>{
    const depth=x*s+y*c;
    return [views.pivotX+x*c-y*s,views.pivotY+depth*low-z*up,depth*up+z*low];
  };
  const paths=parts.map(part=>{
    const points=part.points.map(project);
    const coordinates=points.map(([x,y])=>x.toFixed(2)+','+y.toFixed(2)).join(' ');
    const shape=part.width
      ? `<polyline points="${coordinates}" fill="none" stroke="${part.color}" stroke-width="${part.width}" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<polygon points="${coordinates}" fill="${part.color}" stroke="${part.color}" stroke-width=".15" stroke-linejoin="round"/>`;
    return {shape,depth:points.reduce((sum,p)=>sum+p[2],0)/points.length};
  }).sort((a,b)=>a.depth-b.depth);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${views.width*density}" height="${views.height*density}" viewBox="0 0 ${views.width} ${views.height}">${paths.map(p=>p.shape).join('')}</svg>`);
}


export function paintFlight(scene: Scene, poses: Pose[], accent: string) {
  const parts = airframe(accent);
  const density = views[scene].density;
  const width = views.width*density, height = views.height*density;
  const cells = poses.map(({yaw, elevation}, i) => ({
    input: render(parts, yaw, elevation, density),
    left: i%views.columns*width,
    top: Math.floor(i/views.columns)*height,
  }));
  return sharp({create:{width:views.columns*width, height:Math.ceil(poses.length/views.columns)*height,
    channels:4,background:'#0000'}}).composite(cells).webp({quality:87, alphaQuality:100}).toBuffer();
}
