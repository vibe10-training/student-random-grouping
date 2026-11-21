import test from "node:test";
import assert from "node:assert/strict";

import { formatGroupsAsText } from "../src/formatter.js";

test("formats every group and student for copying", () => {
  const text = formatGroupsAsText([
    { title: "1조", members: ["김민준", "이서연"] },
    { title: "2조", members: ["박지후"] },
  ]);

  assert.equal(
    text,
    "1조 (2명)\n1. 김민준\n2. 이서연\n\n2조 (1명)\n1. 박지후",
  );
});
