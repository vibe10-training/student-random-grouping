export const MAX_STUDENTS = 500;

export function parseRoster(value) {
  return value
    .split(/[\n\r,]+/)
    .map((name) => name.trim())
    .filter(Boolean);
}

export function findDuplicateNames(students) {
  const counts = new Map();

  for (const student of students) {
    counts.set(student, (counts.get(student) ?? 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([name, count]) => ({ name, count }));
}
