import type {
  Game,
  InitApi,
  RenderApi,
  UpdateApi,
} from "@clockwyrks/simple-2d";
import type { DeepReadonly } from "ts-essentials";
import * as C from "./constants";
import type { RockSize } from "./constants";

export type Screen = "title" | "howto" | "playing" | "paused" | "gameover";
export type SaucerEdge = "left" | "right";
export type FieldEdge = "top" | "bottom" | "left" | "right";
export interface ShipState {
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly angle: number;
  readonly thrusting: boolean;
  readonly invuln: number;
  readonly collision: boolean;
  readonly fireCooldown: number;
}
export interface BulletState {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly life: number;
}
export interface RockState {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly size: RockSize;
  readonly spin: number;
  readonly health: number;
  readonly flash: number;
}
export interface SaucerState {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly mind: boolean;
  readonly gun: boolean;
  readonly travel: boolean;
  readonly weave: 1 | -1;
  readonly fireClock: number;
  readonly weaveClock: number;
  readonly age: number;
}
export interface TorpedoState {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly heading: number;
  readonly life: number;
  readonly homing: boolean;
}
export interface ShatterState {
  readonly screen: Screen;
  readonly menuIndex: number;
  readonly score: number;
  readonly lives: number;
  readonly wave: number;
  readonly waveBanner: number;
  readonly ship: ShipState;
  readonly bullets: readonly BulletState[];
  readonly rocks: readonly RockState[];
  readonly saucer: SaucerState | null;
  readonly enemyBullets: readonly BulletState[];
  readonly torpedoes: readonly TorpedoState[];
  readonly torpedoCharge: number;
  readonly waveSpawning: boolean;
  readonly saucerSpawning: boolean;
  readonly saucerClock: number;
  readonly saucerDue: number;
  readonly nextSaucerEdge: SaucerEdge | null;
  readonly nextSaucerRow: number | null;
  readonly nextSaucerAim: number | null;
  readonly nextRockSpeed: number | null;
  readonly nextRecycleEdge: FieldEdge | null;
  readonly tickClock: number;
  readonly nextId: number;
  readonly simTime: number;
  readonly muted: boolean;
  readonly pointerArm?: number | null;
  readonly extraLifeFlash?: number;
}
type S = DeepReadonly<ShatterState>;
type Pose = (s: S) => ShatterState;
interface Rect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}
export interface ShatterSnapshot {
  readonly [key: string]: unknown;
}
export interface ShatterDebugApi {
  readonly version: number;
  reset: Pose;
  snapshot(s: S): ShatterSnapshot;
  reconcile: Pose;
  menuItemRect(s: S, i: number): Rect | null;
  setScreen(s: S, v: Screen): ShatterState;
  setMenuIndex(s: S, v: number): ShatterState;
  setScore(s: S, v: number): ShatterState;
  setLives(s: S, v: number): ShatterState;
  setWave(s: S, v: number): ShatterState;
  setWaveBanner(s: S, v: number): ShatterState;
  setWaveSpawning(s: S, v: boolean): ShatterState;
  setSaucerSpawning(s: S, v: boolean): ShatterState;
  setSaucerDue(s: S, v: number): ShatterState;
  setShipPosition(s: S, x: number, y: number): ShatterState;
  setShipVelocity(s: S, x: number, y: number): ShatterState;
  setShipAngle(s: S, v: number): ShatterState;
  setShipInvuln(s: S, v: number): ShatterState;
  setFireCooldown(s: S, v: number): ShatterState;
  setShipCollision(s: S, v: boolean): ShatterState;
  addBullet(s: S, x: number, y: number, vx: number, vy: number): ShatterState;
  removeBullet(s: S, id: number): ShatterState;
  clearBullets: Pose;
  addEnemyBullet(
    s: S,
    x: number,
    y: number,
    vx: number,
    vy: number,
  ): ShatterState;
  removeEnemyBullet(s: S, id: number): ShatterState;
  clearEnemyBullets: Pose;
  addRock(s: S, z: RockSize, x: number, y: number): ShatterState;
  setRockVelocity(s: S, id: number, vx: number, vy: number): ShatterState;
  setRockHealth(s: S, id: number, hp: number): ShatterState;
  removeRock(s: S, id: number): ShatterState;
  clearRocks: Pose;
  addSaucer(s: S, x: number, y: number): ShatterState;
  setSaucerVelocity(s: S, vx: number, vy: number): ShatterState;
  setSaucerWeave(s: S, v: 1 | -1): ShatterState;
  removeSaucer: Pose;
  setSaucerMind(s: S, v: boolean): ShatterState;
  setSaucerGun(s: S, v: boolean): ShatterState;
  setSaucerTravel(s: S, v: boolean): ShatterState;
  setNextSaucerEdge(s: S, v: SaucerEdge): ShatterState;
  setNextSaucerRow(s: S, v: number): ShatterState;
  setNextSaucerAim(s: S, v: number): ShatterState;
  setNextRockSpeed(s: S, v: number): ShatterState;
  setNextRecycleEdge(s: S, v: FieldEdge): ShatterState;
  setTorpedoCharge(s: S, v: number): ShatterState;
  addTorpedo(s: S, x: number, y: number, h: number): ShatterState;
  setTorpedoHeading(s: S, id: number, h: number): ShatterState;
  setTorpedoHoming(s: S, id: number, v: boolean): ShatterState;
  removeTorpedo(s: S, id: number): ShatterState;
  clearTorpedoes: Pose;
}
export const BACKGROUND = "#050714";
const TAU = Math.PI * 2;
const wrap = (v: number, n: number) => ((v % n) + n) % n,
  finite = (v: number) => {
    if (!Number.isFinite(v)) throw Error("value must be finite");
    return v;
  };
const delta = (a: number, b: number, n: number) => {
  const d = b - a;
  return d < -n / 2 ? d + n : d >= n / 2 ? d - n : d;
};
const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(delta(a.x, b.x, C.FIELD_W), delta(a.y, b.y, C.FIELD_H));
const hit = (
  a: { x: number; y: number },
  ar: number,
  b: { x: number; y: number },
  br: number,
) => distance(a, b) <= ar + br;
const ship = (): ShipState => ({
  x: C.SAFE_X,
  y: C.SAFE_Y,
  vx: 0,
  vy: 0,
  angle: C.FACE_UP,
  thrusting: false,
  invuln: 0,
  collision: true,
  fireCooldown: 0,
});
const fresh = (muted = false): ShatterState => ({
  screen: "title",
  menuIndex: 0,
  score: 0,
  lives: C.START_LIVES,
  wave: 0,
  waveBanner: 0,
  ship: ship(),
  bullets: [],
  rocks: [],
  saucer: null,
  enemyBullets: [],
  torpedoes: [],
  torpedoCharge: 1,
  waveSpawning: true,
  saucerSpawning: true,
  saucerClock: 0,
  saucerDue: C.SAUCER_FIRST_DELAY,
  nextSaucerEdge: null,
  nextSaucerRow: null,
  nextSaucerAim: null,
  nextRockSpeed: null,
  nextRecycleEdge: null,
  tickClock: 0,
  nextId: 1,
  simTime: 0,
  muted,
  pointerArm: null,
  extraLifeFlash: 0,
});
const copy = (s: S): ShatterState => ({
  ...s,
  ship: { ...s.ship },
  bullets: s.bullets.map((x) => ({ ...x })),
  rocks: s.rocks.map((x) => ({ ...x })),
  saucer: s.saucer ? { ...s.saucer } : null,
  enemyBullets: s.enemyBullets.map((x) => ({ ...x })),
  torpedoes: s.torpedoes.map((x) => ({ ...x })),
});
const gravity = (x: number, y: number) => {
  const dx = C.STAR_X - x,
    dy = C.STAR_Y - y,
    d = Math.hypot(dx, dy) || 1,
    a = C.MU / Math.max(d, C.SOFTEN) ** 2;
  return [(dx / d) * a, (dy / d) * a] as const;
};
const menus = (screen: Screen) =>
  screen === "title"
    ? C.TITLE_ITEMS
    : screen === "paused"
      ? C.PAUSE_ITEMS
      : screen === "gameover"
        ? C.GAMEOVER_ITEMS
        : [];
const rect = (s: Screen, i: number): Rect | null =>
  i >= 0 && i < menus(s).length
    ? { x: 490, y: (s === "title" ? 430 : 360) + i * 64, w: 300, h: 50 }
    : null;
function score(s: ShatterState, n: number) {
  const a = Math.floor(s.score / C.EXTRA_LIFE_STEP),
    b = Math.floor((s.score + n) / C.EXTRA_LIFE_STEP);
  return {
    ...s,
    score: s.score + n,
    lives: s.lives + b - a,
    extraLifeFlash: b > a ? 0.75 : s.extraLifeFlash,
  };
}
function wave(s: ShatterState) {
  const rocks: RockState[] = [];
  for (let i = 0; i < C.WAVE_BASE_ROCKS + s.wave; i++) {
    let x: number, y: number;
    do {
      x = Math.random() * C.FIELD_W;
      y = Math.random() * C.FIELD_H;
    } while (
      distance({ x, y }, s.ship) < C.WAVE_MIN_SHIP_DIST ||
      distance({ x, y }, { x: C.STAR_X, y: C.STAR_Y }) < C.WAVE_MIN_STAR_DIST
    );
    const a = Math.random() * TAU,
      base =
        s.nextRockSpeed ??
        C.ROCK_SPEED_MIN.large +
          Math.random() * (C.ROCK_SPEED_MAX.large - C.ROCK_SPEED_MIN.large),
      v =
        base *
        (1 + Math.min(C.WAVE_SPEED_CAP, C.WAVE_SPEED_STEP * (s.wave - 1)));
    rocks.push({
      id: s.nextId + i,
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      size: "large",
      spin: a,
      health: C.ROCK_HEALTH.large,
      flash: 0,
    });
  }
  return {
    ...s,
    rocks,
    nextId: s.nextId + rocks.length,
    nextRockSpeed: null,
    waveBanner: 0,
  };
}
const start = (s: S) => wave({ ...fresh(s.muted), screen: "playing", wave: 1 });
function split(
  s: ShatterState,
  i: number,
  vx: number,
  vy: number,
  torpedo = false,
) {
  const r = s.rocks[i]!,
    child = C.ROCK_CHILD[r.size];
  const rocks = s.rocks.filter((_, j) => j !== i);
  let nextId = s.nextId;
  if (child) {
    const m = Math.hypot(vx, vy) || 1,
      dx = vx / m,
      dy = vy / m,
      k = torpedo ? C.TORPEDO_SCATTER : C.SPLIT_KICK,
      kx = torpedo ? dx * k : -dy * k,
      ky = torpedo ? dy * k : dx * k;
    for (const q of [-1, 1])
      rocks.push({
        id: nextId++,
        x: r.x,
        y: r.y,
        vx: r.vx + kx * q,
        vy: r.vy + ky * q,
        size: child,
        spin: r.spin,
        health: C.ROCK_HEALTH[child],
        flash: 0,
      });
  }
  return score(
    { ...s, rocks, nextId },
    r.size === "large"
      ? C.SCORE_LARGE
      : r.size === "medium"
        ? C.SCORE_MEDIUM
        : C.SCORE_SMALL,
  );
}
function step(
  s: ShatterState,
  ctl: {
    left: boolean;
    right: boolean;
    up: boolean;
    fire: boolean;
    torpedo: boolean;
  },
) {
  const previous = s;
  s = {
    ...s,
    simTime: s.simTime + C.TICK_DT,
    extraLifeFlash: Math.max(0, (s.extraLifeFlash ?? 0) - C.TICK_DT),
  };
  if (s.screen !== "playing") return s;
  const a = s.ship.angle + (+ctl.right - +ctl.left) * C.SHIP_TURN * C.TICK_DT;
  let vx = s.ship.vx,
    vy = s.ship.vy;
  if (ctl.up) {
    vx += Math.cos(a) * C.SHIP_THRUST * C.TICK_DT;
    vy += Math.sin(a) * C.SHIP_THRUST * C.TICK_DT;
  }
  const drag = 0.5 ** (C.TICK_DT / C.SHIP_DRAG_HALFLIFE);
  vx *= drag;
  vy *= drag;
  const speed = Math.hypot(vx, vy);
  if (speed > C.SHIP_MAX) {
    vx *= C.SHIP_MAX / speed;
    vy *= C.SHIP_MAX / speed;
  }
  s = {
    ...s,
    ship: {
      ...s.ship,
      angle: a,
      vx,
      vy,
      x: wrap(s.ship.x + vx * C.TICK_DT, C.FIELD_W),
      y: wrap(s.ship.y + vy * C.TICK_DT, C.FIELD_H),
      thrusting: ctl.up,
      invuln: Math.max(0, s.ship.invuln - C.TICK_DT),
      fireCooldown: Math.max(0, s.ship.fireCooldown - 1),
    },
    waveBanner: Math.max(0, s.waveBanner - C.TICK_DT),
    torpedoCharge: Math.min(
      1,
      s.torpedoCharge + C.TICK_DT / C.TORPEDO_RECHARGE,
    ),
  };
  if (ctl.fire && !s.ship.fireCooldown && s.bullets.length < C.MAX_BULLETS) {
    s = {
      ...s,
      nextId: s.nextId + 1,
      ship: { ...s.ship, fireCooldown: C.FIRE_INTERVAL_TICKS },
      bullets: [
        ...s.bullets,
        {
          id: s.nextId,
          x: s.ship.x + Math.cos(a) * C.SHIP_R,
          y: s.ship.y + Math.sin(a) * C.SHIP_R,
          vx: s.ship.vx + Math.cos(a) * C.MUZZLE_SPEED,
          vy: s.ship.vy + Math.sin(a) * C.MUZZLE_SPEED,
          life: C.BULLET_LIFE,
        },
      ],
    };
  }
  if (ctl.torpedo && s.torpedoCharge === 1 && !s.torpedoes.length) {
    s = {
      ...s,
      nextId: s.nextId + 1,
      torpedoCharge: 0,
      torpedoes: [
        {
          id: s.nextId,
          x: s.ship.x + Math.cos(a) * C.SHIP_R,
          y: s.ship.y + Math.sin(a) * C.SHIP_R,
          vx: Math.cos(a) * C.TORPEDO_SPEED,
          vy: Math.sin(a) * C.TORPEDO_SPEED,
          heading: a,
          life: C.TORPEDO_LIFE,
          homing: true,
        },
      ],
    };
  }
  const move = (b: BulletState) => {
    const [gx, gy] = gravity(b.x, b.y),
      bx = b.vx + gx * C.TICK_DT,
      by = b.vy + gy * C.TICK_DT;
    return {
      ...b,
      x: wrap(b.x + bx * C.TICK_DT, C.FIELD_W),
      y: wrap(b.y + by * C.TICK_DT, C.FIELD_H),
      vx: bx,
      vy: by,
      life: b.life - C.TICK_DT,
    };
  };
  s = {
    ...s,
    bullets: s.bullets
      .map(move)
      .filter(
        (b) =>
          b.life > 0 &&
          !hit(b, C.BULLET_R, { x: C.STAR_X, y: C.STAR_Y }, C.CORE_R),
      ),
    enemyBullets: s.enemyBullets
      .map(move)
      .filter(
        (b) =>
          b.life > 0 &&
          !hit(b, C.SAUCER_BULLET_R, { x: C.STAR_X, y: C.STAR_Y }, C.CORE_R),
      ),
    rocks: s.rocks.map((r) => {
      const [gx, gy] = gravity(r.x, r.y),
        rx = r.vx + gx * C.TICK_DT,
        ry = r.vy + gy * C.TICK_DT;
      return {
        ...r,
        x: wrap(r.x + rx * C.TICK_DT, C.FIELD_W),
        y: wrap(r.y + ry * C.TICK_DT, C.FIELD_H),
        vx: rx,
        vy: ry,
        spin: r.spin + 0.2 * C.TICK_DT,
        flash: Math.max(0, r.flash - C.TICK_DT),
      };
    }),
  };
  // Solid core slide.
  const sd = Math.hypot(s.ship.x - C.STAR_X, s.ship.y - C.STAR_Y);
  if (sd < C.CORE_R + C.SHIP_R) {
    const nx = (s.ship.x - C.STAR_X) / (sd || 1),
      ny = (s.ship.y - C.STAR_Y) / (sd || 1),
      dot = s.ship.vx * nx + s.ship.vy * ny;
    s = {
      ...s,
      ship: {
        ...s.ship,
        x: C.STAR_X + nx * (C.CORE_R + C.SHIP_R),
        y: C.STAR_Y + ny * (C.CORE_R + C.SHIP_R),
        vx: s.ship.vx - (dot < 0 ? dot * nx : 0),
        vy: s.ship.vy - (dot < 0 ? dot * ny : 0),
      },
    };
  }
  // Rock recycling.
  for (let i = 0; i < s.rocks.length; i++) {
    const r = s.rocks[i]!;
    if (hit(r, C.ROCK_RADIUS[r.size], { x: C.STAR_X, y: C.STAR_Y }, C.CORE_R)) {
      const edges: FieldEdge[] = ["top", "bottom", "left", "right"],
        edge = s.nextRecycleEdge ?? edges[Math.floor(Math.random() * 4)]!,
        p = Math.random(),
        v = s.nextRockSpeed ?? C.ROCK_SPEED_MIN[r.size];
      let x = 0,
        y = 0,
        ang = 0;
      if (edge === "top") {
        x = p * C.FIELD_W;
        ang = Math.random() * Math.PI;
      } else if (edge === "bottom") {
        x = p * C.FIELD_W;
        y = C.FIELD_H;
        ang = Math.PI + Math.random() * Math.PI;
      } else if (edge === "left") {
        y = p * C.FIELD_H;
        ang = -Math.PI / 2 + Math.random() * Math.PI;
      } else {
        x = C.FIELD_W;
        y = p * C.FIELD_H;
        ang = Math.PI / 2 + Math.random() * Math.PI;
      }
      s = {
        ...s,
        nextRecycleEdge: null,
        nextRockSpeed: null,
        rocks: s.rocks.map((z, j) =>
          j === i
            ? { ...z, x, y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v }
            : z,
        ),
      };
    }
  }
  // Homing and torpedo travel.
  s = {
    ...s,
    torpedoes: s.torpedoes
      .map((t) => {
        let h = t.heading;
        if (t.homing) {
          let best = Infinity,
            target: null | { x: number; y: number } = null;
          for (const q of [...s.rocks, ...(s.saucer ? [s.saucer] : [])]) {
            const dx = delta(t.x, q.x, C.FIELD_W),
              dy = delta(t.y, q.y, C.FIELD_H),
              bearing = Math.atan2(dy, dx),
              ad = wrap(bearing - h + Math.PI, TAU) - Math.PI,
              d = Math.hypot(dx, dy);
            if (Math.abs(ad) <= C.TORPEDO_CONE && d < best) {
              best = d;
              target = q;
            }
          }
          if (target) {
            const desired = Math.atan2(
                delta(t.y, target.y, C.FIELD_H),
                delta(t.x, target.x, C.FIELD_W),
              ),
              ad = wrap(desired - h + Math.PI, TAU) - Math.PI,
              max = C.TORPEDO_TURN * C.TICK_DT;
            h += Math.max(-max, Math.min(max, ad));
          }
        }
        return {
          ...t,
          heading: h,
          vx: Math.cos(h) * C.TORPEDO_SPEED,
          vy: Math.sin(h) * C.TORPEDO_SPEED,
          x: wrap(t.x + Math.cos(h) * C.TORPEDO_SPEED * C.TICK_DT, C.FIELD_W),
          y: wrap(t.y + Math.sin(h) * C.TORPEDO_SPEED * C.TICK_DT, C.FIELD_H),
          life: t.life - C.TICK_DT,
        };
      })
      .filter(
        (t) =>
          t.life > 0 &&
          !hit(t, C.TORPEDO_R, { x: C.STAR_X, y: C.STAR_Y }, C.CORE_R),
      ),
  };
  for (const b of [...s.bullets]) {
    const i = s.rocks.findIndex((r) =>
      hit(b, C.BULLET_R, r, C.ROCK_RADIUS[r.size]),
    );
    if (i >= 0) {
      s = { ...s, bullets: s.bullets.filter((x) => x.id !== b.id) };
      const r = s.rocks[i]!;
      s =
        r.health === 1
          ? split(s, i, b.vx, b.vy)
          : {
              ...s,
              rocks: s.rocks.map((x, j) =>
                j === i
                  ? { ...x, health: x.health - 1, flash: C.HIT_FLASH_TIME }
                  : x,
              ),
            };
    } else if (s.saucer && hit(b, C.BULLET_R, s.saucer, C.SAUCER_R))
      s = score(
        {
          ...s,
          bullets: s.bullets.filter((x) => x.id !== b.id),
          saucer: null,
          saucerClock: 0,
        },
        C.SCORE_SAUCER,
      );
  }
  for (const t of [...s.torpedoes]) {
    const i = s.rocks.findIndex((r) =>
      hit(t, C.TORPEDO_R, r, C.ROCK_RADIUS[r.size]),
    );
    if (i >= 0)
      s = split(
        { ...s, torpedoes: s.torpedoes.filter((x) => x.id !== t.id) },
        i,
        t.vx,
        t.vy,
        true,
      );
    else if (s.saucer && hit(t, C.TORPEDO_R, s.saucer, C.SAUCER_R))
      s = score(
        {
          ...s,
          torpedoes: s.torpedoes.filter((x) => x.id !== t.id),
          saucer: null,
          saucerClock: 0,
        },
        C.SCORE_SAUCER,
      );
  }
  const dead =
    s.ship.collision &&
    s.ship.invuln <= 0 &&
    (s.rocks.some((r) => hit(s.ship, C.SHIP_R, r, C.ROCK_RADIUS[r.size])) ||
      (s.saucer && hit(s.ship, C.SHIP_R, s.saucer, C.SAUCER_R)) ||
      s.enemyBullets.some((b) => hit(s.ship, C.SHIP_R, b, C.SAUCER_BULLET_R)));
  if (dead) {
    const lives = s.lives - 1;
    s = {
      ...s,
      lives,
      screen: lives ? "playing" : "gameover",
      menuIndex: 0,
      ship: { ...ship(), invuln: C.INVULN_TIME },
      torpedoes: [],
      torpedoCharge: 1,
    };
  }
  if (s.saucer) {
    let z = s.saucer,
      fc = z.fireClock - C.TICK_DT,
      wc = z.weaveClock - C.TICK_DT,
      vy2 = z.vy;
    if (z.mind && wc <= 0) {
      vy2 = z.vy === 0 ? z.weave * C.SAUCER_WEAVE_SPEED : -z.vy;
      wc += C.SAUCER_WEAVE_INTERVAL;
    }
    if (z.gun && fc <= 0) {
      const err =
          s.nextSaucerAim ?? (Math.random() * 2 - 1) * C.SAUCER_AIM_ERROR,
        ba =
          Math.atan2(
            delta(z.y, s.ship.y, C.FIELD_H),
            delta(z.x, s.ship.x, C.FIELD_W),
          ) + err;
      s = {
        ...s,
        nextId: s.nextId + 1,
        nextSaucerAim: null,
        enemyBullets: [
          ...s.enemyBullets,
          {
            id: s.nextId,
            x: z.x,
            y: z.y,
            vx: z.vx + Math.cos(ba) * C.SAUCER_BULLET_SPEED,
            vy: vy2 + Math.sin(ba) * C.SAUCER_BULLET_SPEED,
            life: C.SAUCER_BULLET_LIFE,
          },
        ],
      };
      fc += C.SAUCER_FIRE_INTERVAL;
    }
    z = {
      ...z,
      vy: vy2,
      fireClock: fc,
      weaveClock: wc,
      age: z.age + C.TICK_DT,
      x: z.travel ? wrap(z.x + z.vx * C.TICK_DT, C.FIELD_W) : z.x,
      y: z.travel ? wrap(z.y + vy2 * C.TICK_DT, C.FIELD_H) : z.y,
    };
    s =
      z.age >= C.SAUCER_LIFETIME
        ? {
            ...s,
            saucer: null,
            saucerClock: 0,
            saucerDue:
              C.SAUCER_GAP_MIN +
              Math.random() * (C.SAUCER_GAP_MAX - C.SAUCER_GAP_MIN),
          }
        : { ...s, saucer: z };
  } else {
    const clock = s.saucerClock + C.TICK_DT;
    if (s.saucerSpawning && clock >= s.saucerDue) {
      const left =
          (s.nextSaucerEdge ?? (Math.random() < 0.5 ? "left" : "right")) ===
          "left",
        y =
          s.nextSaucerRow ??
          C.SAUCER_R + Math.random() * (C.FIELD_H - 2 * C.SAUCER_R);
      s = {
        ...s,
        nextId: s.nextId + 1,
        nextSaucerEdge: null,
        nextSaucerRow: null,
        saucerClock: 0,
        saucer: {
          id: s.nextId,
          x: left ? 0 : C.FIELD_W,
          y,
          vx: left ? C.SAUCER_SPEED : -C.SAUCER_SPEED,
          vy: 0,
          mind: true,
          gun: true,
          travel: true,
          weave: Math.random() < 0.5 ? 1 : -1,
          fireClock: C.SAUCER_FIRE_INTERVAL,
          weaveClock: C.SAUCER_WEAVE_INTERVAL,
          age: 0,
        },
      };
    } else s = { ...s, saucerClock: clock };
  }
  if (s.rocks.length === 0 && previous.rocks.length > 0 && s.waveSpawning)
    s = { ...s, wave: s.wave + 1, waveBanner: C.WAVE_BANNER_TIME };
  else if (previous.waveBanner > 0 && s.waveBanner <= 0 && s.waveSpawning)
    s = wave(s);
  return s;
}

function snapshot(s: S): ShatterSnapshot {
  return {
    version: C.SHATTER_DEBUG_VERSION,
    screen: s.screen,
    menuIndex: s.menuIndex,
    score: s.score,
    lives: s.lives,
    wave: s.wave,
    waveBanner: s.waveBanner,
    muted: s.muted,
    waveSpawning: s.waveSpawning,
    saucerSpawning: s.saucerSpawning,
    saucerClock: s.saucerClock,
    saucerDue: s.saucerDue,
    nextSaucerEdge: s.nextSaucerEdge,
    nextSaucerRow: s.nextSaucerRow,
    nextSaucerAim: s.nextSaucerAim,
    nextRockSpeed: s.nextRockSpeed,
    nextRecycleEdge: s.nextRecycleEdge,
    ship: { ...s.ship, speed: Math.hypot(s.ship.vx, s.ship.vy) },
    bullets: s.bullets.map((x) => ({ ...x })),
    rocks: s.rocks.map((r) => ({
      id: r.id,
      x: r.x,
      y: r.y,
      vx: r.vx,
      vy: r.vy,
      size: r.size,
      radius: C.ROCK_RADIUS[r.size],
      health: r.health,
    })),
    saucer: s.saucer ? { ...s.saucer } : null,
    enemyBullets: s.enemyBullets.map((x) => ({ ...x })),
    torpedoes: s.torpedoes.map((x) => ({ ...x })),
    torpedoCharge: s.torpedoCharge,
    torpedoReady: s.torpedoCharge === 1,
    simTime: s.simTime,
  };
}
const exists = <T extends { id: number }>(xs: readonly T[], id: number) => {
  finite(id);
  if (!xs.some((x) => x.id === id)) throw Error(`No live entity with id ${id}`);
};
function debug(): ShatterDebugApi {
  const scalar = (k: keyof ShatterState) => (s: S, v: number) =>
      ({ ...copy(s), [k]: finite(v) }) as ShatterState,
    sh = (k: keyof ShipState) => (s: S, v: number | boolean) => ({
      ...copy(s),
      ship: { ...s.ship, [k]: v },
    }),
    sz = (k: keyof SaucerState) => (s: S, v: number | boolean) => {
      if (!s.saucer) throw Error("No live saucer");
      return { ...copy(s), saucer: { ...s.saucer, [k]: v } };
    };
  return {
    version: C.SHATTER_DEBUG_VERSION,
    reset: (s) => fresh(s.muted),
    snapshot,
    reconcile: copy,
    menuItemRect: (s, i) => rect(s.screen, i),
    setScreen: (s, v) => {
      if (!["title", "howto", "playing", "paused", "gameover"].includes(v))
        throw Error("invalid screen");
      return { ...copy(s), screen: v };
    },
    setMenuIndex: scalar("menuIndex"),
    setScore: scalar("score"),
    setLives: scalar("lives"),
    setWave: scalar("wave"),
    setWaveBanner: scalar("waveBanner"),
    setWaveSpawning: (s, v) => ({ ...copy(s), waveSpawning: v }),
    setSaucerSpawning: (s, v) => ({ ...copy(s), saucerSpawning: v }),
    setSaucerDue: scalar("saucerDue"),
    setShipPosition: (s, x, y) => ({
      ...copy(s),
      ship: { ...s.ship, x: finite(x), y: finite(y) },
    }),
    setShipVelocity: (s, vx, vy) => ({
      ...copy(s),
      ship: { ...s.ship, vx: finite(vx), vy: finite(vy) },
    }),
    setShipAngle: sh("angle") as ShatterDebugApi["setShipAngle"],
    setShipInvuln: sh("invuln") as ShatterDebugApi["setShipInvuln"],
    setFireCooldown: sh("fireCooldown") as ShatterDebugApi["setFireCooldown"],
    setShipCollision: sh("collision") as ShatterDebugApi["setShipCollision"],
    addBullet: (s, x, y, vx, vy) => ({
      ...copy(s),
      nextId: s.nextId + 1,
      bullets: [
        ...s.bullets,
        {
          id: s.nextId,
          x: finite(x),
          y: finite(y),
          vx: finite(vx),
          vy: finite(vy),
          life: C.BULLET_LIFE,
        },
      ],
    }),
    removeBullet: (s, id) => {
      exists(s.bullets, id);
      return { ...copy(s), bullets: s.bullets.filter((x) => x.id !== id) };
    },
    clearBullets: (s) => ({ ...copy(s), bullets: [] }),
    addEnemyBullet: (s, x, y, vx, vy) => ({
      ...copy(s),
      nextId: s.nextId + 1,
      enemyBullets: [
        ...s.enemyBullets,
        {
          id: s.nextId,
          x: finite(x),
          y: finite(y),
          vx: finite(vx),
          vy: finite(vy),
          life: C.SAUCER_BULLET_LIFE,
        },
      ],
    }),
    removeEnemyBullet: (s, id) => {
      exists(s.enemyBullets, id);
      return {
        ...copy(s),
        enemyBullets: s.enemyBullets.filter((x) => x.id !== id),
      };
    },
    clearEnemyBullets: (s) => ({ ...copy(s), enemyBullets: [] }),
    addRock: (s, z, x, y) => {
      if (!["large", "medium", "small"].includes(z))
        throw Error("invalid size");
      return {
        ...copy(s),
        nextId: s.nextId + 1,
        rocks: [
          ...s.rocks,
          {
            id: s.nextId,
            x: finite(x),
            y: finite(y),
            vx: 0,
            vy: 0,
            size: z,
            spin: 0,
            health: C.ROCK_HEALTH[z],
            flash: 0,
          },
        ],
      };
    },
    setRockVelocity: (s, id, vx, vy) => {
      exists(s.rocks, id);
      return {
        ...copy(s),
        rocks: s.rocks.map((r) =>
          r.id === id ? { ...r, vx: finite(vx), vy: finite(vy) } : r,
        ),
      };
    },
    setRockHealth: (s, id, hp) => {
      exists(s.rocks, id);
      const r = s.rocks.find((x) => x.id === id)!;
      if (!Number.isInteger(hp) || hp < 1 || hp > C.ROCK_HEALTH[r.size])
        throw Error("invalid health");
      return {
        ...copy(s),
        rocks: s.rocks.map((x) => (x.id === id ? { ...x, health: hp } : x)),
      };
    },
    removeRock: (s, id) => {
      exists(s.rocks, id);
      return { ...copy(s), rocks: s.rocks.filter((x) => x.id !== id) };
    },
    clearRocks: (s) => ({ ...copy(s), rocks: [] }),
    addSaucer: (s, x, y) => ({
      ...copy(s),
      nextId: s.nextId + 1,
      saucer: {
        id: s.nextId,
        x: finite(x),
        y: finite(y),
        vx: C.SAUCER_SPEED,
        vy: 0,
        mind: true,
        gun: true,
        travel: true,
        weave: 1,
        fireClock: C.SAUCER_FIRE_INTERVAL,
        weaveClock: C.SAUCER_WEAVE_INTERVAL,
        age: 0,
      },
    }),
    setSaucerVelocity: (s, vx, vy) => {
      if (!s.saucer) throw Error("No live saucer");
      return {
        ...copy(s),
        saucer: { ...s.saucer, vx: finite(vx), vy: finite(vy) },
      };
    },
    setSaucerWeave: sz("weave") as ShatterDebugApi["setSaucerWeave"],
    removeSaucer: (s) => ({ ...copy(s), saucer: null }),
    setSaucerMind: sz("mind") as ShatterDebugApi["setSaucerMind"],
    setSaucerGun: sz("gun") as ShatterDebugApi["setSaucerGun"],
    setSaucerTravel: sz("travel") as ShatterDebugApi["setSaucerTravel"],
    setNextSaucerEdge: (s, v) => {
      if (v !== "left" && v !== "right") throw Error("invalid edge");
      return { ...copy(s), nextSaucerEdge: v };
    },
    setNextSaucerRow: (s, v) => ({ ...copy(s), nextSaucerRow: finite(v) }),
    setNextSaucerAim: (s, v) => ({ ...copy(s), nextSaucerAim: finite(v) }),
    setNextRockSpeed: (s, v) => ({ ...copy(s), nextRockSpeed: finite(v) }),
    setNextRecycleEdge: (s, v) => {
      if (!["top", "bottom", "left", "right"].includes(v))
        throw Error("invalid edge");
      return { ...copy(s), nextRecycleEdge: v };
    },
    setTorpedoCharge: (s, v) => {
      if (finite(v) < 0 || v > 1) throw Error("invalid charge");
      return { ...copy(s), torpedoCharge: v };
    },
    addTorpedo: (s, x, y, h) => ({
      ...copy(s),
      nextId: s.nextId + 1,
      torpedoes: [
        ...s.torpedoes,
        {
          id: s.nextId,
          x: finite(x),
          y: finite(y),
          vx: Math.cos(finite(h)) * C.TORPEDO_SPEED,
          vy: Math.sin(h) * C.TORPEDO_SPEED,
          heading: h,
          life: C.TORPEDO_LIFE,
          homing: true,
        },
      ],
    }),
    setTorpedoHeading: (s, id, h) => {
      exists(s.torpedoes, id);
      finite(h);
      return {
        ...copy(s),
        torpedoes: s.torpedoes.map((t) =>
          t.id === id
            ? {
                ...t,
                heading: h,
                vx: Math.cos(h) * C.TORPEDO_SPEED,
                vy: Math.sin(h) * C.TORPEDO_SPEED,
              }
            : t,
        ),
      };
    },
    setTorpedoHoming: (s, id, v) => {
      exists(s.torpedoes, id);
      return {
        ...copy(s),
        torpedoes: s.torpedoes.map((t) =>
          t.id === id ? { ...t, homing: v } : t,
        ),
      };
    },
    removeTorpedo: (s, id) => {
      exists(s.torpedoes, id);
      return { ...copy(s), torpedoes: s.torpedoes.filter((x) => x.id !== id) };
    },
    clearTorpedoes: (s) => ({ ...copy(s), torpedoes: [] }),
  };
}
function confirm(s: S) {
  if (s.screen === "title")
    return s.menuIndex === 0
      ? start(s)
      : { ...copy(s), screen: "howto" as const };
  if (s.screen === "paused")
    return s.menuIndex === 0
      ? { ...copy(s), screen: "playing" as const, menuIndex: 0 }
      : s.menuIndex === 1
        ? start(s)
        : fresh(s.muted);
  if (s.screen === "gameover")
    return s.menuIndex === 0 ? start(s) : fresh(s.muted);
  return copy(s);
}

export const game: Game<ShatterState, ShatterDebugApi> = {
  initialize(api: InitApi<ShatterState>) {
    for (const a of C.ACTIONS) api.input.register(a, C.BINDINGS[a]);
    const cues = [
      [C.CUES.fire, 700, 100],
      [C.CUES.shatter, 150, 250],
      [C.CUES.thrust, 65, 100],
      [C.CUES.saucer, 330, 300],
      [C.CUES.death, 90, 600],
      [C.CUES.extraLife, 880, 450],
    ] as const;
    for (const [n, f, d] of cues)
      api.audio.define(n, {
        wave: "sawtooth",
        freq: f,
        gain: 0.1,
        durationMs: d,
      });
    const readings: [string, (s: S) => string | number | boolean][] = [
      ["screen", (s) => s.screen],
      ["score", (s) => s.score],
      ["lives", (s) => s.lives],
      ["wave", (s) => s.wave],
      ["ship pos", (s) => `${s.ship.x.toFixed(1)}, ${s.ship.y.toFixed(1)}`],
      [
        "ship velocity",
        (s) => `${s.ship.vx.toFixed(1)}, ${s.ship.vy.toFixed(1)}`,
      ],
      ["ship speed", (s) => Math.hypot(s.ship.vx, s.ship.vy)],
      ["ship facing", (s) => s.ship.angle],
      ["ship grace", (s) => s.ship.invuln],
      ["bullets", (s) => s.bullets.length],
      ["rocks", (s) => s.rocks.length],
      [
        "saucer",
        (s) =>
          s.saucer
            ? `${s.saucer.x.toFixed(1)}, ${s.saucer.y.toFixed(1)}`
            : "none",
      ],
      ["torpedo charge", (s) => s.torpedoCharge],
      ["torpedoes", (s) => s.torpedoes.length],
      ["sim time", (s) => s.simTime],
    ];
    for (const [n, f] of readings) api.diagnostics.register(n, f);
    return [fresh(), debug()];
  },
  update(state, api: UpdateApi, dt) {
    let s = copy(state);
    if (api.input.pressed("mute")) api.audio.setMuted(!api.audio.muted());
    s = { ...s, muted: api.audio.muted() };
    if (s.screen === "playing" && api.input.pressed("pause")) {
      api.audio.stop(C.CUES.thrust);
      return { ...s, screen: "paused", menuIndex: 0 };
    }
    if (
      s.screen === "paused" &&
      (api.input.pressed("pause") || api.input.pressed("back"))
    )
      return { ...s, screen: "playing", menuIndex: 0 };
    if (
      s.screen === "howto" &&
      (api.input.pressed("confirm") || api.input.pressed("back"))
    )
      return { ...s, screen: "title" };
    if (s.screen === "gameover" && api.input.pressed("back"))
      return fresh(s.muted);
    const n = menus(s.screen).length;
    if (n) {
      if (api.input.pressed("up"))
        s = { ...s, menuIndex: wrap(s.menuIndex - 1, n) };
      if (api.input.pressed("down"))
        s = { ...s, menuIndex: wrap(s.menuIndex + 1, n) };
      if (api.input.pressed("confirm")) s = confirm(s);
      else
        for (const p of api.input.pointerSamples()) {
          const i =
            Array.from({ length: n }, (_, j) => j).find((j) => {
              const r = rect(s.screen, j)!;
              return (
                p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h
              );
            }) ?? -1;
          if (i >= 0) s = { ...s, menuIndex: i };
          if (p.type === "down") s = { ...s, pointerArm: i };
          if (p.type === "up") {
            if (i >= 0 && i === s.pointerArm) s = confirm(s);
            s = { ...s, pointerArm: null };
          }
        }
    }
    const ctl = {
      left: api.input.value("left") > 0,
      right: api.input.value("right") > 0,
      up: api.input.value("up") > 0,
      fire: api.input.value("a") > 0,
      torpedo: api.input.pressed("b"),
    };
    let clock = s.tickClock + Math.max(0, finite(dt));
    const before = {
      bullets: s.bullets.length,
      rocks: s.rocks.length,
      saucer: !!s.saucer,
      lives: s.lives,
      extra: s.lives,
    };
    while (clock + 1e-12 >= C.TICK_DT) {
      s = step(s, ctl);
      clock -= C.TICK_DT;
    }
    s = { ...s, tickClock: clock };
    if (s.bullets.length > before.bullets) api.audio.play(C.CUES.fire);
    if (s.rocks.length !== before.rocks) api.audio.play(C.CUES.shatter);
    if (!before.saucer && s.saucer) api.audio.play(C.CUES.saucer);
    if (s.lives < before.lives) api.audio.play(C.CUES.death);
    if ((s.extraLifeFlash ?? 0) > 0 && s.lives > before.extra)
      api.audio.play(C.CUES.extraLife);
    if (s.screen === "playing" && s.ship.thrusting) {
      if (!api.audio.looping(C.CUES.thrust)) api.audio.loop(C.CUES.thrust);
    } else api.audio.stop(C.CUES.thrust);
    return s;
  },
  render(s, api: RenderApi) {
    draw(s, api.ctx);
  },
};

function label(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  size = 24,
  align: CanvasTextAlign = "center",
) {
  ctx.font = `700 ${size}px ui-monospace, monospace`;
  ctx.textAlign = align;
  ctx.fillStyle = "#e8f8ff";
  ctx.fillText(value, x, y);
}
function drawShip(
  ctx: CanvasRenderingContext2D,
  s: DeepReadonly<ShipState>,
  x = s.x,
  y = s.y,
  scale = 1,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(s.angle);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#15334e";
  ctx.strokeStyle = "#dffaff";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(18, 0);
  ctx.lineTo(-13, 13);
  ctx.lineTo(-7, 0);
  ctx.lineTo(-13, -13);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  if (s.thrusting) {
    ctx.strokeStyle = "#ff994d";
    ctx.beginPath();
    ctx.moveTo(-10, -6);
    ctx.lineTo(-26, 0);
    ctx.lineTo(-10, 6);
    ctx.stroke();
  }
  ctx.restore();
}
function asteroid(ctx: CanvasRenderingContext2D, r: DeepReadonly<RockState>) {
  ctx.save();
  ctx.translate(r.x, r.y);
  ctx.rotate(r.spin);
  const rad = C.ROCK_RADIUS[r.size];
  ctx.fillStyle =
    r.flash > 0
      ? "#fff5cc"
      : r.health < C.ROCK_HEALTH[r.size]
        ? "#875b69"
        : "#52647d";
  ctx.strokeStyle = "#bcd5df";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU,
      rr = rad * (0.84 + 0.12 * Math.sin(r.id + i * 2.2)),
      x = Math.cos(a) * rr,
      y = Math.sin(a) * rr;
    if (i) ctx.lineTo(x, y);
    else ctx.moveTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  if (r.health < C.ROCK_HEALTH[r.size]) {
    ctx.strokeStyle = "#ff735f";
    ctx.beginPath();
    ctx.moveTo(-rad * 0.5, -4);
    ctx.lineTo(0, 5);
    ctx.lineTo(rad * 0.45, -8);
    ctx.stroke();
  }
  ctx.restore();
}
function drawMenu(ctx: CanvasRenderingContext2D, s: S) {
  menus(s.screen).forEach((v, i) => {
    const r = rect(s.screen, i)!;
    ctx.fillStyle =
      i === s.menuIndex ? "rgba(68,224,255,.22)" : "rgba(10,17,38,.8)";
    ctx.strokeStyle = i === s.menuIndex ? "#44e0ff" : "#43536e";
    ctx.lineWidth = 2;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    label(ctx, v, r.x + r.w / 2, r.y + 34, 21);
  });
}
function field(ctx: CanvasRenderingContext2D, s: S) {
  ctx.fillStyle = BACKGROUND;
  ctx.fillRect(0, 0, C.FIELD_W, C.FIELD_H);
  ctx.fillStyle = "rgba(180,210,255,.25)";
  for (let i = 0; i < 90; i++)
    ctx.fillRect(
      (i * 173) % C.FIELD_W,
      (i * i * 47) % C.FIELD_H,
      i % 9 ? 1 : 2,
      i % 9 ? 1 : 2,
    );
  const g = ctx.createRadialGradient(
    C.STAR_X,
    C.STAR_Y,
    5,
    C.STAR_X,
    C.STAR_Y,
    C.HALO_R * 1.5,
  );
  g.addColorStop(0, "#fffbd8");
  g.addColorStop(0.2, "rgba(255,170,55,.8)");
  g.addColorStop(0.58, "rgba(93,65,255,.2)");
  g.addColorStop(1, "rgba(5,7,20,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(C.STAR_X, C.STAR_Y, C.HALO_R * 1.5, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#fffbd6";
  ctx.beginPath();
  ctx.arc(C.STAR_X, C.STAR_Y, C.CORE_R, 0, TAU);
  ctx.fill();
  for (const r of s.rocks) asteroid(ctx, r);
  for (const b of s.bullets) {
    ctx.strokeStyle = "rgba(75,235,255,.55)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(
      b.x - b.vx * C.TICK_DT * C.TRAIL_TICKS,
      b.y - b.vy * C.TICK_DT * C.TRAIL_TICKS,
    );
    ctx.stroke();
    ctx.fillStyle = "#e8ffff";
    ctx.beginPath();
    ctx.arc(b.x, b.y, C.BULLET_R, 0, TAU);
    ctx.fill();
  }
  for (const b of s.enemyBullets) {
    ctx.fillStyle = "#ff4d72";
    ctx.beginPath();
    ctx.arc(b.x, b.y, C.SAUCER_BULLET_R, 0, TAU);
    ctx.fill();
  }
  for (const t of s.torpedoes) {
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate(t.heading);
    ctx.fillStyle = "#ffd34d";
    ctx.beginPath();
    ctx.moveTo(11, 0);
    ctx.lineTo(-7, 6);
    ctx.lineTo(-3, 0);
    ctx.lineTo(-7, -6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  if (s.saucer) {
    ctx.save();
    ctx.translate(s.saucer.x, s.saucer.y);
    ctx.fillStyle = "#321c4a";
    ctx.strokeStyle = "#f36cff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 3, 25, 10, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -2, 10, Math.PI, 0);
    ctx.stroke();
    ctx.restore();
  }
  if (!(s.ship.invuln > 0 && Math.floor(s.ship.invuln * 10) % 2 === 0))
    drawShip(ctx, s.ship);
}
function draw(s: S, ctx: CanvasRenderingContext2D) {
  if (
    s.screen === "playing" ||
    s.screen === "paused" ||
    s.screen === "gameover"
  )
    field(ctx, s);
  else {
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, C.FIELD_W, C.FIELD_H);
    const g = ctx.createRadialGradient(
      C.STAR_X,
      C.STAR_Y,
      0,
      C.STAR_X,
      C.STAR_Y,
      300,
    );
    g.addColorStop(0, "rgba(100,70,255,.35)");
    g.addColorStop(1, "rgba(5,7,20,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, C.FIELD_W, C.FIELD_H);
  }
  if (s.screen === "title") {
    label(ctx, C.TITLE_TEXT, C.FIELD_W / 2, 215, 92);
    label(ctx, C.TAGLINE_TEXT, C.FIELD_W / 2, 270, 23);
    drawMenu(ctx, s);
  } else if (s.screen === "howto") {
    label(ctx, "HOW TO PLAY", C.FIELD_W / 2, 80, 46);
    [
      "SHOOT EVERY ROCK THROUGH ITS FRAGMENTS TO CLEAR EACH WAVE.",
      "THE STAR BENDS BULLETS AND ROCKS — NEVER YOUR SHIP.",
      "SWALLOWED ROCKS RETURN FROM THE EDGE. THE SAUCER HUNTS YOU.",
      "LARGE ROCKS ARE ARMORED; THEIR CRACKS SHOW THE DAMAGE.",
      "F: GUIDED ONE-HIT TORPEDO — TEN SECOND RECHARGE.",
      "ARROWS / WASD  TURN + THRUST     SPACE  FIRE     F  TORPEDO",
      "ENTER  CONFIRM     ESC / P  BACK + PAUSE     M  MUTE",
    ].forEach((v, i) =>
      label(ctx, v, C.FIELD_W / 2, 160 + i * 57, i < 5 ? 19 : 17),
    );
    label(ctx, "PRESS ENTER OR ESC TO RETURN", C.FIELD_W / 2, 650, 18);
  } else if (s.screen === "playing" || s.screen === "paused") {
    label(ctx, String(s.score).padStart(6, "0"), 34, 46, 32, "left");
    for (let i = 0; i < Math.max(0, s.lives - 1); i++)
      drawShip(ctx, s.ship, 48 + i * 30, 80, 0.55);
    label(ctx, "TORPEDO", 34, 122, 14, "left");
    ctx.strokeStyle = "#607c98";
    ctx.strokeRect(34, 132, 150, 10);
    ctx.fillStyle = s.torpedoCharge === 1 ? "#ffd54a" : "#66e1ff";
    ctx.fillRect(36, 134, 146 * s.torpedoCharge, 6);
    if (s.waveBanner > 0) label(ctx, `WAVE ${s.wave}`, C.FIELD_W / 2, 245, 54);
    if ((s.extraLifeFlash ?? 0) > 0)
      label(ctx, "EXTRA SHIP", C.FIELD_W / 2, 100, 27);
    if (s.screen === "paused") {
      ctx.fillStyle = "rgba(3,5,15,.72)";
      ctx.fillRect(0, 0, C.FIELD_W, C.FIELD_H);
      label(ctx, "PAUSED", C.FIELD_W / 2, 260, 58);
      drawMenu(ctx, s);
    }
  } else if (s.screen === "gameover") {
    ctx.fillStyle = "rgba(3,5,15,.76)";
    ctx.fillRect(0, 0, C.FIELD_W, C.FIELD_H);
    label(ctx, "GAME OVER", C.FIELD_W / 2, 190, 62);
    label(ctx, `SCORE ${s.score}   WAVE ${s.wave}`, C.FIELD_W / 2, 265, 24);
    drawMenu(ctx, s);
  }
}
