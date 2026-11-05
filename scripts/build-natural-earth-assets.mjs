import {paintEarth} from './paint-earth.mjs';
// Derive local textures and a matching geographic still. Inputs are credited in the asset README.
import sharp from 'sharp';
import {Vector3,Euler} from 'three';
const source=process.argv[2];if(!source)throw Error('Supply the NASA BMNG JPEG');
const {data,info}=await sharp(source).resize(4096,2048).removeAlpha().raw().toBuffer({resolveWithObject:true});
// A small opaque-paint palette replaces photographic colour variation.
// Work per texel: no spatial filter, resampling warp, or changed coastline.
paintEarth(data);
await sharp(data,{raw:info}).webp({quality:91}).toFile('public/images/earth/natural-earth.webp');
await sharp('/tmp/earth-elevation.jpg').resize(2048,1024).webp({lossless:true}).toFile('public/images/earth/earth-elevation.webp');
await sharp('/tmp/earth-normal.jpg').webp({lossless:true}).toFile('public/images/earth/earth-normal.webp');
// Soften the cloud alpha, not the geographic surface. Warm whites avoid hard satellite flecks.
const alpha=await sharp('/tmp/earth-clouds.png').extractChannel(3).blur(.65).raw().toBuffer();
const cloud=Buffer.alloc(1024*512*4);
for(let i=0;i<alpha.length;i++){cloud[i*4]=249;cloud[i*4+1]=248;cloud[i*4+2]=241;cloud[i*4+3]=Math.min(255,Math.round(alpha[i]*1.15));}
await sharp(cloud,{raw:{width:1024,height:512,channels:4}}).webp({lossless:true}).toFile('public/images/earth/earth-clouds.webp');
const regional=await sharp('public/images/earth/vancouver-colour.webp').removeAlpha().raw().toBuffer();
const width=1800,height=675,out=Buffer.alloc(width*height*4),ix=new Euler(-10*Math.PI/180,0,0),iy=new Euler(0,-33.12*Math.PI/180,0);
for(let y=0;y<height;y++)for(let x=0;x<width;x++){
 const px=(x/width-.5)*.12,py=.668-y/height*.045,r=px*px+py*py;if(r>1)continue;
 const z=Math.sqrt(1-r),v=new Vector3(px,py,z).applyEuler(ix).applyEuler(iy),u=(Math.atan2(-v.z,v.x)+Math.PI)/(2*Math.PI),vv=(Math.PI/2-Math.asin(v.y))/Math.PI;
 const a=(Math.min(2047,Math.floor(vv*2048))*4096+Math.min(4095,Math.floor(u*4096)))*3,c=(Math.min(511,Math.floor(vv*512))*1024+Math.min(1023,Math.floor(u*1024)))*4,b=(y*width+x)*4;
 const lon=u*360-180,lat=90-vv*180;
 const rx=Math.max(0,Math.min(3583,Math.floor((lon+130.5)/15.75*3584))),ry=Math.max(0,Math.min(2047,Math.floor((54-lat)/9*2048))),ra=(ry*3584+rx)*3;
 const ca=cloud[c+3]/255*.28,haze=Math.pow(1-z,4)*.7;
 for(let k=0;k<3;k++){const colour=regional[ra+k]*(1-ca)+cloud[c+k]*ca;out[b+k]=Math.round(colour*(1-haze)+[201,224,239][k]*haze);}out[b+3]=255;
}
await sharp(out,{raw:{width,height,channels:4}}).webp({quality:91}).toFile('public/images/earth/natural-horizon.webp');
