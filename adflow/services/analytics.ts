import { createClient } from "@/lib/supabase/server";

export async function getAnalyticsOverview() {
  const supabase = await createClient();

  const [{ count: adsCount }, { count: publishedCount }, { data: payments }] = await Promise.all([
    supabase.from("ads").select("id", { count: "exact", head: true }),
    supabase.from("ads").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("payments").select("amount_pkr, verified_at, status"),
  ]);

  const verifiedPayments = (payments ?? []).filter((p) => p.status === "verified");
  const totalRevenue = verifiedPayments.reduce((acc, p) => acc + Number(p.amount_pkr), 0);

  return {
    listings: adsCount ?? 0,
    publishedListings: publishedCount ?? 0,
    totalRevenue,
    moderationApprovalRate:
      (payments?.length ?? 0) > 0
        ? Number(((verifiedPayments.length / (payments?.length ?? 1)) * 100).toFixed(2))
        : 0,
    systemHealth: "healthy",
  };
}
