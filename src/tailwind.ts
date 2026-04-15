/**
 * Tailwind class-list normaliser for generated HTML.
 *
 * When the wireframe-to-code path fuses styles from the component spec,
 * the default theme, and the user's overrides, the resulting `class=`
 * often ends up with duplicates, conflicts ("p-2 p-4"), or dead variants
 * that don't apply at the current breakpoint. This module dedupes the
 * list, resolves conflicts by last-wins-per-property, and sorts classes
 * into a stable order — same order Prettier's tailwind plugin uses —
 * so diffs between generations stay small.
 */

export type DedupeOptions = {
  sort: boolean;
  dropEmpty: boolean;
};

export const DEFAULT_DEDUPE_OPTIONS: DedupeOptions = { sort: true, dropEmpty: true };

/**
 * Property groups Tailwind classes conflict within. Exact same group +
 * same variant prefix (`sm:`, `hover:`, etc.) means later wins.
 */
const PROPERTY_PATTERNS: { name: string; match: RegExp }[] = [
  { name: "display", match: /^(block|inline|inline-block|flex|inline-flex|grid|inline-grid|hidden|contents|flow-root|table|inline-table|table-row|table-cell)$/ },
  { name: "position", match: /^(static|relative|absolute|fixed|sticky)$/ },
  { name: "flex-direction", match: /^flex-(row|col|row-reverse|col-reverse)$/ },
  { name: "justify-content", match: /^justify-(start|end|center|between|around|evenly)$/ },
  { name: "align-items", match: /^items-(start|end|center|baseline|stretch)$/ },
  { name: "gap", match: /^gap-(\d+|px)$/ },
  { name: "gap-x", match: /^gap-x-(\d+|px)$/ },
  { name: "gap-y", match: /^gap-y-(\d+|px)$/ },
  { name: "p", match: /^p-(\d+|px|auto)$/ },
  { name: "px", match: /^px-(\d+|px|auto)$/ },
  { name: "py", match: /^py-(\d+|px|auto)$/ },
  { name: "pt", match: /^pt-(\d+|px|auto)$/ },
  { name: "pr", match: /^pr-(\d+|px|auto)$/ },
  { name: "pb", match: /^pb-(\d+|px|auto)$/ },
  { name: "pl", match: /^pl-(\d+|px|auto)$/ },
  { name: "m", match: /^m-(\d+|px|auto)$/ },
  { name: "mx", match: /^mx-(\d+|px|auto)$/ },
  { name: "my", match: /^my-(\d+|px|auto)$/ },
  { name: "w", match: /^w-(\d+|px|auto|full|screen|min|max|fit)$/ },
  { name: "h", match: /^h-(\d+|px|auto|full|screen|min|max|fit)$/ },
  { name: "text-size", match: /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/ },
  { name: "text-color", match: /^text-(white|black|transparent|current|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+)$/ },
  { name: "bg", match: /^bg-(white|black|transparent|current|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+)$/ },
  { name: "rounded", match: /^rounded(-[a-z]+|-\d+)?$/ },
  { name: "font-weight", match: /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/ },
  { name: "shadow", match: /^shadow(-[a-z0-9]+)?$/ },
  { name: "border-width", match: /^border(-\d+)?$/ },
];

type Parsed = {
  raw: string;
  variant: string;      // e.g. "sm:hover:"
  base: string;
  propertyKey: string | null;
};

function parseClass(raw: string): Parsed {
  const colonIdx = raw.lastIndexOf(":");
  const variant = colonIdx === -1 ? "" : raw.slice(0, colonIdx + 1);
  const base = colonIdx === -1 ? raw : raw.slice(colonIdx + 1);
  const prop = PROPERTY_PATTERNS.find((p) => p.match.test(base));
  return {
    raw,
    variant,
    base,
    propertyKey: prop ? `${variant}${prop.name}` : null,
  };
}

/** Dedupe, resolve conflicts (last-wins within a variant+property), sort. */
export function dedupe(classes: string | string[], opts: DedupeOptions = DEFAULT_DEDUPE_OPTIONS): string {
  const list = Array.isArray(classes) ? classes : classes.split(/\s+/);
  const parsed = list
    .map((s) => s.trim())
    .filter((s) => (opts.dropEmpty ? s.length > 0 : true))
    .map(parseClass);

  // last wins for a property key; everything else kept as-is (with dedupe)
  const seenRaw = new Set<string>();
  const byProp = new Map<string, Parsed>();
  const passthrough: Parsed[] = [];
  for (const p of parsed) {
    if (p.propertyKey) {
      byProp.set(p.propertyKey, p);
    } else {
      if (seenRaw.has(p.raw)) continue;
      seenRaw.add(p.raw);
      passthrough.push(p);
    }
  }
  const kept = [...passthrough, ...byProp.values()];

  if (!opts.sort) return kept.map((p) => p.raw).join(" ");
  kept.sort((a, b) => {
    // variant-free first, then by variant, then by base
    if (a.variant !== b.variant) return a.variant.localeCompare(b.variant);
    return a.raw.localeCompare(b.raw);
  });
  return kept.map((p) => p.raw).join(" ");
}

/** Validate that every class matches a known pattern or is user-escaped. */
export function unknownClasses(classes: string | string[]): string[] {
  const list = Array.isArray(classes) ? classes : classes.split(/\s+/);
  const unknown: string[] = [];
  for (const raw of list) {
    if (!raw.trim()) continue;
    const { base } = parseClass(raw);
    if (base.startsWith("[") && base.endsWith("]")) continue; // arbitrary value
    if (!PROPERTY_PATTERNS.some((p) => p.match.test(base))) unknown.push(raw);
  }
  return unknown;
}
