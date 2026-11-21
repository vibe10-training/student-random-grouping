import test from "node:test";
import assert from "node:assert/strict";

import { findDuplicateNames, parseRoster } from "../src/roster.js";

test("parses commas and line breaks while removing empty values", () => {
  assert.deepEqual(
    parseRoster(" 김민준,\r\n이서연\n\n 박지후 ,"),
    ["김민준", "이서연", "박지후"],
  );
});

test("returns duplicate names with their counts", () => {
  assert.deepEqual(
    findDuplicateNames(["김민준", "이서연", "김민준", "김민준"]),
    [{ name: "김민준", count: 3 }],
  );
});
