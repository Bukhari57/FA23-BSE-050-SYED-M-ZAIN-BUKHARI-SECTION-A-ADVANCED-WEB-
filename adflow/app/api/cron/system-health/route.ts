import { assertCronSecret } from "@/cron/auth";
import { logSystemHealth } from "@/cron/jobs";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const unauthorized = assertCronSecret(req);
  if (unauthorized) return unauthorized;

  const result = await logSystemHealth("healthy");
  return NextResponse.json(result);
}

