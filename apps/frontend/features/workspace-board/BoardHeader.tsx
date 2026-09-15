"use client";

import { Layers, Lock, Plus, Search, X } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import Skeleton from "@/components/ui/Skeleton";
import { PRIORITY_LABELS } from "@/features/board/PriorityBadge";
import { APPLICATION_PRIORITIES, type Pipeline } from "@/types";
import type { BoardFilters, PriorityFilter } from "./useBoardFilters";

type Props = {
  workspaceName: string | undefined;
  pipelines: Pipeline[];
  pipeline: Pipeline | undefined;
  loading: boolean;
  onPipelineChange: (pipelineId: string) => void;
  totalCount: number | null;
  filters: BoardFilters;
  /** Board controls only make sense once a pipeline with stages is loaded. */
  boardReady: boolean;
  onAddApplication: () => void;
  onCreatePipeline: () => void;
};

export default function BoardHeader({
  workspaceName,
  pipelines,
  pipeline,
  loading,
  onPipelineChange,
  totalCount,
  filters,
  boardReady,
  onAddApplication,
  onCreatePipeline,
}: Props) {
  const countLabel =
    totalCount === null
      ? null
      : filters.isFiltering
        ? `${filters.visibleCount} of ${totalCount} ${totalCount === 1 ? "application" : "applications"}`
        : `${totalCount} ${totalCount === 1 ? "application" : "applications"}`;

  return (
    <div className="shrink-0 px-4 pb-4 pt-5 sm:px-6 sm:pt-6">
      {/* Workspace and pipeline context */}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          {workspaceName ? (
            <p className="truncate text-[13px] font-semibold text-text-muted">{workspaceName}</p>
          ) : (
            <Skeleton className="mb-1 h-4 w-28" />
          )}
          <div className="mt-0.5 flex min-w-0 items-center gap-2">
            {loading ? (
              <Skeleton className="h-7 w-48" />
            ) : (
              <h1 className="truncate text-xl font-extrabold tracking-tight text-text sm:text-2xl">
                {pipeline?.name ?? "Board"}
              </h1>
            )}
            {pipeline?.isDefault && <Badge tone="brand">Default</Badge>}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" onClick={onCreatePipeline} disabled={loading} className="max-sm:px-3">
            <Layers aria-hidden="true" />
            <span className="max-sm:sr-only">New pipeline</span>
          </Button>
          <Button onClick={onAddApplication} disabled={!boardReady}>
            <Plus aria-hidden="true" />
            <span className="sm:hidden">Add</span>
            <span className="max-sm:hidden">Add application</span>
          </Button>
        </div>
      </div>

      {/* Command bar */}
      <div
        role="group"
        aria-label="Board controls"
        className="mt-4 flex flex-wrap items-center gap-2 rounded-card border border-border bg-surface p-2 shadow-card"
      >
        <Field label="Pipeline" hideLabel className="w-full sm:w-56">
          <Select
            value={pipeline?.id ?? ""}
            onChange={(event) => onPipelineChange(event.target.value)}
            disabled={loading || pipelines.length === 0}
          >
            {pipelines.length === 0 && <option value="">{loading ? "Loading pipelines…" : "No pipelines"}</option>}
            {pipelines.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.isDefault ? " (default)" : ""}
              </option>
            ))}
          </Select>
        </Field>

        <span aria-hidden="true" className="hidden h-6 w-px bg-border sm:block" />

        <Field label="Search by company or role" hideLabel className="min-w-0 flex-1 basis-40 sm:max-w-72">
          <Input
            type="search"
            leadingIcon={<Search />}
            placeholder="Company or role"
            value={filters.query}
            onChange={(event) => filters.setQuery(event.target.value)}
            disabled={!boardReady}
            autoComplete="off"
          />
        </Field>

        <Field label="Filter by priority" hideLabel className="w-36 sm:w-40">
          <Select
            value={filters.priority}
            onChange={(event) => filters.setPriority(event.target.value as PriorityFilter)}
            disabled={!boardReady}
          >
            <option value="ALL">All priorities</option>
            {APPLICATION_PRIORITIES.map((value) => (
              <option key={value} value={value}>
                {PRIORITY_LABELS[value]}
              </option>
            ))}
          </Select>
        </Field>

        {filters.isFiltering && (
          <Button variant="ghost" onClick={filters.clear}>
            <X aria-hidden="true" />
            Clear
          </Button>
        )}

        <p
          role="status"
          className="ml-auto whitespace-nowrap px-2 text-[13px] font-semibold tabular-nums text-text-muted"
        >
          {countLabel}
        </p>
      </div>

      {filters.isFiltering && (
        <p className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-text-muted">
          <Lock aria-hidden="true" className="size-3.5" />
          Clear filters to reorder. Dragging is paused while search or priority filters are on.
        </p>
      )}
    </div>
  );
}
