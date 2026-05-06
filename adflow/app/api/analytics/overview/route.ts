import { analyticsOverview } from "@/controllers/analytics-controller";

export async function GET() {
  return analyticsOverview();
}

