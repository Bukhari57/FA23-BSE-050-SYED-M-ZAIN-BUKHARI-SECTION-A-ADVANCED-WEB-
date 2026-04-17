import { assertCronSecret } from "@/cron/auth";
import { expireAds } from "@/cron/jobs";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const unauthorized = assertCronSecret(req);
  if (unauthorized) return unauthorized;

  const result = await expireAds();
  return NextResponse.json(result);
}

