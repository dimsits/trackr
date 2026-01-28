import { auth } from "./auth";

const BASE = process.env.NEXT_PUBLIC_API_URL!;

type ApiError = { status: number; message: string };

async function parseError(res: Response): Promise<ApiError> {
  let msg = res.statusText;
  try {
    const data = await res.json();
    msg = data?.message ?? msg;
  } catch {}
  return { status: res.status, message: msg };
}

export async function api<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = auth.getToken();
  const headers = new Headers(init.headers);

  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!res.ok) throw await parseError(res);
  return (await res.json()) as T;
}
