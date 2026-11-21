export function formatGroupsAsText(groups) {
  return groups
    .map(
      (group) =>
        `${group.title} (${group.members.length}명)\n${group.members
          .map((member, index) => `${index + 1}. ${member}`)
          .join("\n")}`,
    )
    .join("\n\n");
}
