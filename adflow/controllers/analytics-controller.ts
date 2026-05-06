import { NextResponse } from "next/server";
import { getAnalyticsOverview } from "@/services/analytics";

export async function analyticsOverview() {
  const overview = await getAnalyticsOverview();
  return NextResponse.json(overview);
}

