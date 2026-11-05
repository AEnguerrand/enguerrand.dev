import views from './floatplane-views.json';

export type Scene = 'harbour';
export type Heading = { time: number; angle: number; height: number };
export type Pose = { yaw: number; elevation: number };
export const groundProjection = (scene: Scene) => Math.sin(views[scene].elevation * Math.PI / 180);

// Build the same compact pose list for the stylesheet and the image. Only
// views actually reached by this flight occupy texture space in the browser.
export function flightViews(scene: Scene, headings: Heading[], catalogue: Pose[] = []) {
  const view = views[scene];
  const poses = [...catalogue];
  const changes: {time: number; index: number}[] = [];
  const indices = new Map(poses.map((p,i) => [`${p.yaw}/${p.elevation}`,i]));

  function add(time: number, angle: number, height: number) {
    const yaw = (Math.round(angle / view.yawStep)*view.yawStep % 360 + 360) % 360;
    const airborne = Math.min(1, height/view.heightAtEntry);
    const elevation = Math.round(view.elevation+(view.airElevation-view.elevation)*airborne);
    const key = `${yaw}/${elevation}`;
    let index = indices.get(key);
    if (index === undefined) {
      index = poses.length;
      indices.set(key, index);
      poses.push({yaw, elevation});
    }
    if (changes.at(-1)?.index !== index) changes.push({time, index});
  }
  add(headings[0].time, headings[0].angle, headings[0].height);
  for (let i=1; i<headings.length; i++) {
    const a=headings[i-1], b=headings[i];
    const steps=Math.max(1, Math.ceil(Math.abs(b.angle-a.angle)/view.yawStep));
    for (let n=1; n<=steps; n++) {
      const u=n/steps;
      add(a.time+u*(b.time-a.time), a.angle+u*(b.angle-a.angle), a.height+u*(b.height-a.height));
    }
  }
  return {poses, changes};
}

export function facingCss(name: string, scene: Scene, headings: Heading[], duration: number, catalogue: Pose[] = []) {
  const {changes} = flightViews(scene, headings, catalogue);
  const frames = [...changes, {...changes[changes.length-1], time: duration}].map(({time,index})=>{
    const x = -(index % views.columns)*views.width;
    const y = -Math.floor(index/views.columns)*views.height;
    return `${(100*time/duration).toFixed(4)}%{transform:translate(${x}px,${y}px)}`;
  });
  return `@keyframes ${name}-view{${frames.join('')}}`;
}
