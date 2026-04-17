import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export function assertCronSecret(req: Request) {
  const secret = req.headers.get("x-cron-secret") ?? req.headers.get("authorization")?.replace("Bearer ", "");

  if (!secret || secret !== env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized cron call" }, { status: 401 });
  }

  return null;
}

