import lzstring from 'lz-string'

/**
 * Pen state for un/packing to/from a shareable URL or LocalStorage. This
 * structure is not intended to be visible to or manually edited by users.
 */
export type PenSave = {
  /** Pen title. Possibly empty. */
  name: string
  /** The program source code. Possibly empty. */
  src: string
  /**
   * Pen version recorded at save time. Used for unpacking old data if
   * structural changes have been made. Independent of package.json version.
   */
  version: 1
}

// A slash is used as a delimiter since it cannot appear in URI encoded query
// parameter.
const fragmentPrefix = '#pen/'
const storageKey = 'pen'

export function PenSave(name: string, src: string): PenSave {
  return {name, src, version: 1}
}

/** Retrieve pen from location or storage. */
export function loadPen(
  medium: Readonly<Location> | Readonly<Storage>
): PenSave | undefined {
  if ('getItem' in medium) return penFromJSON(medium.getItem(storageKey) ?? '')
  return penFromHash(medium.hash)
}

/** Save pen to storage and location. */
export function savePen(
  location: Location | undefined,
  storage: Readonly<Storage> | undefined,
  pen: Readonly<PenSave>
): void {
  storage?.setItem(storageKey, JSON.stringify(pen))
  if (location) location.replace(penToHash(pen))
}

export function penToHash(pen: Readonly<PenSave>): string {
  return `${fragmentPrefix}${lzstring.compressToEncodedURIComponent(
    JSON.stringify(pen)
  )}`
}

/**
 * Load pen from URL fragment.
 *
 * Fragments are used to avoid maximum query length. The approach mimics what's
 * done on [the TypeScript website] since that works well and hasn't required
 * changing in years.
 *
 * [the TypeScript website]: https://github.com/microsoft/TypeScript-Website/blob/944d9aa/packages/sandbox/src/getInitialCode.ts#L6
 */
export function penFromHash(hash: string): PenSave | undefined {
  if (!hash.startsWith(fragmentPrefix)) return
  const lz = hash.slice(fragmentPrefix.length)
  return penFromJSON(lzstring.decompressFromEncodedURIComponent(lz))
}

function penFromJSON(json: string): PenSave | undefined {
  let pen
  try {
    pen = JSON.parse(json)
  } catch {
    return
  }
  return pen?.version === 1 && typeof pen.src === 'string' ? pen : undefined
}
