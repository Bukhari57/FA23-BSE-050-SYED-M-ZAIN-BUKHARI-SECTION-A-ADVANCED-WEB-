import { submitPayment } from "@/controllers/payments-controller";
import { requireRole } from "@/lib/api-guard";

export async function POST(req: Request) {
  const gate = await requireRole(["client"]);
  if (gate.blocked) return gate.blocked;
  return submitPayment(req);
}

