"use client";

import { useMemo, useState } from "react";
import type { Application, ApplicationPriority } from "@/types";

export type PriorityFilter = ApplicationPriority | "ALL";

/**
 * Client-side search and priority filtering. The canonical application list
 * is never reordered or trimmed; callers receive the matching ids instead.
 */
export function useBoardFilters(applications: Application[]) {
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState<PriorityFilter>("ALL");

  const normalizedQuery = query.trim().toLowerCase();
  const isFiltering = normalizedQuery.length > 0 || priority !== "ALL";

  const visibleIds = useMemo(() => {
    if (!isFiltering) return null;
    const matches = applications.filter((app) => {
      if (priority !== "ALL" && app.priority !== priority) return false;
      if (!normalizedQuery) return true;
      return (
        app.company.toLowerCase().includes(normalizedQuery) || app.role.toLowerCase().includes(normalizedQuery)
      );
    });
    return new Set(matches.map((app) => app.id));
  }, [applications, isFiltering, normalizedQuery, priority]);

  return {
    query,
    setQuery,
    priority,
    setPriority,
    isFiltering,
    visibleIds,
    visibleCount: visibleIds ? visibleIds.size : applications.length,
    clear: () => {
      setQuery("");
      setPriority("ALL");
    },
  };
}

export type BoardFilters = ReturnType<typeof useBoardFilters>;
