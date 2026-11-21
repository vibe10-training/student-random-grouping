import { findDuplicateNames, MAX_STUDENTS } from "./roster.js";

export const GROUP_MODES = Object.freeze({
  COUNT: "count",
  SIZE: "size",
});

export function parsePositiveInteger(value, label) {
  const text = String(value).trim();

  if (!text) {
    return { error: `${label}을(를) 입력해주세요.` };
  }

  const number = Number(text);

  if (!Number.isInteger(number)) {
    return { error: `${label}은(는) 정수로 입력해주세요.` };
  }

  if (number < 1) {
    return { error: `${label}은(는) 1 이상이어야 합니다.` };
  }

  return { value: number };
}

export function validateGrouping(students, mode, rawNumber) {
  if (students.length === 0) {
    return {
      error: "학생 명단을 입력해주세요.",
    };
  }

  if (students.length > MAX_STUDENTS) {
    return {
      error: `한 번에 배정할 수 있는 학생은 최대 ${MAX_STUDENTS}명입니다.`,
    };
  }

  const duplicates = findDuplicateNames(students);

  if (duplicates.length > 0) {
    const examples = duplicates
      .slice(0, 3)
      .map(({ name, count }) => `${name}(${count}회)`)
      .join(", ");

    return {
      error: `중복된 이름이 있습니다: ${examples}. 동명이인은 번호 등으로 구분해주세요.`,
    };
  }

  if (mode === GROUP_MODES.COUNT) {
    const parsed = parsePositiveInteger(rawNumber, "조 개수");

    if (parsed.error) {
      return parsed;
    }

    if (parsed.value > students.length) {
      return {
        error: `조 개수는 학생 수보다 클 수 없습니다. 현재 학생은 ${students.length}명입니다.`,
      };
    }

    return { groupCount: parsed.value };
  }

  if (mode === GROUP_MODES.SIZE) {
    const parsed = parsePositiveInteger(rawNumber, "한 조당 인원");

    if (parsed.error) {
      return parsed;
    }

    return {
      groupCount: Math.ceil(students.length / parsed.value),
    };
  }

  return {
    error: "지원하지 않는 조 구성 방식입니다.",
  };
}
