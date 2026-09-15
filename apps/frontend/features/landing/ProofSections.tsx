import {
  ArrowRightLeft,
  ArrowUpRight,
  Check,
  Columns3,
  Download,
  FileImage,
  FileText,
  ListChecks,
  PanelRight,
  Paperclip,
  StickyNote,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import Monogram from "@/components/ui/Monogram";
import ApplicationCardContent from "@/features/board/ApplicationCardContent";
import PriorityBadge from "@/features/board/PriorityBadge";
import { cn } from "@/lib/cn";
import { SAMPLE_LANES } from "./sampleData";

function Vignette({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("select-none rounded-panel border border-border bg-surface-muted p-4 shadow-card sm:p-6", className)}
    >
      {children}
    </div>
  );
}

function PipelineVignette() {
  const [, applied, interview] = SAMPLE_LANES;
  return (
    <Vignette className="overflow-hidden">
      <div className="flex gap-3 [mask-image:linear-gradient(to_right,black_78%,transparent)] sm:grid sm:grid-cols-2 sm:[mask-image:none]">
        {[applied, interview].map((lane, index) => (
          <div key={lane.name} className="w-[236px] shrink-0 rounded-card bg-canvas p-2 sm:w-auto">
            <div className="flex items-center gap-2 px-1.5 pb-2 text-xs font-bold text-text">
              <span className="size-2 rounded-full" style={{ backgroundColor: lane.color }} />
              {lane.name}
            </div>
            <div className="space-y-2">
              <div className="rounded-card border border-border bg-surface shadow-card">
                <ApplicationCardContent application={lane.applications[0]} />
              </div>
              {index === 0 ? (
                <div className="rotate-[-1.5deg] rounded-card border border-brand/30 bg-surface shadow-raised">
                  <ApplicationCardContent application={lane.applications[1]} />
                </div>
              ) : (
                <div className="h-24 rounded-card border border-dashed border-brand/45 bg-brand-soft/60" />
              )}
            </div>
          </div>
        ))}
      </div>
    </Vignette>
  );
}

function DetailsVignette() {
  const app = SAMPLE_LANES[1].applications[0];
  return (
    <Vignette>
      <div className="rounded-card border border-border bg-surface p-4 shadow-card">
        <div className="flex items-start gap-3">
          <Monogram name={app.company} size="lg" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text-muted">{app.company}</p>
            <p className="text-base font-extrabold leading-6 text-text">{app.role}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge tone="outline" icon={<span className="size-2 rounded-full" style={{ backgroundColor: SAMPLE_LANES[1].color }} />}>
                Applied
              </Badge>
              <PriorityBadge priority={app.priority} />
            </div>
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-card bg-surface-muted/60 p-3 text-xs">
          {[
            ["Location", app.location],
            ["Source", app.source],
            ["Compensation", "18,000 – 25,000"],
            ["Posting", "careers.northfield.example"],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="font-semibold text-text-muted">{label}</dt>
              <dd className="mt-0.5 flex items-center gap-1 truncate font-medium text-text">
                {value}
                {label === "Posting" && <ArrowUpRight className="size-3 shrink-0 text-brand" />}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          {[
            { icon: <ArrowRightLeft />, title: "Moved from Interested to Applied", when: "Sep 9, 10:12 AM", tone: "brand" },
            { icon: <StickyNote />, title: "Note", body: "Recruiter said the take-home arrives next week.", when: "Sep 8, 4:40 PM" },
          ].map((item) => (
            <div key={item.title} className="flex gap-2.5">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full [&_svg]:size-3.5",
                  item.tone === "brand" ? "bg-brand-soft text-brand" : "border border-border text-text-muted"
                )}
              >
                {item.icon}
              </span>
              <div className="min-w-0 text-xs">
                <p className="font-semibold text-text">{item.title}</p>
                {item.body && <p className="mt-0.5 leading-5 text-text">{item.body}</p>}
                <p className="mt-0.5 text-text-muted">{item.when}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Vignette>
  );
}

function TasksVignette() {
  const tasks = [
    { title: "Prepare questions for the panel", due: "Due Sep 18", done: false },
    { title: "Follow up with the recruiter", due: "Due Sep 20", done: false },
    { title: "Send portfolio link", done: true },
  ];
  return (
    <Vignette>
      <div className="rounded-card border border-border bg-surface p-4 shadow-card">
        <p className="text-sm font-bold text-text">Tasks</p>
        <div className="mt-3 flex gap-2">
          <span className="flex h-9 flex-1 items-center rounded-control border border-border-strong px-3 text-xs text-text-subtle">
            e.g. Send a thank-you note
          </span>
          <span className="flex h-9 items-center rounded-control border border-border bg-surface px-3 text-xs font-semibold text-text">
            Add
          </span>
        </div>
        <ul className="mt-4 divide-y divide-border rounded-card border border-border">
          {tasks.map((task) => (
            <li key={task.title} className="flex items-start gap-3 px-3 py-2.5">
              <span
                className={cn(
                  "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[5px]",
                  task.done ? "bg-brand" : "border border-border-strong"
                )}
              >
                {task.done && <Check className="size-3 text-on-brand" strokeWidth={3} />}
              </span>
              <div className="text-xs">
                <p className={cn("font-medium", task.done ? "text-text-muted line-through" : "text-text")}>{task.title}</p>
                {task.due && <p className="mt-0.5 text-text-muted">{task.due}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Vignette>
  );
}

function FilesVignette() {
  const files = [
    { icon: <FileText />, name: "Resume – Frontend (Sept).pdf", meta: "184 KB · Added Sep 3" },
    { icon: <FileText />, name: "Cover letter – Northfield.docx", meta: "42 KB · Added Sep 3" },
    { icon: <FileImage />, name: "Take-home brief.png", meta: "1.2 MB · Added Sep 10" },
  ];
  return (
    <Vignette>
      <div className="rounded-card border border-border bg-surface p-4 shadow-card">
        <div className="flex items-center gap-3 rounded-card border border-dashed border-border-strong bg-surface-muted/50 p-3">
          <span className="flex size-9 items-center justify-center rounded-card bg-surface text-brand shadow-xs">
            <Paperclip className="size-4" />
          </span>
          <div className="min-w-0 flex-1 text-xs">
            <p className="font-semibold text-text">Attach a file</p>
            <p className="text-text-muted">Résumés, cover letters, screenshots</p>
          </div>
        </div>
        <ul className="mt-4 divide-y divide-border rounded-card border border-border">
          {files.map((file) => (
            <li key={file.name} className="flex items-center gap-3 px-3 py-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-text-muted [&_svg]:size-4">
                {file.icon}
              </span>
              <div className="min-w-0 flex-1 text-xs">
                <p className="truncate font-semibold text-text">{file.name}</p>
                <p className="text-text-muted">{file.meta}</p>
              </div>
              <Download className="size-4 shrink-0 text-text-muted" />
            </li>
          ))}
        </ul>
      </div>
    </Vignette>
  );
}

const sections = [
  {
    icon: <Columns3 />,
    eyebrow: "Pipelines",
    title: "See your whole search at a glance",
    body: "Stages run left to right in the order you work. Drag a card from Applied to Interview and the move is saved and logged in its history.",
    points: ["Standard stages, or your own", "One pipeline per search", "Search and filter by priority"],
    visual: <PipelineVignette />,
  },
  {
    icon: <PanelRight />,
    eyebrow: "Details",
    title: "Everything about an application, one click away",
    body: "Open any card to see where you found it, where it is, the pay range you noted and the original posting. Edit in place when things change.",
    points: ["Location, source and compensation", "A timeline of notes and stage moves", "Quick edits without leaving the board"],
    visual: <DetailsVignette />,
  },
  {
    icon: <ListChecks />,
    eyebrow: "Tasks",
    title: "Follow-ups that don't slip",
    body: "Give each application its own short checklist, like prepping for a panel or chasing a reply, and tick things off as you go.",
    points: ["Tasks live with the application", "Done items stay out of your way"],
    visual: <TasksVignette />,
  },
  {
    icon: <Paperclip />,
    eyebrow: "Files",
    title: "The right résumé, next to the right application",
    body: "Attach the exact version you sent, along with cover letters and briefs, so it is there when the interview invite arrives.",
    points: ["Upload from any device", "Download whenever you need it"],
    visual: <FilesVignette />,
  },
];

export default function ProofSections() {
  return (
    <div className="space-y-20 sm:space-y-28">
      {sections.map((section, index) => (
        <section
          key={section.eyebrow}
          aria-labelledby={`proof-${section.eyebrow}`}
          className="grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16"
        >
          <div className={cn("max-w-md", index % 2 === 1 && "md:order-2")}>
            <p className="flex items-center gap-2 text-[13px] font-bold text-brand [&_svg]:size-4">
              {section.icon}
              {section.eyebrow}
            </p>
            <h3 id={`proof-${section.eyebrow}`} className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-text sm:text-[28px]">
              {section.title}
            </h3>
            <p className="mt-3 text-[15px] leading-7 text-text-muted">{section.body}</p>
            <ul className="mt-5 space-y-2.5">
              {section.points.map((point) => (
                <li key={point} className="flex items-center gap-2.5 text-sm font-medium text-text">
                  <span aria-hidden="true" className="flex size-5 items-center justify-center rounded-full bg-brand-soft text-brand">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className={cn(index % 2 === 1 && "md:order-1")}>{section.visual}</div>
        </section>
      ))}
    </div>
  );
}
