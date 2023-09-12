/** Unindent multi-line string by the level of the first nonblank line. */
export function unindent(str: string): string {
  // Remove first and last blank lines.
  str = str.replace(/^(?:[ \t]*\r?\n)|(?:\r?\n[ \t]*)/, '')
  // Match the first nonblank line and take the length of whitespace (0 is
  // entire match including nonwhitespace).
  const indent = /^([ \t]+)[^ \t]/m.exec(str)?.[1]?.length ?? 0
  // to-do: support tab widths.
  return str.replace(RegExp(`^[ \\t]{0,${indent}}`, 'mg'), '')
}
