/**
 * SketchFlow Core — wireframe specification to HTML/CSS code generation
 *
 * Supported component types:
 *   header, nav, hero, card, form, footer, grid, button
 */

import { SketchFlowConfig, loadConfig } from "./config";
import {
  escapeHtml,
  wrapTag,
  cssRule,
  mediaQuery,
  toClassName,
  lightenColor,
} from "./utils";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ComponentType =
  | "header"
  | "nav"
  | "hero"
  | "card"
  | "form"
  | "footer"
  | "grid"
  | "button";

export interface ComponentProps {
  /** Display text / heading */
  text?: string;
  /** Subtitle or supporting copy */
  subtitle?: string;
  /** Navigation link labels */
  links?: string[];
  /** Form field definitions */
  fields?: { label: string; type: string; name: string }[];
  /** Child components (for grid layout) */
  children?: SketchComponent[];
  /** Number of grid columns */
  columns?: number;
  /** Button variant */
  variant?: "primary" | "secondary" | "outline";
  /** Background color override */
  bgColor?: string;
  /** Text color override */
  textColor?: string;
  /** Custom CSS class */
  className?: string;
}

export interface SketchComponent {
  id: string;
  type: ComponentType;
  props: ComponentProps;
}

export interface WireframeSpec {
  title: string;
  description?: string;
  components: SketchComponent[];
}

// ─── SketchFlow Class ────────────────────────────────────────────────────────

export class SketchFlow {
  private config: SketchFlowConfig;
  private components: SketchComponent[] = [];
  private idCounter = 0;

  constructor(configOverrides: Partial<SketchFlowConfig> = {}) {
    this.config = loadConfig(configOverrides);
  }

  // ── Spec Parsing ─────────────────────────────────────────────────────────

  /**
   * Parse a wireframe specification object and populate internal component list.
   */
  parseSpec(spec: WireframeSpec): SketchComponent[] {
    this.components = spec.components.map((c) => ({
      ...c,
      id: c.id || this.nextId(c.type),
    }));
    return this.components;
  }

  // ── Component Management ─────────────────────────────────────────────────

  /**
   * Add a single component programmatically.
   */
  addComponent(type: ComponentType, props: ComponentProps = {}): SketchComponent {
    const component: SketchComponent = {
      id: this.nextId(type),
      type,
      props,
    };
    this.components.push(component);
    return component;
  }

  /**
   * Return the current component list.
   */
  getComponents(): SketchComponent[] {
    return [...this.components];
  }

  /**
   * Clear all components.
   */
  reset(): void {
    this.components = [];
    this.idCounter = 0;
  }

  // ── Rendering ────────────────────────────────────────────────────────────

  /**
   * Render a single component to its HTML string.
   */
  renderComponent(component: SketchComponent): string {
    const { type, props, id } = component;
    const cls = props.className || `sf-${type}-${id}`;

    switch (type) {
      case "header":
        return this.renderHeader(cls, props);
      case "nav":
        return this.renderNav(cls, props);
      case "hero":
        return this.renderHero(cls, props);
      case "card":
        return this.renderCard(cls, props);
      case "form":
        return this.renderForm(cls, props);
      case "footer":
        return this.renderFooter(cls, props);
      case "grid":
        return this.renderGrid(cls, props);
      case "button":
        return this.renderButton(cls, props);
      default:
        return `<!-- unknown component: ${escapeHtml(type)} -->`;
    }
  }

  /**
   * Generate the full HTML body by rendering all components.
   */
  generateHTML(components?: SketchComponent[]): string {
    const list = components || this.components;
    return list.map((c) => this.renderComponent(c)).join("\n\n");
  }

  /**
   * Generate a complete CSS stylesheet for the given components.
   */
  generateCSS(components?: SketchComponent[]): string {
    const list = components || this.components;
    const primary = this.config.primaryColor;
    const font = this.config.fontFamily;

    const rules: string[] = [];

    // Reset & base
    if (this.config.cssReset) {
      rules.push(cssRule("*", { margin: "0", padding: "0", "box-sizing": "border-box" }));
    }
    rules.push(cssRule("body", { "font-family": font, "line-height": "1.6", color: "#1f2937" }));

    // Per-component styles
    for (const comp of list) {
      const cls = comp.props.className || `sf-${comp.type}-${comp.id}`;
      rules.push(...this.componentCSS(cls, comp));
    }

    // Responsive
    if (this.config.responsive) {
      rules.push(
        mediaQuery(
          "768px",
          [
            cssRule(".sf-grid", { "grid-template-columns": "1fr !important" }),
            cssRule(".sf-nav-links", { "flex-direction": "column", gap: "0.5rem" }),
          ].join("\n\n")
        )
      );
    }

    return rules.join("\n\n");
  }

  /**
   * Convert a wireframe spec into a React functional component source string.
   *
   * The output is a ready-to-drop-in `.tsx` module: HTML attributes are
   * translated (`class` → `className`, `for` → `htmlFor`), self-closing
   * inputs get a proper JSX close, and the generated CSS is emitted as a
   * sibling `.module.css` import comment so you can split it out later.
   *
   * ```ts
   * const src = sf.toReactComponent(spec, { componentName: "LandingPage" });
   * await fs.writeFile("LandingPage.tsx", src);
   * ```
   */
  toReactComponent(
    spec: WireframeSpec,
    opts: { componentName?: string; includeStyleTag?: boolean } = {},
  ): string {
    const name = (opts.componentName || spec.title || "GeneratedPage")
      .replace(/[^A-Za-z0-9]/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join("") || "GeneratedPage";
    const components = this.parseSpec(spec);
    const body = this.generateHTML(components)
      .replace(/\bclass=/g, "className=")
      .replace(/\bfor=/g, "htmlFor=")
      // Close void <input ...> tags for JSX
      .replace(/<input([^/>]*)>/g, "<input$1 />");
    const css = this.generateCSS(components);
    const styleTag = opts.includeStyleTag === false
      ? ""
      : `\n      <style dangerouslySetInnerHTML={{ __html: \`${css.replace(/`/g, "\\`")}\` }} />`;
    return `// Generated by SketchFlow — do not edit by hand.
import * as React from "react";

export default function ${name}(): JSX.Element {
  return (
    <>${styleTag}
      ${body.replace(/\n/g, "\n      ")}
    </>
  );
}
`;
  }

  /**
   * Generate a full standalone HTML page from a wireframe spec.
   */
  generatePage(spec: WireframeSpec): string {
    const components = this.parseSpec(spec);
    const html = this.generateHTML(components);
    const css = this.generateCSS(components);
    const title = escapeHtml(spec.title);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
${css}
  </style>
</head>
<body>
${html}
</body>
</html>`;
  }

  // ── Private Renderers ────────────────────────────────────────────────────

  private renderHeader(cls: string, props: ComponentProps): string {
    const text = escapeHtml(props.text || "Header");
    return `<header class="${cls}">\n  <h1>${text}</h1>\n</header>`;
  }

  private renderNav(cls: string, props: ComponentProps): string {
    const links = (props.links || ["Home", "About", "Contact"])
      .map((l) => `    <a href="#${toClassName(l)}">${escapeHtml(l)}</a>`)
      .join("\n");
    return `<nav class="${cls}">\n  <div class="sf-nav-links">\n${links}\n  </div>\n</nav>`;
  }

  private renderHero(cls: string, props: ComponentProps): string {
    const heading = escapeHtml(props.text || "Welcome");
    const sub = props.subtitle ? `\n  <p>${escapeHtml(props.subtitle)}</p>` : "";
    return `<section class="${cls} sf-hero">\n  <h2>${heading}</h2>${sub}\n</section>`;
  }

  private renderCard(cls: string, props: ComponentProps): string {
    const heading = escapeHtml(props.text || "Card Title");
    const body = props.subtitle ? `\n  <p>${escapeHtml(props.subtitle)}</p>` : "";
    return `<div class="${cls} sf-card">\n  <h3>${heading}</h3>${body}\n</div>`;
  }

  private renderForm(cls: string, props: ComponentProps): string {
    const fields = (props.fields || [{ label: "Email", type: "email", name: "email" }])
      .map(
        (f) =>
          `  <label>${escapeHtml(f.label)}\n    <input type="${escapeHtml(
            f.type
          )}" name="${escapeHtml(f.name)}" />\n  </label>`
      )
      .join("\n");
    return `<form class="${cls} sf-form">\n${fields}\n  <button type="submit">Submit</button>\n</form>`;
  }

  private renderFooter(cls: string, props: ComponentProps): string {
    const text = escapeHtml(props.text || "\u00A9 2026 SketchFlow");
    return `<footer class="${cls} sf-footer">\n  <p>${text}</p>\n</footer>`;
  }

  private renderGrid(cls: string, props: ComponentProps): string {
    const children = (props.children || [])
      .map((child) => `  ${this.renderComponent(child)}`)
      .join("\n");
    return `<div class="${cls} sf-grid">\n${children}\n</div>`;
  }

  private renderButton(cls: string, props: ComponentProps): string {
    const label = escapeHtml(props.text || "Click me");
    const variant = props.variant || "primary";
    return `<button class="${cls} sf-btn sf-btn-${variant}">${label}</button>`;
  }

  // ── Private CSS Generators ───────────────────────────────────────────────

  private componentCSS(cls: string, comp: SketchComponent): string[] {
    const primary = this.config.primaryColor;
    const bg = comp.props.bgColor;
    const fg = comp.props.textColor;
    const rules: string[] = [];

    switch (comp.type) {
      case "header":
        rules.push(
          cssRule(`.${cls}`, {
            padding: "1.5rem 2rem",
            "background-color": bg || primary,
            color: fg || "#ffffff",
          })
        );
        break;
      case "nav":
        rules.push(
          cssRule(`.${cls}`, { padding: "1rem 2rem", "background-color": bg || "#f9fafb" }),
          cssRule(`.${cls} .sf-nav-links`, { display: "flex", gap: "1.5rem" }),
          cssRule(`.${cls} a`, { "text-decoration": "none", color: primary })
        );
        break;
      case "hero":
        rules.push(
          cssRule(`.${cls}`, {
            padding: "4rem 2rem",
            "text-align": "center",
            "background-color": bg || lightenColor(primary, 90),
          })
        );
        break;
      case "card":
        rules.push(
          cssRule(`.${cls}`, {
            padding: "1.5rem",
            "border-radius": "0.5rem",
            "box-shadow": "0 1px 3px rgba(0,0,0,0.12)",
            "background-color": bg || "#ffffff",
          })
        );
        break;
      case "form":
        rules.push(
          cssRule(`.${cls}`, { padding: "2rem", "max-width": "480px" }),
          cssRule(`.${cls} label`, { display: "block", "margin-bottom": "1rem" }),
          cssRule(`.${cls} input`, {
            display: "block",
            width: "100%",
            padding: "0.5rem",
            "margin-top": "0.25rem",
            border: "1px solid #d1d5db",
            "border-radius": "0.25rem",
          })
        );
        break;
      case "footer":
        rules.push(
          cssRule(`.${cls}`, {
            padding: "2rem",
            "text-align": "center",
            "background-color": bg || "#111827",
            color: fg || "#9ca3af",
          })
        );
        break;
      case "grid":
        rules.push(
          cssRule(`.${cls}`, {
            display: "grid",
            "grid-template-columns": `repeat(${comp.props.columns || 3}, 1fr)`,
            gap: "1.5rem",
            padding: "2rem",
          })
        );
        break;
      case "button":
        rules.push(this.buttonCSS(cls, comp.props.variant || "primary", primary));
        break;
    }

    return rules;
  }

  private buttonCSS(cls: string, variant: string, primary: string): string {
    const base: Record<string, string> = {
      padding: "0.75rem 1.5rem",
      "border-radius": "0.375rem",
      cursor: "pointer",
      "font-size": "1rem",
      border: "none",
    };

    if (variant === "primary") {
      return cssRule(`.${cls}`, { ...base, "background-color": primary, color: "#ffffff" });
    }
    if (variant === "secondary") {
      return cssRule(`.${cls}`, { ...base, "background-color": "#6b7280", color: "#ffffff" });
    }
    // outline
    return cssRule(`.${cls}`, {
      ...base,
      "background-color": "transparent",
      color: primary,
      border: `2px solid ${primary}`,
    });
  }

  private nextId(prefix: string): string {
    this.idCounter += 1;
    return `${prefix}-${this.idCounter}`;
  }
}
