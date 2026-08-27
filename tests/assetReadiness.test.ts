import assert from "node:assert/strict";
import { test } from "node:test";
import { ASSET_WAIT_LIMIT_MS, waitForAssets } from "../src/assetReadiness.ts";

test("no critical assets means no artificial loading delay", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  await waitForAssets([]);
});

test("cached assets open immediately without advancing the clock", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  await waitForAssets([Promise.resolve(), Promise.resolve()]);
});

test("a failed image does not block the whole page", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  await waitForAssets([Promise.reject(new Error("offline"))]);
});

test("a stalled image releases the page within the wait limit", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let ready = false;
  const loading = waitForAssets([new Promise(() => {})]).then(() => { ready = true; });
  t.mock.timers.tick(ASSET_WAIT_LIMIT_MS - 1);
  await Promise.resolve();
  assert.equal(ready, false);
  t.mock.timers.tick(1);
  await loading;
  assert.equal(ready, true);
});
