import { moderateAd } from "@/controllers/moderation-controller";
import { requireRole } from "@/lib/api-guard";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(["moderator", "admin", "super_admin"]);
  if (gate.blocked) return gate.blocked;
  const { id } = await params;
  return moderateAd(req, id);
}

