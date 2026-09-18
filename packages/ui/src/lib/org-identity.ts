const TINT_COUNT = 5

export function organizationInitials(name: string) {
  const ignored = new Set(["de", "da", "do", "das", "dos", "e"])
  const words = name.trim().split(/\s+/).filter((word) => word && !ignored.has(word.toLocaleLowerCase()))
  if (!words.length) return "?"
  if (words.length === 1) return words[0].slice(0, 2).toLocaleUpperCase()
  return `${words[0][0]}${words.at(-1)?.[0] ?? ""}`.toLocaleUpperCase()
}

export function organizationTint(id: string) {
  let hash = 5381
  for (let index = 0; index < id.length; index += 1) hash = ((hash << 5) + hash + id.charCodeAt(index)) | 0
  return (Math.abs(hash) % TINT_COUNT) + 1
}

export function organizationTintStyle(id: string) {
  const tint = organizationTint(id)
  return {
    backgroundColor: `color-mix(in oklch, var(--chart-${tint}) 16%, transparent)`,
    color: `var(--chart-${tint})`,
  }
}
