// NASA GIBS Blue Marble, EPSG:4326, 500m matrix 7 (2.25 degrees per tile).
import sharp from 'sharp';
import {paintEarth} from './paint-earth.mjs';
const tiles=[];
for(let row=16;row<=19;row++)for(let col=22;col<=28;col++){
 const response=await fetch(`https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/BlueMarble_ShadedRelief/default/500m/7/${row}/${col}.jpeg`);
 if(!response.ok)throw Error(`NASA tile ${row}/${col}: ${response.status}`);
 tiles.push({input:Buffer.from(await response.arrayBuffer()),left:(col-22)*512,top:(row-16)*512});
}
const {data,info}=await sharp({create:{width:3584,height:2048,channels:3,background:'#fff'}}).composite(tiles).removeAlpha().raw().toBuffer({resolveWithObject:true});
paintEarth(data);
await sharp(data,{raw:info}).webp({quality:94}).toFile('public/images/earth/vancouver-colour.webp');
