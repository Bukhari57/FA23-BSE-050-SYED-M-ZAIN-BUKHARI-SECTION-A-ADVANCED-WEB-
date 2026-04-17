import type { AdStatus } from "@/lib/types";

const allowedTransitions: Record<AdStatus, AdStatus[]> = {
  draft: ["submitted"],
  submitted: ["under_review"],
  under_review: ["payment_pending", "rejected"],
  payment_pending: ["payment_submitted"],
  payment_submitted: ["payment_verified", "payment_pending"],
  payment_verified: ["scheduled", "published"],
  scheduled: ["published"],
  published: ["expired"],
  expired: [],
  rejected: ["draft"],
};

export function isTransitionAllowed(current: AdStatus, next: AdStatus) {
  return allowedTransitions[current]?.includes(next) ?? false;
}

export function assertTransition(current: AdStatus, next: AdStatus) {
  if (!isTransitionAllowed(current, next)) {
    throw new Error(`Invalid ad status transition: ${current} -> ${next}`);
  }
}
