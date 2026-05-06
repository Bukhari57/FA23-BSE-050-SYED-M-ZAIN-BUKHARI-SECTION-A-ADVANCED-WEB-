import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { requireDashboardRole } from "@/services/dashboard-guard";

export default async function ClientDashboardPage() {
  await requireDashboardRole(["client", "super_admin"]);

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Client Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Draft Ads", "16"],
          ["Submitted", "9"],
          ["Published", "21"],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">{label}</p>
              <CardTitle className="mt-2 text-2xl">{value}</CardTitle>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-5">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <p className="mt-2 text-sm text-slate-600">Create new ads, submit for moderation, and upload payment proofs here.</p>
        </CardContent>
      </Card>
    </section>
  );
}

