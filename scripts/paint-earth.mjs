export function paintEarth(data) {
const landPalette=[
 [31,62,72],[49,78,79],[69,94,85],[94,113,95],
 [126,139,111],[161,166,135],[193,192,162],[221,217,193],
];
const smoothstep=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
for(let i=0;i<data.length;i+=3){
 const [r,g,b]=data.subarray(i,i+3),l=.2126*r+.7152*g+.0722*b;
 if(b>r*1.15&&r<60){
  // Quiet blue-grey water lets the painted land and clouds define the form.
  data[i]=49+l*.16;data[i+1]=83+l*.22;data[i+2]=105+l*.27;
 }else if(Math.max(r,g,b)-Math.min(r,g,b)<24&&l>170){
  data[i]=207+(l-170)*.47;data[i+1]=220+(l-170)*.35;data[i+2]=224+(l-170)*.30;
 }else{
  const level=Math.min(7,Math.max(0,l/29)),band=Math.floor(level);
  const low=landPalette[band],high=landPalette[Math.min(7,band+1)];
  // Firm tonal planes with short transitions, as in the forest illustration.
  // A small residual preserves fine geographic detail inside each paint tone.
  const mix=smoothstep(.35,.65,level-band),detail=(level-band-.5)*3;
  for(let k=0;k<3;k++)data[i+k]=Math.round(low[k]+(high[k]-low[k])*mix+detail);
 }
}
}
