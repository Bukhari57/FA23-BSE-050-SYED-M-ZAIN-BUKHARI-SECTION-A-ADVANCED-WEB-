import { Card, CardContent } from "@/components/ui/card";
import { requireDashboardRole } from "@/services/dashboard-guard";
import { createClient } from "@/lib/supabase/server";

export default async function ManageUsersPage() {
  await requireDashboardRole(["super_admin"]);
  const supabase = await createClient();
  const { data: users } = await supabase.from("users").select("id, email, role");

  async function updateRole(userId: string, newRole: string) {
    await supabase.from("users").update({ role: newRole }).eq("id", userId);
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">User Role Management</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {users?.map((user: any) => (
          <Card key={user.id}>
            <CardContent className="p-5 flex flex-col gap-2">
              <span className="font-semibold">{user.email}</span>
              <span className="text-sm text-slate-500">Current Role: {user.role}</span>
              <form
                action={async (formData) => {
                  'use server';
                  await updateRole(user.id, formData.get('role') as string);
                }}
              >
                <select name="role" defaultValue={user.role} className="border rounded p-1 mr-2">
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                <button type="submit" className="bg-slate-900 text-white px-3 py-1 rounded">Update</button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
