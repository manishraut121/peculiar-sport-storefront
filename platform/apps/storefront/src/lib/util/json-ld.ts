/* Safe serializer for <script type="application/ld+json"> blocks.
 * JSON.stringify does NOT escape "<", so a "</script>" sequence inside any
 * string (e.g. a product title/description an admin typed) would break out of
 * the script tag and allow HTML/JS injection. Escaping "<", ">" and "&" as
 * unicode escapes keeps the JSON valid while making tag-breakout impossible. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
}
