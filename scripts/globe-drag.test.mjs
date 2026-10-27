import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/lib/globe-drag.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const exports = {};
new Function("exports", compiled.outputText)(exports);
const { bindGlobeDrag } = exports;

function pointer(target, type, values = {}) {
  target.dispatchEvent(Object.assign(new Event(type), {
    pointerId: 1, isPrimary: true, button: 0, buttons: 1, clientX: 0, clientY: 0,
    ...values,
  }));
}

function setup(t) {
  const document = Object.assign(new EventTarget(), { defaultView: new EventTarget(), hidden: false });
  const captures = new Set();
  const sphere = Object.assign(new EventTarget(), {
    ownerDocument: document, dataset: {},
    hasPointerCapture: id => captures.has(id),
    setPointerCapture: id => captures.add(id),
    releasePointerCapture: id => { captures.delete(id); pointer(sphere, "lostpointercapture", { pointerId: id }); },
  });
  const events = [];
  const controller = new AbortController();
  t.after(() => controller.abort());
  bindGlobeDrag(sphere, {
    onPointerDown: () => events.push("down"),
    onStart: () => events.push("start"),
    onMove: (dx, dy) => events.push([dx, dy]),
  }, controller.signal);
  return { sphere, document, controller, events, captures };
}

test("release outside the globe before the drag threshold clears the pending gesture", t => {
  const { sphere, document, events } = setup(t);
  pointer(sphere, "pointerdown");
  pointer(sphere, "pointermove", { clientX: 3 });
  pointer(document, "pointerup", { clientX: 4, buttons: 0 });
  pointer(sphere, "pointermove", { clientX: 30 });
  assert.deepEqual(events, ["down"]);
});

test("a captured drag ends on an outside release and a new drag still works", t => {
  const { sphere, document, events, captures } = setup(t);
  pointer(sphere, "pointerdown");
  pointer(sphere, "pointermove", { clientX: 30, clientY: 10 });
  assert.equal(captures.has(1), true);
  pointer(document, "pointerup", { buttons: 0 });
  assert.equal(captures.size, 0);
  assert.equal("dragging" in sphere.dataset, false);
  pointer(sphere, "pointermove", { clientX: 50 });
  assert.deepEqual(events, ["down", "start", [30, 10]]);
  pointer(sphere, "pointerdown", { clientX: 5 });
  pointer(sphere, "pointermove", { clientX: 15 });
  assert.deepEqual(events.at(-1), [10, 0]);
});

test("a hover with no primary button stops dragging even if release was missed", t => {
  const { sphere, events, captures } = setup(t);
  pointer(sphere, "pointerdown");
  pointer(sphere, "pointermove", { clientX: 20, buttons: 0 });
  pointer(sphere, "pointermove", { clientX: 30 });
  assert.deepEqual(events, ["down"]);
  assert.equal(captures.size, 0);
});

test("taps do not capture the pointer or start rotation", t => {
  const { sphere, document, events, captures } = setup(t);
  pointer(sphere, "pointerdown");
  pointer(document, "pointerup", { buttons: 0 });
  assert.deepEqual(events, ["down"]);
  assert.equal(captures.size, 0);
});

for (const reason of ["pointercancel", "lostpointercapture", "blur", "hidden", "abort"]) {
  test(`${reason} clears a drag and its visual state`, t => {
    const { sphere, document, controller, events, captures } = setup(t);
    pointer(sphere, "pointerdown");
    pointer(sphere, "pointermove", { clientX: 10 });
    if (reason === "blur") document.defaultView.dispatchEvent(new Event("blur"));
    else if (reason === "hidden") { document.hidden = true; document.dispatchEvent(new Event("visibilitychange")); }
    else if (reason === "abort") controller.abort();
    else pointer(reason === "pointercancel" ? document : sphere, reason);
    pointer(sphere, "pointermove", { clientX: 30 });
    assert.deepEqual(events, ["down", "start", [10, 0]]);
    assert.equal(captures.size, 0);
    assert.equal("dragging" in sphere.dataset, false);
  });
}
