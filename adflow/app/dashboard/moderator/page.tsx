import { Card, CardContent } from "@/components/ui/card";
import { requireDashboardRole } from "@/services/dashboard-guard";

export default async function ModeratorDashboardPage() {
  await requireDashboardRole(["moderator", "admin", "super_admin"]);

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Moderator Dashboard</h1>
      <Card>
        <CardContent className="space-y-2 p-5">
          <p className="text-sm text-slate-500">Pending Review Queue</p>
          <p className="text-2xl font-bold text-amber-700">34 Ads</p>
          <p className="text-sm text-slate-600">Approve valid listings to move them to payment pending, reject policy violations.</p>
        </CardContent>
      </Card>
    </section>
  );
}

