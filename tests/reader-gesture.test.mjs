import assert from "node:assert/strict";
import test from "node:test";
import {
  canPageFromScroll,
  createSession,
  displayY,
  pointerDown,
  pointerMove,
  pointerUp,
  rubberband,
  settleImmediately,
  tick,
} from "../src/lib/reader-gesture.mjs";

const shortScroll = { scrollTop: 0, scrollHeight: 120, clientHeight: 120 };

function gesture(session, { from = 400, to = 200, dt = 20, scroll = shortScroll, pointerType = "touch", stageH = 800, buttons = 1 } = {}) {
  let next = pointerDown(session, { pointerType, clientY: from, time: 0, onControl: false });
  next = pointerMove(next, { pointerType, clientY: to, time: dt, buttons, scroll, stageH });
  return pointerUp(next, stageH);
}

function runUntilSettled(session, stageH = 800) {
  let next = session;
  let guard = 0;
  while (next.settling && guard < 500) {
    next = tick(next, stageH);
    guard += 1;
  }
  assert.ok(guard < 500, "settle did not finish");
  return next;
}

test("rubber-band compresses overscroll and stays on the same side", () => {
  const shown = rubberband(100, 800);
  assert.ok(shown > 0 && shown < 100);
  assert.ok(Math.abs(shown - 44000 / 855) < 1e-9);
});

test("long stories page only at the scroll edge", () => {
  const scroll = { scrollTop: 0, scrollHeight: 900, clientHeight: 300 };
  assert.equal(canPageFromScroll(scroll, -40), false);
  assert.equal(canPageFromScroll({ ...scroll, scrollTop: 597 }, -1), false);
  assert.equal(canPageFromScroll({ ...scroll, scrollTop: 598 }, -1), true);
  assert.equal(canPageFromScroll({ ...scroll, scrollTop: 2 }, 30), true);
  assert.equal(canPageFromScroll({ ...scroll, scrollTop: 3 }, 30), false);
  assert.equal(canPageFromScroll(shortScroll, -20), true);
  assert.equal(canPageFromScroll(null, -20), true);
});

test("movement under 10px does not arm a drag", () => {
  let session = pointerDown(createSession(3), { pointerType: "touch", clientY: 300, time: 0, onControl: false });
  session = pointerMove(session, {
    pointerType: "touch",
    clientY: 291,
    time: 16,
    buttons: 1,
    scroll: shortScroll,
    stageH: 800,
  });
  assert.equal(session.armed, false);
  assert.equal(session.pageMode, false);
  assert.equal(session.dragging, false);
});

test("a 10px move arms, and a fast flick pages on release", () => {
  let session = pointerDown(createSession(3), { pointerType: "touch", clientY: 300, time: 0, onControl: false });
  session = pointerMove(session, {
    pointerType: "touch",
    clientY: 290,
    time: 16,
    buttons: 1,
    scroll: shortScroll,
    stageH: 800,
  });
  assert.equal(session.armed, true);
  assert.equal(session.pageMode, true);
  session = pointerUp(session, 800);
  assert.equal(session.settling, "page");
  assert.equal(session.pendingDelta, 1);
  assert.equal(session.index, 0);
});

test("mouse never arms a page drag", () => {
  let session = createSession(3);
  session = pointerDown(session, { pointerType: "mouse", clientY: 300, time: 0, onControl: false });
  assert.equal(session.pressing, false);
  session = pointerMove(session, {
    pointerType: "mouse",
    clientY: 40,
    time: 16,
    buttons: 1,
    scroll: shortScroll,
    stageH: 800,
  });
  session = pointerUp(session, 800);
  assert.equal(session.armed, false);
  assert.equal(session.dragging, false);
  assert.equal(session.settling, null);
  assert.equal(session.index, 0);
});

test("pen can arm a drag, and controls do not", () => {
  const pen = pointerMove(
    pointerDown(createSession(2), { pointerType: "pen", clientY: 200, time: 0, onControl: false }),
    { pointerType: "pen", clientY: 120, time: 20, buttons: 1, scroll: shortScroll, stageH: 800 },
  );
  assert.equal(pen.pageMode, true);
  const blocked = pointerDown(createSession(2), { pointerType: "touch", clientY: 200, time: 0, onControl: true });
  assert.equal(blocked.pressing, false);
});

test("a slow short pull cancels without changing the story", () => {
  const session = gesture(createSession(4), { from: 400, to: 380, dt: 400 });
  assert.equal(session.settling, "cancel");
  assert.equal(session.index, 0);
  const first = tick(session, 800);
  assert.equal(first.settling, "cancel");
  assert.equal(first.index, 0);
  assert.ok(Math.abs(first.dragY - session.dragY * 0.72) < 1e-6);
  const done = runUntilSettled(session);
  assert.equal(done.index, 0);
  assert.equal(done.dragY, 0);
  assert.equal(done.settling, null);
});

test("page settle uses the spring and does not share the cancel decay", () => {
  const session = gesture(createSession(4), { from: 400, to: 200, dt: 30 });
  assert.equal(session.settling, "page");
  assert.equal(session.index, 0);
  const first = tick(session, 800);
  assert.notEqual(first.settling, "cancel");
  assert.ok(Math.abs(first.dragY - session.dragY * 0.72) > 0.5);
  assert.ok(first.dragY < session.dragY);
  const done = runUntilSettled(session);
  assert.equal(done.index, 1);
  assert.equal(done.dragY, 0);
  assert.equal(done.settling, null);
});

test("a long story does not page until the inner scroller is at the edge", () => {
  const middle = { scrollTop: 80, scrollHeight: 900, clientHeight: 300 };
  const held = gesture(createSession(3), { from: 300, to: 180, scroll: middle });
  assert.equal(held.settling, null);
  assert.equal(held.index, 0);

  const bottom = { scrollTop: 600, scrollHeight: 900, clientHeight: 300 };
  const paged = gesture(createSession(3), { from: 300, to: 180, scroll: bottom });
  assert.equal(paged.settling, "page");
  assert.equal(paged.pendingDelta, 1);

  let back = createSession(3);
  back = { ...back, index: 2 };
  back = gesture(back, { from: 200, to: 360, scroll: { scrollTop: 0, scrollHeight: 900, clientHeight: 300 } });
  assert.equal(back.settling, "page");
  assert.equal(back.pendingDelta, -1);
  assert.equal(runUntilSettled(back).index, 1);
});

test("the first and last stories refuse to page past the ends", () => {
  const back = gesture(createSession(3), { from: 200, to: 420 });
  assert.equal(back.settling, "cancel");
  assert.equal(runUntilSettled(back).index, 0);

  let last = createSession(3);
  last = { ...last, index: 2 };
  last = gesture(last, { from: 400, to: 200 });
  assert.equal(last.settling, "cancel");
  assert.equal(runUntilSettled(last).index, 2);
});

test("ends rubber-band while dragging, but a page settle keeps the raw offset", () => {
  const dragging = { ...createSession(3), dragging: true, dragY: 120 };
  const shown = displayY(dragging, 800);
  assert.ok(shown > 0 && shown < 120);
  const paging = { ...dragging, dragging: false, settling: "page", pendingDelta: -1 };
  assert.equal(displayY(paging, 800), 120);
  const atEnd = { ...createSession(3), index: 2, dragging: true, dragY: -90 };
  const compressed = displayY(atEnd, 800);
  assert.ok(compressed < 0 && compressed > -90);
});

test("reduced motion can finish a page or a cancel without mixing them", () => {
  const page = settleImmediately(gesture(createSession(3), { from: 400, to: 200 }));
  assert.equal(page.index, 1);
  assert.equal(page.settling, null);
  const cancel = settleImmediately(gesture(createSession(3), { from: 400, to: 380, dt: 400 }));
  assert.equal(cancel.index, 0);
  assert.equal(cancel.settling, null);
});

test("a new press does not start while a settle is running", () => {
  const settling = gesture(createSession(3), { from: 400, to: 200 });
  const ignored = pointerDown(settling, { pointerType: "touch", clientY: 10, time: 50, onControl: false });
  assert.equal(ignored.pressing, false);
  assert.equal(ignored.settling, "page");
});
