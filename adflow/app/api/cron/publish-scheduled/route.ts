import { assertCronSecret } from "@/cron/auth";
import { publishScheduledAds } from "@/cron/jobs";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const unauthorized = assertCronSecret(req);
  if (unauthorized) return unauthorized;

  const result = await publishScheduledAds();
  return NextResponse.json(result);
}

