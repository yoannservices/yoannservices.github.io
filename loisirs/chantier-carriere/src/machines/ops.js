// Travail des outils sur le terrain : creuser avec un godet, pousser avec la lame, déverser (godet ou benne) dans la trémie,
// une benne ou à terre. Sans Three.js : les positions (tip, pour) viennent des ancres du modèle 3D.
import { PLANT } from '../world/Plant.js';

// Verse vol m³ au point p : trémie du concasseur, benne d'un autre engin, sinon par terre (le tas s'éboule ensuite).
export function pourAt(world, from, p, vol, g, mods) {
  const ter = world.terrain;
  if (vol <= 0) return 0;
  if (world.plant.inHopper(p.x, p.z) && p.y < 7) {
    const ok = world.plant.feed(vol); vol -= ok;
    if (vol > 1e-6) ter.add(PLANT.hopper.x1 + 1.6, (PLANT.hopper.z0 + PLANT.hopper.z1) / 2, 1.6, vol, g);   // trémie pleine : ça déborde dehors
    return ok;
  }
  for (const m of world.machines) {
    if (m === from || !m.s.bed) continue;
    const dx = p.x - m.x, dz = p.z - m.z, c = Math.cos(m.h), s = Math.sin(m.h);
    const lx = dx * c - dz * s, lz = dx * s + dz * c, b = m.s.bed;
    if (Math.abs(lx) < b.x + 0.3 && lz > b.z0 - 0.3 && lz < b.z1 + 0.3 && p.y > m.y + 1.2 && p.y < m.y + 6) {
      const ok = m.load(vol, g, mods); vol -= ok;
      const sg = (lx > 0 ? 1 : -1) * (b.x + 1.3);
      if (vol > 1e-6) ter.add(m.x + c * sg + s * lz, m.z - s * sg + c * lz, 1.4, vol, g);   // débordement : tombe à côté de la benne
      return ok;
    }
  }
  ter.add(p.x, p.z, 1.4, vol, g);
  return vol;
}

// Un pas de travail. tip / pour : { x, y, z } monde. Renvoie { dig, pour, push } (volumes de l'image, pour le son).
export function work(world, m, tip, pour, dt, mods) {
  const ev = { dig: 0, pour: 0, push: 0 }, T = m.tool, ter = world.terrain, cap = m.capacity(mods), id = m.id;
  if (!m.running) { m._tip = { ...tip }; return ev; }
  const surf = ter.height(tip.x, tip.z);
  if (id === 'loader') {
    if (tip.y < surf + 0.04 && T.tilt < 0.85 && m.speed > 0.15 && m.cargo.vol < cap) {
      const r = ter.dig(tip.x, tip.z, 1.45, tip.y, Math.min(cap - m.cargo.vol, m.speed * dt * 3.2), 0);
      if (r.vol > 0) { m.load(r.vol, r.g, mods); ev.dig = r.vol; m.speed *= 1 - Math.min(0.25, r.vol * 0.06); }
    }
    if (T.tilt < 0.42 && m.cargo.vol > 0) { const v = m.unload(cap * 1.1 * (0.5 - T.tilt) * dt * 2); ev.pour = v; pourAt(world, m, pour, v, m.cargo.g, mods); }
  } else if (id === 'excavator') {
    const prev = m._tip ?? tip, sp = Math.hypot(tip.x - prev.x, tip.y - prev.y, tip.z - prev.z) / Math.max(dt, 1e-3);
    if (tip.y < surf + 0.05 && sp > 0.15 && T.bucket > 0.25 && m.cargo.vol < cap) {
      const r = ter.dig(tip.x, tip.z, 1.15, tip.y, Math.min(cap - m.cargo.vol, Math.min(sp, 3) * dt * 1.6), 0.3);
      if (r.vol > 0) { m.load(r.vol, r.g, mods); ev.dig = r.vol; }
    }
    if (T.bucket < 0.4 && m.cargo.vol > 0) { const v = m.unload(cap * (0.55 - T.bucket) * dt * 2.2); ev.pour = v; pourAt(world, m, pour, v, m.cargo.g, mods); }
  } else if (id === 'dozer') {
    if (T.blade < 0.55 && Math.abs(m.speed) > 0.15) {
      const c = Math.cos(m.h), s = Math.sin(m.h), fwd = m.speed > 0 ? 1 : -1;
      let moved = 0;
      for (const off of [-1.4, 0, 1.4]) {
        const bx = tip.x + c * off, bz = tip.z - s * off, r = ter.dig(bx, bz, 1.4, tip.y, 2.2 * dt * (1 + Math.abs(m.speed)), 0);
        if (r.vol > 0) { ter.add(bx + s * 2.0, bz + c * 2.0, 1.5, r.vol, r.g); moved += r.vol; }
      }
      ev.push = moved;
    }
  } else if (m.s.bed && T.bed > 0.3 && m.cargo.vol > 0) {
    const v = m.unload(cap * (T.bed - 0.25) * 0.5 * dt);
    ev.pour = v;
    const rear = m.s.bed.z0 - 0.6, sx = Math.sin(m.h), sz = Math.cos(m.h);
    pourAt(world, m, { x: m.x + sx * rear, y: m.y + 1.5, z: m.z + sz * rear }, v, m.cargo.g, mods);
  }
  m._tip = { ...tip };
  return ev;
}
