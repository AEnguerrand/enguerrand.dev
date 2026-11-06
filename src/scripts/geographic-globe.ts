import responsiveAssets from '../data/responsive-assets.json';
import type { WebGLRenderer, Scene, OrthographicCamera, Group, Mesh, SphereGeometry, MeshPhongMaterial, ShaderMaterial, Texture } from 'three';

class GeographicGlobe extends HTMLElement {
  private controller?: AbortController;
  private observer?: IntersectionObserver;
  private resizeObserver?: ResizeObserver;
  private renderer?: WebGLRenderer;
  private scene?: Scene;
  private camera?: OrthographicCamera;
  private earth?: Group;
  private mesh?: Mesh<SphereGeometry, MeshPhongMaterial>;
  private texture?: Texture;
  private normal?: Texture;
  private elevation?: Texture;
  private cloudTexture?: Texture;
  private clouds?: Mesh<SphereGeometry, MeshPhongMaterial>;
  private atmosphere?: Mesh<SphereGeometry, ShaderMaterial>;
  private loading=false;
  private contextLost=false;
  private visible=false;

  private reduced?: MediaQueryList;
  private previous=0;
  private elapsed=0;
  connectedCallback() {
    if(this.controller) return;
    this.contextLost=false;
    this.controller=new AbortController();
    const {signal}=this.controller;
    this.addEventListener('globe-orientation',((event:CustomEvent<number[]>)=>this.orient(event.detail)) as EventListener,{signal});
    this.reduced=matchMedia('(prefers-reduced-motion: reduce)');
    this.observer=new IntersectionObserver(entries=>{
      this.visible=entries[0].isIntersecting;
      if(this.visible && (!this.reduced?.matches || this.dataset.mode==='sphere')) void this.initialize(signal);
      this.sync();
    },{threshold:.05});
    this.observer.observe(this);
    this.reduced.addEventListener('change',()=>{
      if(!this.reduced?.matches && this.visible) void this.initialize(signal);
      this.sync();
    },{signal});
    document.addEventListener('visibilitychange',()=>this.sync(),{signal});

  }
  private async initialize(signal: AbortSignal) {
    if(this.renderer || this.loading || signal.aborted) return;
    this.loading=true;
    let renderer: WebGLRenderer | undefined;
    try {
      const T=await import('three');
      if(signal.aborted) return;
      const canvas=this.querySelector('canvas')!;
      renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
      renderer.setPixelRatio(Math.min(devicePixelRatio,2));
      const maps=this.dataset.mode==='sphere' ? (canvas.getBoundingClientRect().width <= 360 ? responsiveAssets.globe.phone : responsiveAssets.globe.desktop) : undefined;
      if(maps) this.dataset.textureProfile=maps===responsiveAssets.globe.phone ? 'phone' : 'desktop';
      const texture=await new T.TextureLoader().loadAsync(maps?.colour.src ?? '/images/earth/vancouver-colour.webp');
      if(signal.aborted){texture.dispose();renderer.dispose();return;}
      texture.colorSpace=T.SRGBColorSpace;
      if(this.dataset.mode!=='sphere'){
        // Regional NASA mosaic: west -130.5, east -114.75, south 45, north 54.
        texture.repeat?.set(360/15.75,180/9);
        texture.offset?.set(-49.5/15.75,-135/9);
      }
      this.texture=texture;
      this.normal=await new T.TextureLoader().loadAsync(maps?.normal.src ?? '/images/earth/earth-normal.webp');
      this.elevation=await new T.TextureLoader().loadAsync(maps?.elevation.src ?? '/images/earth/earth-elevation.webp');
      this.cloudTexture=await new T.TextureLoader().loadAsync(maps?.clouds.src ?? '/images/earth/earth-clouds.webp');
      this.cloudTexture.colorSpace=T.SRGBColorSpace;
      // Preserve texture detail at the shallow viewing angle of the horizon.
      const anisotropy=Math.min(renderer.capabilities?.getMaxAnisotropy() ?? 1,8);
      for(const map of [texture,this.normal,this.elevation,this.cloudTexture])map.anisotropy=anisotropy;
      if(signal.aborted){this.texture.dispose();this.normal.dispose();this.elevation?.dispose();this.cloudTexture.dispose();renderer.dispose();return;}
      this.texture=texture;
      this.renderer=renderer;
      this.scene=new T.Scene();
      this.camera=new T.OrthographicCamera(-.06,.06,.668,.623,.1,10);
      if(this.dataset.mode==='sphere'){
        const extent=180/156;
        this.camera=new T.OrthographicCamera(-extent,extent,extent,-extent,.1,10);
      }
      this.camera.position.z=3;
      this.earth=new T.Group();
      this.earth.rotation.x=10*Math.PI/180;
      this.mesh=new T.Mesh(new T.SphereGeometry(1,this.dataset.mode==='sphere'?128:768,this.dataset.mode==='sphere'?96:512),new T.MeshPhongMaterial({map:texture,normalMap:this.normal,normalScale:new T.Vector2(this.dataset.mode === "sphere" ? .08 : .65,this.dataset.mode === "sphere" ? .08 : .65),displacementMap:this.elevation,displacementScale:this.dataset.mode==='sphere'?.0015:.003,shininess:0,specular:0x47545a}));
      if (this.dataset.mode === "sphere") {
        // Group terrain colours into paint tones while preserving the original texture coordinates.
        this.mesh.material.onBeforeCompile = shader => {
          shader.fragmentShader = shader.fragmentShader.replace("#include <map_fragment>", `
            #include <map_fragment>
            vec3 terrain = diffuseColor.rgb;
            float value = dot(terrain, vec3(0.2126, 0.7152, 0.0722));
            float level = pow(value, 0.65) * 8.0;
            float tone = (floor(level) + smoothstep(0.3, 0.7, fract(level))) / 8.0;
            // Keep land and sea distinct: the earlier single ramp made both grey.
            float water = step(terrain.r * 1.2, terrain.b) * step(terrain.g * 1.08, terrain.b);
            vec3 land = mix(vec3(0.40, 0.51, 0.32), vec3(0.66, 0.73, 0.48), tone);
            float snow = smoothstep(0.48, 0.78, value);
            land = mix(land, vec3(0.83, 0.88, 0.82), snow);
            vec3 sea = mix(vec3(0.30, 0.47, 0.56), vec3(0.40, 0.59, 0.67), tone);
            vec3 pigment = mix(land, sea, water);
            diffuseColor.rgb = mix(terrain, pigment, 0.9);
          `);
        };
        this.mesh.material.customProgramCacheKey = () => "painted-sphere-v4";
      }
      this.mesh.rotation.y=33.12*Math.PI/180;
      this.earth.add(this.mesh);
      this.clouds=new T.Mesh(new T.SphereGeometry(this.dataset.mode==='sphere'?1.006:1.003,128,96),new T.MeshPhongMaterial({map:this.cloudTexture,transparent:true,opacity:this.dataset.mode==='sphere'?.18:.28,depthWrite:false,shininess:0}));
      // Feather the cloud shell at the limb so it merges into the atmosphere instead of forming a ring.
      this.clouds.material.onBeforeCompile=shader=>{
        shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',
          'diffuseColor.a *= smoothstep(0.0, 0.32, dot(normalize(vNormal), vec3(0.0,0.0,1.0)));\n#include <opaque_fragment>');
      };
      this.clouds.material.customProgramCacheKey=()=> 'soft-cloud-limb-v1';
      this.clouds.rotation.y=this.mesh.rotation.y;
      this.earth.add(this.clouds);
      this.atmosphere=new T.Mesh(new T.SphereGeometry(1.008,128,96),new T.ShaderMaterial({
        transparent:true,depthWrite:false,
        vertexShader:`varying vec3 n; varying vec3 eye; void main(){vec4 p=modelViewMatrix*vec4(position,1.); n=normalize(normalMatrix*normal); eye=normalize(-p.xyz); gl_Position=projectionMatrix*p;}`,
        fragmentShader:`varying vec3 n; varying vec3 eye; void main(){float rim=pow(1.-max(dot(normalize(n),normalize(eye)),0.),4.);gl_FragColor=vec4(.82,.89,.94,rim*.35);}`
      }));
      this.scene.add(this.earth,this.atmosphere);
      this.scene.add(new T.AmbientLight(0xfffcf5,1.7));
      const sun=new T.DirectionalLight(0xfff0db,this.dataset.mode === "sphere" ? .35 : 1.65);sun.position.set(3,2,4);this.scene.add(sun);
      const resize=()=>{
        const r=canvas.getBoundingClientRect();
        renderer!.setSize(r.width,r.height,false);
        // Match the geographic fallback projection at every responsive size.
        this.render();
      };
      this.resizeObserver=new ResizeObserver(resize);
      this.resizeObserver.observe(canvas);
      canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.contextLost=true;this.dataset.motion='paused';this.removeAttribute('data-ready');this.renderer?.setAnimationLoop(null);},{signal});
      if(this.dataset.mode==='sphere')this.orient(JSON.parse(this.dataset.orientation||'[-40,-90,0]'));
      resize();
      this.setAttribute('data-ready','');
      this.sync();
    } catch {
      this.normal?.dispose();this.elevation?.dispose();this.cloudTexture?.dispose();this.texture?.dispose();
      renderer?.dispose();
      this.removeAttribute('data-ready');
      // Keep the geographic still image usable if WebGL or the texture fails.
    } finally {this.loading=false;}
  }
  private render() {
    const marker=this.querySelector<HTMLElement>('.vancouver-marker');
    const canvas=this.querySelector('canvas');
    if(marker?.style&&canvas){
      const lat=49.2827*Math.PI/180,tilt=10*Math.PI/180;
      const drift=(this.mesh?.rotation.y??33.12*Math.PI/180)-33.12*Math.PI/180;
      const x=Math.cos(lat)*Math.sin(drift);
      const y=Math.sin(lat)*Math.cos(tilt)-Math.cos(lat)*Math.cos(drift)*Math.sin(tilt);
      marker.style.left=`${canvas.offsetLeft+(x+.06)/.12*canvas.clientWidth}px`;
      marker.style.top=`${(.668-y)/.045*canvas.clientHeight}px`;
    }
    if(!this.contextLost&&this.renderer&&this.scene&&this.camera)this.renderer.render(this.scene,this.camera);}
  private sync() {
    if(!this.renderer)return;
    const motion=this.dataset.mode!=='sphere'&&!this.contextLost&&this.visible&&!document.hidden&&!this.reduced?.matches;
    this.dataset.motion=motion?'running':'paused';
    this.previous=0;
    this.renderer.setAnimationLoop(motion ? (time:number)=>{
      const delta=this.previous?Math.min((time-this.previous)/1000,.05):0;
      this.previous=time;
      this.elapsed+=delta;
      if(this.dataset.mode!=='sphere'){
        // A small drift holds Vancouver (123.12° W) and the Coast Mountains in view.
        if(this.mesh)this.mesh.rotation.y=33.12*Math.PI/180+Math.sin(this.elapsed*.08)*.0015;
        if(this.clouds)this.clouds.rotation.y=33.12*Math.PI/180+Math.sin(this.elapsed*.05)*.002;
      }
      this.render();
    }:null);
    this.render();
  }
  private orient(rotation:number[]) {
    this.dataset.orientation=JSON.stringify(rotation);
    if(!this.earth||!this.mesh)return;
    this.earth.rotation.x=-rotation[1]*Math.PI/180;
    this.mesh.rotation.y=(rotation[0]-90)*Math.PI/180;
    if(this.clouds)this.clouds.rotation.y=this.mesh.rotation.y;
    this.render();
  }
  disconnectedCallback() {
    this.controller?.abort();this.controller=undefined;
    this.observer?.disconnect();this.resizeObserver?.disconnect();
    this.renderer?.setAnimationLoop(null);
    this.clouds?.geometry.dispose();this.clouds?.material.dispose();this.atmosphere?.geometry.dispose();this.atmosphere?.material.dispose();this.normal?.dispose();this.elevation?.dispose();this.cloudTexture?.dispose();
    this.mesh?.geometry.dispose();this.mesh?.material.dispose();this.texture?.dispose();this.renderer?.dispose();
    this.renderer=undefined;this.loading=false;this.removeAttribute('data-ready');
  }
}
if(!customElements.get('geographic-globe'))customElements.define('geographic-globe',GeographicGlobe);
