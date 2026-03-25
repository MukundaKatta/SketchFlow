import { SketchFlow, WireframeSpec, SketchComponent } from "../src/core";
import { escapeHtml, hexToRgb, lightenColor } from "../src/utils";

describe("SketchFlow", () => {
  let sf: SketchFlow;

  beforeEach(() => {
    sf = new SketchFlow({ primaryColor: "#3b82f6" });
  });

  // ── Component Rendering ────────────────────────────────────────────────

  describe("renderComponent", () => {
    it("should render a header component with escaped text", () => {
      const comp: SketchComponent = {
        id: "h1",
        type: "header",
        props: { text: "Hello <World>" },
      };
      const html = sf.renderComponent(comp);
      expect(html).toContain("<header");
      expect(html).toContain("Hello &lt;World&gt;");
      expect(html).toContain("<h1>");
    });

    it("should render a nav component with links", () => {
      const comp: SketchComponent = {
        id: "n1",
        type: "nav",
        props: { links: ["Home", "About"] },
      };
      const html = sf.renderComponent(comp);
      expect(html).toContain('<a href="#home">Home</a>');
      expect(html).toContain('<a href="#about">About</a>');
    });

    it("should render a button with the correct variant class", () => {
      const comp: SketchComponent = {
        id: "b1",
        type: "button",
        props: { text: "Sign Up", variant: "outline" },
      };
      const html = sf.renderComponent(comp);
      expect(html).toContain("sf-btn-outline");
      expect(html).toContain("Sign Up");
    });

    it("should render a card with title and subtitle", () => {
      const comp: SketchComponent = {
        id: "c1",
        type: "card",
        props: { text: "Feature", subtitle: "Description here" },
      };
      const html = sf.renderComponent(comp);
      expect(html).toContain("<h3>Feature</h3>");
      expect(html).toContain("<p>Description here</p>");
    });
  });

  // ── Full Page Generation ───────────────────────────────────────────────

  describe("generatePage", () => {
    it("should produce a complete HTML document", () => {
      const spec: WireframeSpec = {
        title: "Test Page",
        components: [
          { id: "h", type: "header", props: { text: "My Site" } },
          { id: "f", type: "footer", props: { text: "Footer text" } },
        ],
      };
      const page = sf.generatePage(spec);

      expect(page).toContain("<!DOCTYPE html>");
      expect(page).toContain("<title>Test Page</title>");
      expect(page).toContain("My Site");
      expect(page).toContain("Footer text");
      expect(page).toContain("<style>");
    });

    it("should include responsive media queries when enabled", () => {
      const spec: WireframeSpec = {
        title: "Responsive",
        components: [
          { id: "g", type: "grid", props: { columns: 2, children: [] } },
        ],
      };
      const page = sf.generatePage(spec);
      expect(page).toContain("@media");
      expect(page).toContain("768px");
    });
  });

  // ── CSS Generation ─────────────────────────────────────────────────────

  describe("generateCSS", () => {
    it("should generate reset styles and component-specific rules", () => {
      sf.addComponent("header", { text: "Title" });
      sf.addComponent("card", { text: "Card" });
      const css = sf.generateCSS();

      expect(css).toContain("box-sizing: border-box");
      expect(css).toContain("padding:");
      expect(css).toContain("border-radius:");
    });

    it("should respect custom primary color", () => {
      const custom = new SketchFlow({ primaryColor: "#ef4444" });
      custom.addComponent("header", { text: "Red" });
      const css = custom.generateCSS();
      expect(css).toContain("#ef4444");
    });
  });

  // ── Component Management ───────────────────────────────────────────────

  describe("addComponent / reset", () => {
    it("should accumulate components and clear on reset", () => {
      sf.addComponent("button", { text: "A" });
      sf.addComponent("button", { text: "B" });
      expect(sf.getComponents()).toHaveLength(2);

      sf.reset();
      expect(sf.getComponents()).toHaveLength(0);
    });
  });

  // ── Utility Sanity Checks ─────────────────────────────────────────────

  describe("utils", () => {
    it("escapeHtml should handle all special characters", () => {
      expect(escapeHtml('<a href="x">&')).toBe(
        '&lt;a href=&quot;x&quot;&gt;&amp;'
      );
    });

    it("hexToRgb should parse 6-digit and 3-digit hex", () => {
      expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb("#0f0")).toEqual({ r: 0, g: 255, b: 0 });
    });
  });
});
