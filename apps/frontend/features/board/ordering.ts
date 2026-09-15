import type { Application, Stage } from "@/types";

/** Applications grouped per stage, each list ordered by `position`. */
export function groupByStage(stages: Stage[], applications: Application[]) {
  const map = new Map<string, Application[]>();
  for (const stage of stages) map.set(stage.id, []);
  for (const app of applications) map.get(app.stageId)?.push(app);
  // Array.prototype.sort is stable, so ties keep the server's order.
  for (const list of map.values()) list.sort((a, b) => a.position - b.position);
  return map;
}

/**
 * Returns a new list with `appId` moved to `toIndex` within `toStageId`.
 * Positions of the affected stages are re-indexed from 0 so later grouping
 * reflects the new order. `toIndex` is interpreted after removing the card,
 * matching `arrayMove` semantics for moves inside one stage.
 */
export function moveApplication(
  applications: Application[],
  stages: Stage[],
  appId: string,
  toStageId: string,
  toIndex: number
): Application[] {
  const moving = applications.find((app) => app.id === appId);
  if (!moving) return applications;

  const lists = groupByStage(stages, applications);
  const fromList = (lists.get(moving.stageId) ?? []).filter((app) => app.id !== appId);
  const toList = toStageId === moving.stageId ? fromList : (lists.get(toStageId) ?? []).slice();

  const index = Math.max(0, Math.min(toIndex, toList.length));
  toList.splice(index, 0, { ...moving, stageId: toStageId });

  const patched = new Map<string, Application>();
  fromList.forEach((app, i) => patched.set(app.id, { ...app, position: i }));
  toList.forEach((app, i) => patched.set(app.id, { ...app, position: i }));

  return applications.map((app) => patched.get(app.id) ?? app);
}

/**
 * Translates a visual drop index into the `position` the API expects.
 *
 * The API closes the gap at the card's old position, shifts cards at or after
 * the new position, then writes the new position. Stored positions can have
 * gaps (soft deletes do not compact them), so the value is derived from the
 * card that will sit directly before the drop target rather than from the
 * raw index. For contiguous positions this equals the index.
 */
export function toServerPosition(
  serverApplications: Application[],
  finalStageList: Application[],
  appId: string
): number {
  const index = finalStageList.findIndex((app) => app.id === appId);
  if (index <= 0) return 0;

  const moving = serverApplications.find((app) => app.id === appId);
  const before = serverApplications.find((app) => app.id === finalStageList[index - 1].id);
  if (!moving || !before) return index;

  const closesGap = before.stageId === moving.stageId && before.position > moving.position;
  return (closesGap ? before.position - 1 : before.position) + 1;
}
