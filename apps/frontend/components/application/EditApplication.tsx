"use client";

import { useState } from "react";
import type { Application } from "@/hooks/useApplications";
import { api } from "@/lib/api";

type Props = {
  application: Application;
  onCancel: () => void;
  onSuccess: () => void;
};

export default function EditApplicationForm({
  application,
  onCancel,
  onSuccess,
}: Props) {
  const [company, setCompany] = useState(application.company);
  const [role, setRole] = useState(application.role);
  const [link, setLink] = useState(application.link ?? "");
  const [source, setSource] = useState(application.source ?? "");
  const [location, setLocation] = useState(application.location ?? "");
  const [compMin, setCompMin] = useState(application.compMin ?? "");
  const [compMax, setCompMax] = useState(application.compMax ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api(`/applications/${application.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          company,
          role,
          link: link || undefined,
          source: source || undefined,
          location: location || undefined,
          compMin: compMin || undefined,
          compMax: compMax || undefined,
        }),
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message ?? "Failed to update application");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1">
        <label className="text-sm">Company</label>
        <input
          className="w-full input"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm">Role</label>
        <input
          className="w-full input"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm">Link</label>
        <input
          className="w-full input"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm">Source</label>
        <input
          className="w-full input"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm">Location</label>
        <input
          className="w-full input"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-sm">Comp Min</label>
          <input
            type="number"
            className="w-full input"
            value={compMin}
            onChange={(e) => setCompMin(e.target.valueAsNumber)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm">Comp Max</label>
          <input
            type="number"
            className="w-full input"
            value={compMax}
            onChange={(e) => setCompMax(e.target.valueAsNumber)}
          />
        </div>
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          {loading ? "Saving…" : "Save"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
