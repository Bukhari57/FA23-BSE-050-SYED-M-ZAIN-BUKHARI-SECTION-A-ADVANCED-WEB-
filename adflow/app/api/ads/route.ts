import { listPublicAds, createAd } from "@/controllers/ads-controller";
import { requireRole } from "@/lib/api-guard";

export async function GET(req: Request) {
  return listPublicAds(new URL(req.url));
}

export async function POST(req: Request) {
  const gate = await requireRole(["client"]);
  if (gate.blocked) return gate.blocked;
  return createAd(req);
}

