import { verifyPaymentById } from "@/controllers/payments-controller";
import { requireRole } from "@/lib/api-guard";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(["admin", "super_admin"]);
  if (gate.blocked) return gate.blocked;

  const { id } = await params;
  const body = await req.json();
  const approved = Boolean(body.approved);
  return verifyPaymentById(id, approved, body.adminNotes);
}

