import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PackageRow {
  id: string;
  name: string;
  description: string | null;
  price_pkr: number;
  duration_days: number;
  is_featured: boolean;
  weight: number;
}

export default async function PackagesPage() {
  const supabase = await createClient();
  const { data: packages } = await supabase
    .from("packages")
    .select("id, name, description, price_pkr, duration_days, is_featured, weight")
    .order("price_pkr", { ascending: true });

  return (
    <main className="container py-8">
      <h1 className="text-3xl font-bold">Packages</h1>
      <p className="mt-2 text-slate-600">Choose reach and priority with transparent pricing.</p>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {((packages ?? []) as PackageRow[]).map((pkg) => (
          <Card key={pkg.id} className={pkg.is_featured ? "border-cyan-400 shadow-lg" : ""}>
            <CardContent className="space-y-3 p-5">
              {pkg.is_featured && <Badge variant="success">Featured Priority</Badge>}
              <CardTitle>{pkg.name}</CardTitle>
              <p className="text-sm text-slate-600">{pkg.description}</p>
              <p className="text-2xl font-bold">PKR {pkg.price_pkr.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Duration: {pkg.duration_days} days</p>
              <p className="text-sm text-slate-500">Ranking weight: {pkg.weight}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}