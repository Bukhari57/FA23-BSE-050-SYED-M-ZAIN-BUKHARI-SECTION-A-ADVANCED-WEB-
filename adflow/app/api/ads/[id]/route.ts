import { updateAd } from "@/controllers/ads-controller";
import { requireRole } from "@/lib/api-guard";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(["client"]);
  if (gate.blocked) return gate.blocked;

  const { id } = await params;
  return updateAd(req, id);
}

