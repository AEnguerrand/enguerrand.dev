import { createGlobeProjection, globeFrame, talkPlaces } from "../lib/talk-globe";
import { bindGlobeDrag } from "../lib/globe-drag";

class TalkGlobe extends HTMLElement {
  private cleanup?: () => void;

  connectedCallback() {
    this.cleanup?.();
    const projection = createGlobeProjection();
    const land = this.querySelector<SVGPathElement>("[data-globe-land]");
    const grid = this.querySelector<SVGPathElement>("[data-globe-grid]");
    if (!land || !grid) return;
    const abort = new AbortController();
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const journey = this.hasAttribute("data-journey");
    let paused = journey;
    let visible = false;
    let hovering = false;
    let focused = false;
    let raf = 0;
    let last = 0;
    let rotationEndsAt = 0;
    let dragRotation = projection.rotate();
    let suppressClick = false;
    let target: { from: [number, number, number]; to: [number, number, number]; start: number } | null = null;

    const render = () => {
      const frame = globeFrame(projection);
      this.querySelector('geographic-globe')?.dispatchEvent(new CustomEvent('globe-orientation',{detail:projection.rotate()}));
      land.setAttribute("d", frame.land);
      grid.setAttribute("d", frame.grid);
      for (const marker of frame.markers) {
        const node = this.querySelector<SVGElement>(`[data-globe-marker="${marker.id}"]`);
        if (!node) continue;
        node.setAttribute("visibility", marker.visible ? "visible" : "hidden");
        node.setAttribute("tabindex", marker.visible ? "0" : "-1");
        node.setAttribute("aria-hidden", String(!marker.visible));
        node.setAttribute("transform", `translate(${marker.x} ${marker.y})`);
        const label = node.querySelector("text");
        label?.setAttribute("x", marker.x > 235 ? "-13" : "13");
        label?.setAttribute("text-anchor", marker.x > 235 ? "end" : "start");
        const backplate = node.querySelector("rect");
        if (label && backplate) {
          // Measure the rendered font and flag, not the number of letters.
          label.setAttribute("y", "4");
          const bounds = label.getBBox();
          if (bounds.width > 0 && bounds.height > 0) {
            label.setAttribute("y", String(4 - bounds.y - bounds.height / 2));
            backplate.setAttribute("x", String(bounds.x - 5));
            backplate.setAttribute("y", String(-bounds.height / 2 - 3));
            backplate.setAttribute("width", String(bounds.width + 10));
            backplate.setAttribute("height", String(bounds.height + 6));
            node.setAttribute("data-label-ready", "");
          }
        }
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
        // Without a pause control, keep automatic motion to one short introduction.
        if (!rotationEndsAt) rotationEndsAt = now + 4000;
        if (now >= rotationEndsAt) paused = true;
        else {
          const rotation = projection.rotate();
          rotation[0] += Math.min(last ? now - last : 0, 64) * .004;
          projection.rotate(rotation);
        }
      }
      last = now;
      render();
      if (canRun()) raf = requestAnimationFrame(tick);
    };
    const sync = () => {
      if (!canRun()) { cancelAnimationFrame(raf); raf = 0; last = 0; }
      else if (!raf) raf = requestAnimationFrame(tick);
    };
    const turnTo = (id: string | undefined) => {
      const place = talkPlaces.find((place) => place.id === id);
      if (!place) return;
      paused = true;
      const from = projection.rotate();
      const longitude = from[0] + ((-place.coordinates[0] - from[0] + 540) % 360) - 180;
      const to: [number, number, number] = [longitude, -place.coordinates[1], 0];
      if (reduced.matches) { target = null; projection.rotate(to); render(); }
      else target = { from, to, start: performance.now() };
      sync();
    };
    this.querySelectorAll<HTMLDetailsElement>("[data-globe-place]").forEach((details) => {
      const marker = this.querySelector<SVGElement>(`[data-globe-marker="${details.dataset.globePlace}"]`);
      marker?.setAttribute("role", "button");
      marker?.setAttribute("aria-label", `Show talks in ${talkPlaces.find(place => place.id === details.dataset.globePlace)?.label}`);
      marker?.setAttribute("aria-controls", details.id);
      marker?.setAttribute("aria-expanded", String(details.open));
      const select = () => {
        if (details.open) turnTo(details.dataset.globePlace);
        else details.open = true;
        details.querySelector("summary")?.focus({ preventScroll: true });
        details.scrollIntoView({ behavior: "instant", block: "nearest" });
      };
      marker?.addEventListener("click", (event) => {
        event.preventDefault();
        if (!suppressClick) select();
      }, { signal: abort.signal });
      marker?.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        select();
      }, { signal: abort.signal });
      details.addEventListener("toggle", () => {
        marker?.setAttribute("aria-expanded", String(details.open));
        if (details.open) turnTo(details.dataset.globePlace);
      }, { signal: abort.signal });
    });
    if (journey) this.querySelectorAll<SVGAElement>("[data-globe-marker]").forEach(marker => {
      marker.addEventListener("click", event => {
        if (suppressClick && event.detail !== 0) { event.preventDefault(); return; }
        const id = marker.getAttribute("href")?.slice(1);
        if (id) document.getElementById(id)?.focus({ preventScroll: true });
      }, { signal: abort.signal });
    });
    const sphere = this.querySelector("svg")!;
    sphere.dataset.interactive = "";
    bindGlobeDrag(sphere, {
      onPointerDown: () => {
        suppressClick = false;
        dragRotation = projection.rotate();
      },
      onStart: () => {
        suppressClick = true;
        paused = true;
        target = null;
        sync();
      },
      onMove: (dx, dy) => {
        const degrees = 180 / sphere.getBoundingClientRect().width;
        projection.rotate([
          dragRotation[0] + dx * degrees,
          Math.max(-90, Math.min(90, dragRotation[1] - dy * degrees)),
          0,
        ]);
        render();
      },
    }, abort.signal);
    sphere.addEventListener("pointerenter", () => { hovering = true; sync(); }, { signal: abort.signal });
    sphere.addEventListener("pointerleave", () => { hovering = false; sync(); }, { signal: abort.signal });
    this.addEventListener("focusin", () => { focused = true; sync(); }, { signal: abort.signal });
    this.addEventListener("focusout", (event) => { focused = event.relatedTarget instanceof Node && this.contains(event.relatedTarget); sync(); }, { signal: abort.signal });
    document.addEventListener("visibilitychange", sync, { signal: abort.signal });
    reduced.addEventListener("change", () => {
      if (reduced.matches && target) { projection.rotate(target.to); target = null; render(); }
      sync();
    }, { signal: abort.signal });
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(sphere);
    const resizeObserver = new ResizeObserver(render);
    resizeObserver.observe(sphere);
    document.fonts.addEventListener("loadingdone", render, { signal: abort.signal });
    void document.fonts.ready.then(() => { if (!abort.signal.aborted) render(); });
    render();
    sync();
    this.cleanup = () => { cancelAnimationFrame(raf); observer.disconnect(); resizeObserver.disconnect(); abort.abort(); };
  }

  disconnectedCallback() { this.cleanup?.(); }
}

if (!customElements.get("talk-globe")) customElements.define("talk-globe", TalkGlobe);
