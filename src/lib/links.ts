export function linkEntity<T extends { id: string }>(
  link: T | T[] | undefined | null,
): T | undefined {
  if (!link) return undefined;
  return Array.isArray(link) ? link[0] : link;
}

export function linkId(
  link: { id: string } | { id: string }[] | undefined | null,
): string | undefined {
  return linkEntity(link)?.id;
}
