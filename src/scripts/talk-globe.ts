import { createGlobeProjection, globeFrame, talkPlaces } from "../lib/talk-globe";

class TalkGlobe extends HTMLElement {
  private cleanup?: () => void;

  connectedCallback() {
    this.cleanup?.();
    const projection = createGlobeProjection();
    const land = this.querySelector<SVGPathElement>("[data-globe-land]");
    const grid = this.querySelector<SVGPathElement>("[data-globe-grid]");
    const button = this.querySelector<HTMLButtonElement>("[data-globe-pause]");
    if (!land || !grid || !button) return;
    const abort = new AbortController();
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let paused = false;
    let visible = false;
    let hovering = false;
    let focused = false;
    let raf = 0;
    let last = 0;
    let target: { from: [number, number, number]; to: [number, number, number]; start: number } | null = null;

    const render = () => {
      const frame = globeFrame(projection);
      land.setAttribute("d", frame.land);
      grid.setAttribute("d", frame.grid);
      for (const marker of frame.markers) {
        const node = this.querySelector<SVGGElement>(`[data-globe-marker="${marker.id}"]`);
        if (!node) continue;
        node.setAttribute("visibility", marker.visible ? "visible" : "hidden");
        node.setAttribute("transform", `translate(${marker.x} ${marker.y})`);
        const label = node.querySelector("text");
        label?.setAttribute("x", marker.x > 235 ? "-13" : "13");
        label?.setAttribute("text-anchor", marker.x > 235 ? "end" : "start");
      }
    };
    const canRun = () => visible && !document.hidden && !reduced.matches && (target !== null || (!paused && !hovering && !focused));
    const tick = (now: number) => {
      raf = 0;
      if (!canRun()) { last = 0; return; }
      if (last && now - last < 32) { raf = requestAnimationFrame(tick); return; }
      if (target) {
        const progress = Math.min(1, (now - target.start) / 750);
        const eased = 1 - Math.pow(1 - progress, 3);
        projection.rotate(target.from.map((value, index) => value + (target!.to[index] - value) * eased) as [number, number, number]);
        if (progress === 1) target = null;
      } else {
        const rotation = projection.rotate();
        rotation[0] += Math.min(last ? now - last : 0, 64) * .004;
        projection.rotate(rotation);
      }
      last = now;
      render();
      if (canRun()) raf = requestAnimationFrame(tick);
    };
    const sync = () => {
      button.hidden = reduced.matches;
      button.textContent = paused ? "Resume rotation" : "Pause rotation";
      if (!canRun()) { cancelAnimationFrame(raf); raf = 0; last = 0; }
      else if (!raf) raf = requestAnimationFrame(tick);
    };
    button.addEventListener("click", () => { paused = !paused; target = null; sync(); }, { signal: abort.signal });
    this.querySelectorAll<HTMLDetailsElement>("[data-globe-place]").forEach((details) => {
      details.addEventListener("toggle", () => {
        if (!details.open) return;
        const place = talkPlaces.find((place) => place.id === details.dataset.globePlace);
        if (!place) return;
        paused = true;
        const from = projection.rotate();
        const longitude = from[0] + ((-place.coordinates[0] - from[0] + 540) % 360) - 180;
        const to: [number, number, number] = [longitude, -place.coordinates[1], 0];
        if (reduced.matches) { target = null; projection.rotate(to); render(); }
        else target = { from, to, start: performance.now() };
        sync();
      }, { signal: abort.signal });
    });
    const sphere = this.querySelector("svg")!;
    sphere.addEventListener("pointerenter", () => { hovering = true; sync(); }, { signal: abort.signal });
    sphere.addEventListener("pointerleave", () => { hovering = false; sync(); }, { signal: abort.signal });
    this.addEventListener("focusin", (event) => { focused = event.target !== button; sync(); }, { signal: abort.signal });
    this.addEventListener("focusout", (event) => { focused = event.relatedTarget !== button && event.relatedTarget instanceof Node && this.contains(event.relatedTarget); sync(); }, { signal: abort.signal });
    document.addEventListener("visibilitychange", sync, { signal: abort.signal });
    reduced.addEventListener("change", () => {
      if (reduced.matches && target) { projection.rotate(target.to); target = null; render(); }
      sync();
    }, { signal: abort.signal });
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(sphere);
    render();
    sync();
    this.cleanup = () => { cancelAnimationFrame(raf); observer.disconnect(); abort.abort(); };
  }

  disconnectedCallback() { this.cleanup?.(); }
}

if (!customElements.get("talk-globe")) customElements.define("talk-globe", TalkGlobe);
