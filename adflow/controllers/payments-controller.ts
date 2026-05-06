import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { paymentSubmitSchema } from "@/features/payments/schemas";
import { adScheduleSchema } from "@/features/ads/schemas";

export async function submitPayment(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = paymentSubmitSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const duplicateCheck = await supabase
    .from("payments")
    .select("id")
    .eq("transaction_ref", parsed.data.transactionRef)
    .maybeSingle();

  if (duplicateCheck.data) {
    return NextResponse.json({ error: "Duplicate transaction reference" }, { status: 409 });
  }

  const { error } = await supabase.from("payments").insert({
    ad_id: parsed.data.adId,
    submitted_by: user.id,
    amount_pkr: parsed.data.amountPkr,
    transaction_ref: parsed.data.transactionRef,
    screenshot_url: parsed.data.screenshotUrl,
    notes: parsed.data.notes ?? null,
    status: "submitted",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.from("ads").update({ status: "payment_submitted" }).eq("id", parsed.data.adId);

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function verifyPaymentById(paymentId: string, approved: boolean, adminNotes?: string) {
  const supabase = await createClient();

  const nextPaymentStatus = approved ? "verified" : "rejected";
  const nextAdStatus = approved ? "payment_verified" : "payment_pending";

  const { data: payment } = await supabase
    .from("payments")
    .update({
      status: nextPaymentStatus,
      admin_notes: adminNotes ?? null,
      verified_at: new Date().toISOString(),
    })
    .eq("id", paymentId)
    .select("ad_id")
    .single();

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  await supabase.from("ads").update({ status: nextAdStatus }).eq("id", payment.ad_id);

  return NextResponse.json({ ok: true, paymentStatus: nextPaymentStatus, adStatus: nextAdStatus });
}

export async function scheduleAd(req: Request, adId: string) {
  const supabase = await createClient();
  const body = await req.json();
  const parsed = adScheduleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const when = new Date(parsed.data.scheduledAt);
  if (Number.isNaN(when.getTime())) {
    return NextResponse.json({ error: "Invalid schedule date" }, { status: 400 });
  }

  const immediate = when <= new Date();

  const { error } = await supabase
    .from("ads")
    .update({
      scheduled_at: when.toISOString(),
      status: immediate ? "published" : "scheduled",
      published_at: immediate ? new Date().toISOString() : null,
    })
    .eq("id", adId)
    .eq("status", "payment_verified");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, status: immediate ? "published" : "scheduled" });
}

