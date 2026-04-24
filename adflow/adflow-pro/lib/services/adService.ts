import { supabase } from "../supabase";

export async function createAd(data: any, userId: string) {
  return await supabase.from("ads").insert({
    ...data,
    user_id: userId,
    status: "draft"
  });
}

export async function updateAdStatus(adId: string, status: string) {
  return await supabase
    .from("ads")
    .update({ status })
    .eq("id", adId);
}