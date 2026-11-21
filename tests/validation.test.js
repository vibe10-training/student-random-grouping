import test from "node:test";
import assert from "node:assert/strict";

import {
  GROUP_MODES,
  parsePositiveInteger,
  validateGrouping,
} from "../src/validation.js";

test("rejects an empty roster", () => {
  assert.match(validateGrouping([], GROUP_MODES.COUNT, "2").error, /명단/);
});

test("rejects duplicate names", () => {
  assert.match(
    validateGrouping(["김민준", "김민준"], GROUP_MODES.COUNT, "1").error,
    /중복/,
  );
});

test("validates group count against the number of students", () => {
  assert.match(
    validateGrouping(["A", "B", "C"], GROUP_MODES.COUNT, "4").error,
    /학생 수보다/,
  );
});

test("calculates group count from members per group", () => {
  assert.deepEqual(
    validateGrouping(["A", "B", "C", "D", "E"], GROUP_MODES.SIZE, "2"),
    { groupCount: 3 },
  );
});

test("accepts only positive integers", () => {
  assert.match(parsePositiveInteger("1.5", "조 개수").error, /정수/);
  assert.match(parsePositiveInteger("0", "조 개수").error, /1 이상/);
  assert.deepEqual(parsePositiveInteger("3", "조 개수"), { value: 3 });
});
