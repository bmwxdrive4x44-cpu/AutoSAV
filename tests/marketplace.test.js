import test from "node:test";
import assert from "node:assert/strict";
import { filterParts } from "../lib/marketplace.js";

test("filterParts returns all parts for empty query", () => {
  const results = filterParts("");
  assert.equal(results.length, 3);
});

test("filterParts matches parts by free text query", () => {
  const results = filterParts("alternator");
  assert.equal(results.length, 1);
  assert.equal(results[0].name, "VW Golf 6 Alternator");
});
