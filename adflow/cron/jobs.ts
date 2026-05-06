import { createClient } from "@/lib/supabase/server";

export async function publishScheduledAds() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ads")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
    })
    .eq("status", "scheduled")
    .lte("scheduled_at", new Date().toISOString())
    .select("id");

  if (error) throw error;
  return { published: data?.length ?? 0 };
}

export async function expireAds() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ads")
    .update({ status: "expired" })
    .eq("status", "published")
    .lte("expires_at", new Date().toISOString())
    .select("id");

  if (error) throw error;
  return { expired: data?.length ?? 0 };
}

export async function logSystemHealth(status = "healthy") {
  const supabase = await createClient();

  const { error } = await supabase.from("system_health_logs").insert({
    status,
    metadata: { timestamp: new Date().toISOString() },
  });

  if (error) throw error;
  return { ok: true };
}

