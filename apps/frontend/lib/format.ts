const compactNumber = new Intl.NumberFormat(undefined, {
  notation: "compact",
  maximumFractionDigits: 1,
});

const fullNumber = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

/**
 * Formats a compensation range without a currency symbol: the API stores
 * bare integers and has no currency field, so none is assumed.
 */
export function formatCompensation(
  min: number | null,
  max: number | null,
  style: "compact" | "full" = "full"
): string | null {
  const fmt = style === "compact" ? compactNumber : fullNumber;
  const hasMin = typeof min === "number" && min > 0;
  const hasMax = typeof max === "number" && max > 0;

  if (hasMin && hasMax) {
    return min === max ? fmt.format(min) : `${fmt.format(min)} – ${fmt.format(max)}`;
  }
  if (hasMin) return `${fmt.format(min)}+`;
  if (hasMax) return `Up to ${fmt.format(max)}`;
  return null;
}

export function formatFileSize(bytes: number | null): string | null {
  if (typeof bytes !== "number" || bytes < 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
}

const dateTime = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const dateOnly = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}

export function formatDate(iso: string): string {
  return dateOnly.format(new Date(iso));
}

/** Up to two uppercase initials for identity tiles. */
export function getInitials(name: string | null | undefined): string {
  // Skip tokens such as "&" or "-" that carry no letters or digits.
  const firstChars = (name ?? "")
    .trim()
    .split(/\s+/)
    .map((word) => word.match(/[\p{L}\p{N}]/u)?.[0])
    .filter((char): char is string => Boolean(char));
  if (firstChars.length === 0) return "?";
  return firstChars.slice(0, 2).join("").toUpperCase();
}

/** Hostname for displaying external links compactly. */
export function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// Domain with a TLD, mirroring the API's `@IsUrl()` defaults. Checked
// explicitly because some browsers' URL parsers accept spaces in hosts.
const HOSTNAME = /^(?:[a-z\d](?:[a-z\d-]*[a-z\d])?\.)+[a-z]{2,}$/i;

/** A normalised http(s) URL safe to render as a link, or `null`. */
export function toSafeHref(url: string | null | undefined): string | null {
  const trimmed = url?.trim();
  if (!trimmed || /\s/.test(trimmed)) return null;
  const candidate = /^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return HOSTNAME.test(parsed.hostname) ? parsed.href : null;
  } catch {
    return null;
  }
}
