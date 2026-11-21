function secureRandom() {
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    globalThis.crypto.getRandomValues(values);
    return values[0] / 2 ** 32;
  }

  return Math.random();
}

export function shuffle(students, random = secureRandom) {
  const result = [...students];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [result[index], result[randomIndex]] = [
      result[randomIndex],
      result[index],
    ];
  }

  return result;
}

export function distributeEvenly(students, groupCount, random = secureRandom) {
  if (
    !Array.isArray(students) ||
    students.length === 0 ||
    !Number.isInteger(groupCount) ||
    groupCount < 1 ||
    groupCount > students.length
  ) {
    throw new RangeError("유효한 학생 명단과 조 개수가 필요합니다.");
  }

  const shuffled = shuffle(students, random);
  const baseSize = Math.floor(shuffled.length / groupCount);
  const remainder = shuffled.length % groupCount;
  const groups = [];
  let cursor = 0;

  for (let index = 0; index < groupCount; index += 1) {
    const memberCount = baseSize + (index < remainder ? 1 : 0);
    groups.push({
      title: `${index + 1}조`,
      members: shuffled.slice(cursor, cursor + memberCount),
    });
    cursor += memberCount;
  }

  return groups;
}

export function getGroupSignature(groups) {
  return groups
    .map((group) => `${group.title}:${group.members.join("|")}`)
    .join(";");
}

export function createDifferentGroups(
  students,
  groupCount,
  previousGroups,
  random = secureRandom,
  attempts = 6,
) {
  const previousSignature = previousGroups
    ? getGroupSignature(previousGroups)
    : null;
  let groups = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    groups = distributeEvenly(students, groupCount, random);

    if (getGroupSignature(groups) !== previousSignature) {
      return groups;
    }
  }

  return groups;
}
