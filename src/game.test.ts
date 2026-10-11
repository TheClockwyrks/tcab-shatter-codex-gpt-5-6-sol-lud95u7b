import { describe, expect, it } from "vitest";
import type { InitApi, UpdateApi } from "@clockwyrks/simple-2d";
import { TICK_DT } from "./constants";
import { game, type ShatterDebugApi, type ShatterState } from "./game";

function setup() {
  const init = {
    input: { register: () => {}, layout: () => null },
    audio: { define: () => {}, load: async () => {} },
    assets: {
      loadImage: async () => ({}) as ImageBitmap,
      loadAudio: async () => ({}) as AudioBuffer,
      load: async () => new Blob(),
      resolve: (x: string) => x,
    },
    diagnostics: { register: () => {} },
    events: {} as InitApi<ShatterState>["events"],
    viewport: () => ({}) as ReturnType<InitApi<ShatterState>["viewport"]>,
  } as InitApi<ShatterState>;
  return game.initialize(init) as [ShatterState, ShatterDebugApi];
}
function api(): UpdateApi {
  return {
    input: {
      value: () => 0,
      pressed: () => false,
      pointer: () => ({
        x: 0,
        y: 0,
        down: false,
        device: "mouse",
        buttons: [],
      }),
      pointerPressed: () => false,
      pointerReleased: () => false,
      pointerSamples: () => [],
      pointerContacts: () => [],
      wheel: () => ({ x: 0, y: 0 }),
    },
    audio: {
      play: () => {},
      loop: () => {},
      stop: () => {},
      looping: () => false,
      setMuted: () => {},
      muted: () => false,
    },
    frame: () => ({ count: 0, timeMs: 0, lastDeltaMs: 0 }),
    viewport: () => ({}) as ReturnType<UpdateApi["viewport"]>,
  };
}

describe("Shatter simulation", () => {
  it("initializes the title and debug surface", () => {
    const [s, d] = setup();
    expect(d.version).toBe(1);
    expect(d.snapshot(s)).toMatchObject({
      screen: "title",
      lives: 3,
      wave: 0,
      torpedoReady: true,
      rocks: [],
    });
  });
  it("advances only whole ticks", () => {
    const [s, d] = setup();
    let p = d.setScreen(s, "playing");
    p = game.update(p, api(), TICK_DT / 2);
    expect(p.simTime).toBe(0);
    p = game.update(p, api(), TICK_DT / 2);
    expect(p.simTime).toBeCloseTo(TICK_DT);
  });
  it("pulls bullets but not the ship", () => {
    const [s, d] = setup();
    let p = d.setScreen(s, "playing");
    p = d.setWaveSpawning(p, false);
    p = d.setShipPosition(p, 100, 100);
    p = d.addBullet(p, 100, 100, 0, 0);
    p = game.update(p, api(), TICK_DT);
    const z = d.snapshot(p) as unknown as {
      ship: { vx: number };
      bullets: { vx: number }[];
    };
    expect(z.ship.vx).toBe(0);
    expect(z.bullets[0]!.vx).toBeGreaterThan(0);
  });
  it("keeps debug poses immutable and ids addressable", () => {
    const [s, d] = setup(),
      p = d.addRock(s, "small", 20, 30);
    expect(s.rocks).toHaveLength(0);
    const z = d.snapshot(p) as unknown as {
      rocks: { id: number; radius: number }[];
    };
    expect(z.rocks[0]!.radius).toBe(14);
    expect(d.removeRock(p, z.rocks[0]!.id).rocks).toHaveLength(0);
  });
});
