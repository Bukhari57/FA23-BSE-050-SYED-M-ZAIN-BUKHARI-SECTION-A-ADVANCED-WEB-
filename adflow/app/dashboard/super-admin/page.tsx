import { Card, CardContent } from "@/components/ui/card";
import { requireDashboardRole } from "@/services/dashboard-guard";

export default async function SuperAdminDashboardPage() {
  await requireDashboardRole(["super_admin"]);

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
      <Card>
        <CardContent className="space-y-2 p-5">
          <p className="text-sm text-slate-500">System Control Panel</p>
          <p className="text-lg text-slate-800">Manage platform settings, staff roles, abuse reports, and global audit logs.</p>
        </CardContent>
      </Card>
    </section>
  );
}

