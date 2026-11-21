import test from "node:test";
import assert from "node:assert/strict";

import {
  createDifferentGroups,
  distributeEvenly,
  getGroupSignature,
} from "../src/grouping.js";

const students = Array.from({ length: 10 }, (_, index) => `학생${index + 1}`);
const fixedRandom = () => 0.5;

test("distributes students evenly as 4, 3, 3", () => {
  const groups = distributeEvenly(students, 3, fixedRandom);

  assert.deepEqual(
    groups.map((group) => group.members.length),
    [4, 3, 3],
  );
});

test("places every student exactly once without mutating the roster", () => {
  const original = [...students];
  const groups = distributeEvenly(students, 3, fixedRandom);
  const assigned = groups.flatMap((group) => group.members);

  assert.deepEqual(assigned.sort(), [...original].sort());
  assert.equal(new Set(assigned).size, original.length);
  assert.deepEqual(students, original);
});

test("keeps group sizes within one student for repeated runs", () => {
  for (let run = 0; run < 100; run += 1) {
    const groups = distributeEvenly(students, 4);
    const sizes = groups.map((group) => group.members.length);

    assert.ok(Math.max(...sizes) - Math.min(...sizes) <= 1);
  }
});

test("tries again when the previous grouping is repeated", () => {
  const first = distributeEvenly(students, 3, () => 0);
  const randomValues = [0.5, 0.5, 0];
  let cursor = 0;
  const random = () => randomValues[cursor++ % randomValues.length];
  const next = createDifferentGroups(students, 3, first, random);

  assert.notEqual(getGroupSignature(next), getGroupSignature(first));
});

test("rejects group counts outside the valid range", () => {
  assert.throws(() => distributeEvenly(students, 0), RangeError);
  assert.throws(() => distributeEvenly(students, 11), RangeError);
});
