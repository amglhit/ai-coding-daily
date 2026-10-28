import assert from "node:assert/strict";
import test from "node:test";
import * as gesture from "../src/lib/reader-gesture.mjs";

test("coarse paging is CSS scroll-snap, not a settle spring", () => {
  assert.equal(gesture.FINE_POINTER_QUERY, "(hover: hover) and (pointer: fine)");
  assert.deepEqual(Object.keys(gesture).sort(), ["FINE_POINTER_QUERY"]);
});
