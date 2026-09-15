import type { Stage } from "@/types";

/**
 * Calm, mutually distinguishable stage colours. Offered when creating
 * stages and used as a fallback for stages saved without a colour.
 */
export const STAGE_COLOR_PRESETS = [
  { name: "Sage", value: "#6B9A84" },
  { name: "Evergreen", value: "#2F6D58" },
  { name: "Lake", value: "#4F7CA6" },
  { name: "Lavender", value: "#8174B0" },
  { name: "Amber", value: "#C08A2E" },
  { name: "Clay", value: "#B86B4B" },
  { name: "Brick", value: "#B4452F" },
  { name: "Slate", value: "#6C7A73" },
] as const;

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/** The stage's saved colour when valid, otherwise a stable preset by index. */
export function resolveStageColor(stage: Pick<Stage, "color">, index: number): string {
  if (stage.color && HEX.test(stage.color.trim())) return stage.color.trim();
  return STAGE_COLOR_PRESETS[index % STAGE_COLOR_PRESETS.length].value;
}
