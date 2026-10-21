/// <reference types="bun-types" />
/**
 * PWA cache-hygiene guards — hydration-mismatch prevention.
 *
 * Root cause guarded here: a service worker must never serve JavaScript from
 * an older build against freshly rendered HTML (the client tree then misses
 * elements the server HTML contains, and React reports a hydration
 * mismatch). Two invariants enforce this:
 *
 *  1. The service worker registers in PRODUCTION only — dev-server chunks
 *     are not content-hashed, so caching them serves stale code after edits.
 *     Development must also self-heal: unregister leftovers, purge llc-*
 *     caches.
 *  2. A cache-version bump must be a real cutover: on activation the new
 *     service worker deletes every cache from older versions, so no visitor
 *     keeps assets cached from an earlier deployment.
 *
 * Run with: bun test
 */
import { describe, expect, test } from "bun:test";

const sw = await Bun.file("public/sw.js").text();
const register = await Bun.file(
  "src/components/pwa/service-worker-register.tsx"
).text();
const provider = await Bun.file(
  "src/components/pwa/install-provider.tsx"
).text();

describe("service worker cache hygiene", () => {
  test("sw.js carries the post-Stages-2-5 cache version llc-v2", () => {
    expect(sw.includes('const VERSION = "llc-v2"')).toBe(true);
  });

  test("sw.js activation purges every cache from older versions", () => {
    // The activate handler keeps only caches whose name ends with the
    // current VERSION — this is what heals browsers holding llc-v1 caches.
    expect(sw.includes("!key.endsWith(VERSION)")).toBe(true);
    expect(sw.includes("caches.delete(key)")).toBe(true);
  });

  test("the service worker registers in production only", () => {
    expect(
      register.includes('process.env.NODE_ENV !== "production"')
    ).toBe(true);
    expect(register.includes('navigator.serviceWorker.register("/sw.js")')).toBe(
      true
    );
  });

  test("development self-heals: unregisters leftovers and purges llc-* caches", () => {
    expect(register.includes("getRegistrations()")).toBe(true);
    expect(register.includes(".unregister()")).toBe(true);
    expect(register.includes('const LLC_CACHE_PREFIX = "llc-"')).toBe(true);
    expect(register.includes("key.startsWith(LLC_CACHE_PREFIX)")).toBe(true);
  });
});

describe("hydration safety of the install state", () => {
  test("install provider starts from static state (no lazy client reads)", () => {
    // canInstall and isInstalled must both initialize to false so the first
    // client render is identical to the server render; transitions happen
    // only inside effects (beforeinstallprompt / appinstalled listeners).
    const staticInitializers = provider.match(/useState\(false\)/g) ?? [];
    expect(staticInitializers.length).toBe(2);
    expect(provider.includes("useState(() =>")).toBe(false);
    expect(provider.includes("typeof window")).toBe(false);
  });
});
