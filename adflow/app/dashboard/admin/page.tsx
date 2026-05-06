import { Card, CardContent } from "@/components/ui/card";
import { AnalyticsCharts } from "@/components/charts/analytics-charts";
import { requireDashboardRole } from "@/services/dashboard-guard";

export default async function AdminDashboardPage() {
  await requireDashboardRole(["admin", "super_admin"]);

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Payment Submissions", "29"],
          ["Verified Today", "11"],
          ["Scheduled Ads", "53"],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <AnalyticsCharts />
    </section>
  );
}

