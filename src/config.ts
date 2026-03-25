/**
 * SketchFlow configuration module
 * Defines defaults and loads environment overrides
 */

export interface SketchFlowConfig {
  outputDir: string;
  theme: "light" | "dark";
  minify: boolean;
  fontFamily: string;
  primaryColor: string;
  responsive: boolean;
  cssReset: boolean;
  indent: number;
}

const defaults: SketchFlowConfig = {
  outputDir: "./output",
  theme: "light",
  minify: false,
  fontFamily: "Inter, system-ui, sans-serif",
  primaryColor: "#3b82f6",
  responsive: true,
  cssReset: true,
  indent: 2,
};

/**
 * Load configuration from environment variables, merged with defaults.
 */
export function loadConfig(
  overrides: Partial<SketchFlowConfig> = {}
): SketchFlowConfig {
  const envConfig: Partial<SketchFlowConfig> = {};

  if (process.env.SKETCHFLOW_OUTPUT_DIR) {
    envConfig.outputDir = process.env.SKETCHFLOW_OUTPUT_DIR;
  }
  if (process.env.SKETCHFLOW_THEME) {
    envConfig.theme = process.env.SKETCHFLOW_THEME as "light" | "dark";
  }
  if (process.env.SKETCHFLOW_MINIFY) {
    envConfig.minify = process.env.SKETCHFLOW_MINIFY === "true";
  }
  if (process.env.SKETCHFLOW_FONT_FAMILY) {
    envConfig.fontFamily = process.env.SKETCHFLOW_FONT_FAMILY;
  }
  if (process.env.SKETCHFLOW_PRIMARY_COLOR) {
    envConfig.primaryColor = process.env.SKETCHFLOW_PRIMARY_COLOR;
  }
  if (process.env.SKETCHFLOW_RESPONSIVE) {
    envConfig.responsive = process.env.SKETCHFLOW_RESPONSIVE === "true";
  }

  return { ...defaults, ...envConfig, ...overrides };
}

export { defaults as defaultConfig };
