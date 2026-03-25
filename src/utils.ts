/**
 * SketchFlow utility functions
 * HTML escaping, CSS helpers, and color utilities
 */

// ─── HTML Utilities ──────────────────────────────────────────────────────────

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Escape special HTML characters to prevent XSS / malformed output.
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch] || ch);
}

/**
 * Create an HTML attribute string from a key-value map.
 */
export function buildAttributes(attrs: Record<string, string>): string {
  return Object.entries(attrs)
    .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
    .join(" ");
}

/**
 * Wrap content in an HTML tag with optional attributes.
 */
export function wrapTag(
  tag: string,
  content: string,
  attrs: Record<string, string> = {}
): string {
  const attrStr = buildAttributes(attrs);
  const opening = attrStr ? `<${tag} ${attrStr}>` : `<${tag}>`;
  return `${opening}${content}</${tag}>`;
}

/**
 * Create a self-closing HTML tag.
 */
export function selfClosingTag(
  tag: string,
  attrs: Record<string, string> = {}
): string {
  const attrStr = buildAttributes(attrs);
  return attrStr ? `<${tag} ${attrStr} />` : `<${tag} />`;
}

// ─── CSS Helpers ─────────────────────────────────────────────────────────────

/**
 * Convert a property map into a CSS rule block.
 */
export function cssRule(
  selector: string,
  properties: Record<string, string>
): string {
  const body = Object.entries(properties)
    .map(([prop, val]) => `  ${prop}: ${val};`)
    .join("\n");
  return `${selector} {\n${body}\n}`;
}

/**
 * Generate a CSS media query wrapper.
 */
export function mediaQuery(breakpoint: string, rules: string): string {
  return `@media (max-width: ${breakpoint}) {\n${indent(rules, 2)}\n}`;
}

/**
 * Indent every line of a string by a given number of spaces.
 */
export function indent(text: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => (line.trim() ? `${pad}${line}` : line))
    .join("\n");
}

// ─── Color Utilities ─────────────────────────────────────────────────────────

/**
 * Parse a hex color string into RGB components.
 */
export function hexToRgb(
  hex: string
): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace(/^#/, "");
  if (cleaned.length !== 6 && cleaned.length !== 3) return null;

  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;

  const num = parseInt(full, 16);
  if (isNaN(num)) return null;

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Convert RGB values to a hex color string.
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Lighten a hex color by a percentage (0-100).
 */
export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = percent / 100;
  return rgbToHex(
    rgb.r + (255 - rgb.r) * factor,
    rgb.g + (255 - rgb.g) * factor,
    rgb.b + (255 - rgb.b) * factor
  );
}

/**
 * Darken a hex color by a percentage (0-100).
 */
export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = 1 - percent / 100;
  return rgbToHex(rgb.r * factor, rgb.g * factor, rgb.b * factor);
}

/**
 * Generate a slug-friendly CSS class name from arbitrary text.
 */
export function toClassName(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
