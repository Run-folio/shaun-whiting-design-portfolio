// Geometry for four real cards on a long native scroll surface. Rebase by whole
// cycles before browser scroll-width limits; project identity never changes.
export function projectAtSlot(slot: number, count: number) {
  return ((slot % count) + count) % count;
}

export function loopOrigin(count: number) { return count * 512; }
export function loopSlots(count: number) { return count * 1024; }

export function rebaseLoop(left: number, step: number, count: number) {
  const slot = Math.floor((left + .75) / step);
  const origin = loopOrigin(count);
  if (slot >= count * 256 && slot <= count * 768) return { left, shift: 0 };
  const shift = origin + projectAtSlot(slot, count) - slot;
  return { left: left + shift * step, shift };
}

export function visibleLoop(left: number, viewport: number, step: number, card: number, count: number) {
  const base = Math.floor((left + .75) / step);
  const slots = Array.from({ length: count }, (_, offset) => base + offset);
  const fullyVisible = slots.filter(slot => slot * step >= left - 2 && slot * step + card <= left + viewport + 2);
  const visible = slots.filter(slot => slot * step + card > left + 2 && slot * step < left + viewport - 2);
  return { base, slots, visible, fullyVisible };
}
