/**
 * Converts an object of CSS properties into an inline style string.
 *
 * Null, undefined, and false values are skipped.
 *
 * @example
 * style({ color: "red", "font-size": 12, disabled: false })
 * // => "color: red; font-size: 12;"
 */
export function style(
  obj: Record<string, string | number | boolean | null | undefined>,
): string {
  let s = "";
  for (const key in obj) {
    const v = obj[key];
    if (v == null || v === false) continue;
    s += `${key}: ${v}; `;
  }
  return s.trim();
}
