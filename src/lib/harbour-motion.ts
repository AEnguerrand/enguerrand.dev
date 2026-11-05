/** Painted scene coordinates, not aviation navigation data.
 * Bake arc-length paths into CSS at build time: no animation runtime or hydration.
 */
type Point = [number, number];
export type Leg = { duration: number; points: [Point, Point, Point, Point]; speed: [number, number]; altitude?: [number, number]; water?: boolean };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
function curve(points: Leg['points'], t: number): Point {
  const q = 1 - t;
  return [0, 1].map(i => q ** 3 * points[0][i] + 3 * q * q * t * points[1][i] + 3 * q * t * t * points[2][i] + t ** 3 * points[3][i]) as Point;
}
export function track(leg: Leg, projection = .58) {
  const samples = Array.from({length: 161}, (_, i) => curve(leg.points, i / 160));
  const lengths = [0];
  for (let i = 1; i < samples.length; i++) lengths.push(lengths[i - 1] + Math.hypot(samples[i][0] - samples[i - 1][0], samples[i][1] - samples[i - 1][1]));
  const length = lengths[lengths.length - 1];
  return (u: number) => {
    if (length < .01) return {point: samples[0], angle: null, speed: 0};
    // Hermite distance interpolation preserves entry/exit speed between legs.
    const a = leg.speed[0] * leg.duration / length, b = leg.speed[1] * leg.duration / length;
    const distance = Math.max(0, Math.min(1, (-2*u**3+3*u*u) + (u**3-2*u*u+u)*a + (u**3-u*u)*b)) * length;
    let i = 1;
    while (i < 160 && lengths[i] < distance) i++;
    const fraction = (distance - lengths[i-1]) / Math.max(.0001, lengths[i]-lengths[i-1]);
    const t = (i-1+fraction)/160;
    const point = curve(leg.points,t), before = curve(leg.points,Math.max(0,t-.001)), after = curve(leg.points,Math.min(1,t+.001));
    const angle = Math.atan2((after[1]-before[1])/projection,after[0]-before[0])*180/Math.PI;
    const speed = Math.max(0, ((-6*u*u+6*u)+(3*u*u-4*u+1)*a+(3*u*u-2*u)*b)*length/leg.duration);
    return {point,angle,speed};
  };
}
export function harbourMotion(id: number, projection = .58) {
  const dx = id === 0 ? 0 : -27;
  const dy = 0; // Both berths sit on the clear, southern side of the outer finger.
  const dock: Point = [602+dx,490+dy];
  const legs: Leg[] = [
    {duration:18,points:[[1740,555],[1530,555],[1310,555],[1100,555]],speed:[36,35],altitude:[85,0]},
    {duration:20,points:[[1100,555],[1000,555],[920,555],[850,555]],speed:[35,5],water:true},
    {duration:32,points:[[850,555],[755,555],[665,490+dy],dock],speed:[5,0],water:true},
    {duration:34,points:[dock,dock,dock,dock],speed:[0,0],water:true},
    // Leave forwards, then follow a broad water turn below the dock fingers.
    {duration:18,points:[dock,[570+dx,490+dy],[575+dx,530+dy],[625+dx,530+dy]],speed:[0,4],water:true},
    {duration:30,points:[[625+dx,530+dy],[680,530+dy],[720,580],[800,580]],speed:[4,5],water:true},
    {duration:20,points:[[800,580],[920,580],[1060,580],[1260,580]],speed:[5,41],water:true},
    // The panorama departure turns into First Narrows. The bridge deck in this
    // view is near (1280, 265). Altitude lifts the aircraft above the span.
    {duration:23,points:[[1260,580],[1510,580],[1440,315],[1280,265]],speed:[41,14],altitude:[0,64]},
    {duration:72,points:[[1280,265],[1120,215],[410,193],[0,190]],speed:[14,17],altitude:[64,84]},
    {duration:10,points:[[0,190],[0,190],[0,190],[0,190]],speed:[0,0]},
  ];
  const duration = legs.reduce((n,l)=>n+l.duration,0);
  let elapsed=0, previousAngle=180;
  const headings: {time:number; angle:number; height:number}[] = [];
  const move:string[]=[], heading:string[]=[], altitude:string[]=[], wake:string[]=[], shadow:string[]=[];
  for (const leg of legs) {
    const sample=track(leg, projection);
    for(let step=0;step<=leg.duration;step++) {
      if(elapsed>0 && step===0) continue;
      const u=step/leg.duration, time=elapsed+u*leg.duration, state=sample(u);
      let angle=state.angle ?? previousAngle;
      while(angle-previousAngle>180) angle-=360;
      while(angle-previousAngle< -180) angle+=360;
      previousAngle=angle;
      const h=leg.altitude ? lerp(...leg.altitude,smooth(u)) : 0;
      headings.push({time, angle, height:h});
      // Match the painted dock aircraft, then increase size towards the camera.
      // Use the water position (not the lifted sprite position) for depth.
      const scale = Math.max(.14, Math.min(.43, .34 + (state.point[1] - 490) * .00065));
      const visible = Math.min(1, state.point[0] / 40);
      const pct=(100*time/duration).toFixed(4)+'%';
      move.push(`${pct}{transform:translate(${state.point[0].toFixed(2)}px,${state.point[1].toFixed(2)}px) scale(${scale.toFixed(4)});opacity:${visible}}`);
      heading.push(`${pct}{transform:rotate(${angle.toFixed(2)}deg)}`);
      altitude.push(`${pct}{transform:translateY(${(-h/scale).toFixed(2)}px)}`);
      // Spray builds as the floats settle and fades over the first metres of climb.
      const isClimbing = leg.altitude && leg.altitude[1] > leg.altitude[0];
      const isRollout = leg.water && leg.speed[0] > leg.speed[1] && leg.speed[0] > 10;
      const contact = isClimbing ? 1 - smooth(Math.min(1, h / 6))
        : isRollout ? smooth(Math.min(1, u * leg.duration / 2))
        : Number(Boolean(leg.water));
      const wet = contact * Math.min(.45, state.speed / 65);
      wake.push(`${pct}{opacity:${wet.toFixed(3)};transform:scaleX(${Math.max(.12,Math.min(1.2,state.speed/30)).toFixed(3)})}`);
      shadow.push(`${pct}{opacity:${(visible*.16*(1-Math.min(1,h/110))).toFixed(3)}}`);
    }
    elapsed+=leg.duration;
  }
  const name=`harbour-plane-${id}`;
  return {duration,headings,delay:id===0?-7:-96,css:[['move',move],['heading',heading],['altitude',altitude],['wake',wake],['shadow',shadow]].map(([suffix,frames])=>`@keyframes ${name}-${suffix}{${(frames as string[]).join('')}}`).join('\n'),name};
}
