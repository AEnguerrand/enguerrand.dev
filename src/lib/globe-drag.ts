interface DragCallbacks {
  onPointerDown: () => void;
  onStart: () => void;
  onMove: (dx: number, dy: number) => void;
}

// Keep release handling outside the SVG: a pointer can leave before capture starts.
export function bindGlobeDrag(sphere: SVGSVGElement, callbacks: DragCallbacks, signal: AbortSignal) {
  const document = sphere.ownerDocument;
  let drag: { id: number; x: number; y: number; moved: boolean; touch: boolean } | null = null;
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
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false, touch: event.pointerType === "touch" };
  }, { signal });
  sphere.addEventListener("pointermove", (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    if (!(event.buttons & 1)) { stop(); return; }
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 5) return;
    if (!drag.moved) {
      // Keep touch scrolling native. Do not rotate while the gesture is vertical
      // or its direction is still unclear; capture only a horizontal drag.
      if (drag.touch && Math.abs(dy) > Math.abs(dx)) { stop(); return; }
      if (drag.touch && Math.abs(dx) < Math.abs(dy) * 1.2) return;
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
