import { STAGE_COLOR_PRESETS } from "@/features/board/stageColors";
import type { Application } from "@/types";

const preset = (name: (typeof STAGE_COLOR_PRESETS)[number]["name"]) =>
  STAGE_COLOR_PRESETS.find((option) => option.name === name)?.value ?? STAGE_COLOR_PRESETS[0].value;

/** Fictional applications used only in the marketing preview. */
export type SampleApplication = Pick<
  Application,
  "company" | "role" | "location" | "source" | "priority" | "status" | "compMin" | "compMax"
>;

const sample = (fields: Partial<SampleApplication> & Pick<SampleApplication, "company" | "role">): SampleApplication => ({
  location: null,
  source: null,
  priority: "MEDIUM",
  status: "ACTIVE",
  compMin: null,
  compMax: null,
  ...fields,
});

/** Shown mid-drag, on its way from Applied to Interview. */
export const SAMPLE_DRAGGED = sample({
  company: "Tidewater Co.",
  role: "Data Analyst Trainee",
  location: "Cebu",
  source: "Job board",
});

export const SAMPLE_LANES: { name: string; color: string; applications: SampleApplication[] }[] = [
  {
    name: "Interested",
    color: preset("Sage"),
    applications: [
      sample({ company: "Fernway", role: "UX Research Intern", location: "Remote", source: "LinkedIn" }),
      sample({ company: "Orchard Robotics", role: "Embedded Systems OJT", location: "Laguna", source: "Referral", priority: "HIGH" }),
    ],
  },
  {
    name: "Applied",
    color: preset("Lake"),
    applications: [
      sample({
        company: "Northfield Labs",
        role: "Frontend Engineering Intern",
        location: "Remote",
        source: "Careers page",
        priority: "HIGH",
        compMin: 18000,
        compMax: 25000,
      }),
      sample({ company: "Brightline Media", role: "Content Design OJT", location: "Makati", priority: "LOW" }),
    ],
  },
  {
    name: "Interview",
    color: preset("Amber"),
    applications: [
      sample({
        company: "Cobalt Analytics",
        role: "Junior Software Engineer",
        location: "Taguig",
        source: "Referral",
        priority: "URGENT",
        compMin: 30000,
        compMax: 38000,
      }),
    ],
  },
  {
    name: "Offer",
    color: preset("Evergreen"),
    applications: [sample({ company: "Maple & Stone", role: "Product Design Intern", location: "Remote", priority: "HIGH" })],
  },
];
