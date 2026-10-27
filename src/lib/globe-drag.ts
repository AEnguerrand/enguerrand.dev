interface DragCallbacks {
  onPointerDown: () => void;
  onStart: () => void;
  onMove: (dx: number, dy: number) => void;
}

// Keep release handling outside the SVG: a pointer can leave before capture starts.
export function bindGlobeDrag(sphere: SVGSVGElement, callbacks: DragCallbacks, signal: AbortSignal) {
  const document = sphere.ownerDocument;
  let drag: { id: number; x: number; y: number; moved: boolean } | null = null;
  const stop = () => {
    const previous = drag;
    drag = null;
    delete sphere.dataset.dragging;
    if (previous && sphere.hasPointerCapture(previous.id)) sphere.releasePointerCapture(previous.id);
  };
  const end = (event: PointerEvent) => {
    if (drag?.id === event.pointerId) stop();
  };
  sphere.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    stop();
    callbacks.onPointerDown();
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
  }, { signal });
  sphere.addEventListener("pointermove", (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    if (!(event.buttons & 1)) { stop(); return; }
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 5) return;
    if (!drag.moved) {
      drag.moved = true;
      sphere.setPointerCapture(event.pointerId);
      sphere.dataset.dragging = "";
      callbacks.onStart();
    }
    callbacks.onMove(dx, dy);
  }, { signal });
  document.addEventListener("pointerup", end, { signal, capture: true });
  document.addEventListener("pointercancel", end, { signal, capture: true });
  sphere.addEventListener("lostpointercapture", end, { signal });
  document.defaultView?.addEventListener("blur", stop, { signal });
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); }, { signal });
  signal.addEventListener("abort", stop, { once: true });
}
