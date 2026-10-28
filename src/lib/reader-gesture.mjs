/** Fine pointer + hover: stacked native scroll. Anything else: magazine swipe. */
export const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

const HYSTERESIS_PX = 10;
const PAGE_DISTANCE_PX = 56;
const PAGE_PROJECTED_PX = 72;
const FLING_VELOCITY = 400;

export function rubberband(overshoot, dimension, constant = 0.55) {
  const size = dimension || 1;
  return (overshoot * size * constant) / (size + constant * Math.abs(overshoot));
}

/**
 * Page only when the story cannot scroll further in the drag direction.
 * A short story (no overflow) can page immediately.
 */
export function canPageFromScroll(scroll, rawDy) {
  if (!scroll) return true;
  const max = scroll.scrollHeight - scroll.clientHeight;
  if (max <= 4) return true;
  if (rawDy < 0) return scroll.scrollTop >= max - 2;
  if (rawDy > 0) return scroll.scrollTop <= 2;
  return false;
}

export function createSession(count) {
  return {
    count,
    index: 0,
    dragY: 0,
    dragging: false,
    settling: null,
    startY: 0,
    lastY: 0,
    lastT: 0,
    velocity: 0,
    armed: false,
    pageMode: false,
    pressing: false,
    pendingDelta: 0,
    settleVel: 0,
    pageDistance: 0,
  };
}

export function pointerDown(session, event) {
  if (session.settling) return session;
  if (event.onControl) return session;
  if (event.pointerType === "mouse") return session;
  return {
    ...session,
    pressing: true,
    startY: event.clientY,
    lastY: event.clientY,
    lastT: event.time,
    velocity: 0,
    armed: false,
    pageMode: false,
    dragging: false,
    dragY: 0,
  };
}

export function pointerMove(session, event) {
  if (session.settling || !session.pressing) return session;
  if (event.pointerType === "mouse") return session;
  if (event.buttons === 0) return pointerUp(session, event.stageH || 760);
  const raw = event.clientY - session.startY;
  const next = { ...session };
  if (!next.armed) {
    if (Math.abs(raw) < HYSTERESIS_PX) return next;
    next.armed = true;
    if (!canPageFromScroll(event.scroll, raw)) {
      next.pageMode = false;
      return next;
    }
    next.pageMode = true;
    next.dragging = true;
  }
  if (!next.pageMode) return next;
  const now = event.time;
  const dy = event.clientY - next.lastY;
  const dt = Math.max(now - next.lastT, 1);
  next.velocity = dy / dt;
  next.lastY = event.clientY;
  next.lastT = now;
  next.dragY = raw;
  return next;
}

export function pointerUp(session, stageH = 760) {
  if (session.settling) return session;
  if (!session.pressing) return session;
  if (!session.pageMode) {
    return {
      ...session,
      pressing: false,
      armed: false,
      dragging: false,
      dragY: 0,
    };
  }
  const v = session.velocity * 1000;
  const projected = session.dragY + (v / 1000) * (0.998 / (1 - 0.998));
  let commit = 0;
  if (projected <= -PAGE_PROJECTED_PX || session.dragY <= -PAGE_DISTANCE_PX || v < -FLING_VELOCITY) commit = 1;
  else if (projected >= PAGE_PROJECTED_PX || session.dragY >= PAGE_DISTANCE_PX || v > FLING_VELOCITY) commit = -1;
  if (commit === 1 && session.index < session.count - 1) return beginPage(session, 1, stageH);
  if (commit === -1 && session.index > 0) return beginPage(session, -1, stageH);
  return {
    ...session,
    pressing: false,
    pendingDelta: 0,
    dragging: false,
    settling: "cancel",
  };
}

function beginPage(session, delta, stageH) {
  const distance = stageH || 760;
  const v = session.velocity * 1000;
  const targetY = delta > 0 ? -distance : distance;
  const settleVel = Math.abs(v) > 80 ? v : targetY < 0 ? -900 : 900;
  return {
    ...session,
    pressing: false,
    pendingDelta: delta,
    dragging: false,
    settling: "page",
    settleVel,
    pageDistance: distance,
  };
}

/** Page spring and cancel decay stay on separate paths. */
export function tick(session, stageH = 760) {
  if (session.settling === "page") return tickPage(session, stageH);
  if (session.settling === "cancel") return tickCancel(session);
  return session;
}

function tickPage(session, stageH) {
  // Live clientHeight wins so a resize during the spring retargets ±stageH.
  const distance = stageH || session.pageDistance || 760;
  const target = session.pendingDelta > 0 ? -distance : distance;
  const dist = target - session.dragY;
  let settleVel = session.settleVel + dist * 0.18;
  settleVel *= 0.82;
  const nextY = session.dragY + settleVel * 0.016;
  const passed = session.pendingDelta > 0 ? nextY <= target : nextY >= target;
  if (passed || Math.abs(dist) < 2) return finishGo(session);
  return { ...session, dragY: nextY, settleVel };
}

function tickCancel(session) {
  const nextY = session.dragY * 0.72;
  if (Math.abs(nextY) < 1.5) return finishCancel(session);
  return { ...session, dragY: nextY, settling: "cancel" };
}

function finishGo(session) {
  let index = session.index + session.pendingDelta;
  if (index < 0) index = 0;
  if (index > session.count - 1) index = session.count - 1;
  return {
    ...session,
    index,
    dragY: 0,
    dragging: false,
    settling: null,
    velocity: 0,
    settleVel: 0,
    pendingDelta: 0,
    armed: false,
    pageMode: false,
    pressing: false,
    pageDistance: 0,
  };
}

function finishCancel(session) {
  return {
    ...session,
    dragY: 0,
    dragging: false,
    settling: null,
    velocity: 0,
    settleVel: 0,
    pendingDelta: 0,
    armed: false,
    pageMode: false,
    pressing: false,
    pageDistance: 0,
  };
}

export function settleImmediately(session) {
  if (session.settling === "page") return finishGo(session);
  if (session.settling === "cancel") return finishCancel(session);
  return session;
}

export function displayY(session, stageH = 760) {
  if (!session.dragging && !session.settling && session.dragY === 0) return 0;
  const atStart = session.index === 0 && session.dragY > 0;
  const atEnd = session.index === session.count - 1 && session.dragY < 0;
  if ((atStart || atEnd) && session.settling !== "page") return rubberband(session.dragY, stageH || 760);
  return session.dragY;
}
