

## Phase 0 — Contract freeze (mental step, not code)

**Rule:** Backend is frozen enough to consume.

What this means:

* Endpoints exist
* DTOs are stable
* Auth works
* IDs, ownership, and permissions are correct

If you change backend contracts after this, you restart the frontend phase.

---

## Phase 1 — Read path first

**Objective:** Prove the frontend can *correctly render reality*.

You implement:

* Auth gate (`/me`)
* Workspace list
* Pipeline list
* Stage list
* Application list

**No mutations. No forms. No drag.**

Why:

* 70% of frontend bugs come from wrong assumptions about data shape
* Read paths expose API flaws early

If read paths are wrong, everything downstream collapses.

---

## Phase 2 — Write path (CRUD without interaction)

**Objective:** Prove state transitions persist.

You implement:

* Create application
* Edit application
* Delete (soft delete)

Rules:

* Every mutation → backend → refetch or invalidate
* No local-only state hacks
* Refresh must reflect reality

If refresh breaks state → you are lying to yourself.

---

## Phase 3 — Interaction layer (drag & reorder)

**Objective:** Add complexity only after correctness.

You implement:

* Drag & drop
* Optimistic updates
* Rollback on failure
* Position correctness

Why this is late:

* Drag logic depends on **stable read + write paths**
* Otherwise you debug ghosts

If drag feels “janky,” the bug is usually **state ownership**, not dnd-kit.

---

## Phase 4 — Secondary domains

You now layer:

* Activities (append-only log)
* Tasks (mutable reminders)
* Optional files

These are **attachments**, not core flow.
They must never break the board.

---

## Phase 5 — Polish (last, always last)

Only now do you care about:

* Visual consistency
* Empty states
* Skeletons
* Keyboard UX
* Responsiveness

Why last:

* UI polish is cheap
* Refactoring polished UI is expensive

---

## Phase 6 — Verification & deployment

You manually verify:

* Reload consistency
* Cross-route navigation
* Auth isolation
* Mutation persistence
* Drag correctness
