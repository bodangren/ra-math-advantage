const CANONICAL_SKILL_PREFIX = "danielson.tlac.skill.";

export function learnSkillSlug(skillId: string) {
  return skillId.startsWith(CANONICAL_SKILL_PREFIX)
    ? skillId.slice(CANONICAL_SKILL_PREFIX.length)
    : skillId;
}

export function learnHref(skillId: string) {
  return `/learn/${encodeURIComponent(learnSkillSlug(skillId))}`;
}
