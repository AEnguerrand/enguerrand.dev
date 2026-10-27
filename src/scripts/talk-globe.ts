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
    let drag: { id: number; x: number; y: number; rotation: [number, number, number]; moved: boolean } | null = null;
    let suppressClick = false;
    let target: { from: [number, number, number]; to: [number, number, number]; start: number } | null = null;

    const render = () => {
      const frame = globeFrame(projection);
      land.setAttribute("d", frame.land);
      grid.setAttribute("d", frame.grid);
      for (const marker of frame.markers) {
        const node = this.querySelector<SVGGElement>(`[data-globe-marker="${marker.id}"]`);
        if (!node) continue;
        node.setAttribute("visibility", marker.visible ? "visible" : "hidden");
        node.setAttribute("tabindex", marker.visible ? "0" : "-1");
        node.setAttribute("aria-hidden", String(!marker.visible));
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
      const marker = this.querySelector<SVGGElement>(`[data-globe-marker="${details.dataset.globePlace}"]`);
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
    const sphere = this.querySelector("svg")!;
    sphere.dataset.interactive = "";
    const help = this.querySelector<HTMLElement>("[data-globe-help]");
    if (help) help.hidden = false;
    sphere.addEventListener("pointerdown", (event) => {
      if (!event.isPrimary || event.button !== 0) return;
      suppressClick = false;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, rotation: projection.rotate(), moved: false };
    }, { signal: abort.signal });
    sphere.addEventListener("pointermove", (event) => {
      if (!drag || drag.id !== event.pointerId) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 5) return;
      if (!drag.moved) {
        drag.moved = true;
        suppressClick = true;
        paused = true;
        target = null;
        sphere.setPointerCapture(event.pointerId);
        sphere.dataset.dragging = "";
        sync();
      }
      const degrees = 180 / sphere.getBoundingClientRect().width;
      projection.rotate([
        drag.rotation[0] + dx * degrees,
        Math.max(-85, Math.min(85, drag.rotation[1] - dy * degrees)),
        0,
      ]);
      render();
    }, { signal: abort.signal });
    const endDrag = (event: PointerEvent) => {
      if (!drag || drag.id !== event.pointerId) return;
      drag = null;
      delete sphere.dataset.dragging;
      if (sphere.hasPointerCapture(event.pointerId)) sphere.releasePointerCapture(event.pointerId);
    };
    sphere.addEventListener("pointerup", endDrag, { signal: abort.signal });
    sphere.addEventListener("pointercancel", endDrag, { signal: abort.signal });
    sphere.addEventListener("lostpointercapture", endDrag, { signal: abort.signal });
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
