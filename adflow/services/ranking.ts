import { differenceInHours } from "date-fns";

interface RankingInput {
  featured: boolean;
  packageWeight: number;
  boostScore: number;
  publishedAt?: string | null;
}

export function calculateAdRank(input: RankingInput) {
  const freshnessHours = input.publishedAt
    ? Math.max(0, 720 - differenceInHours(new Date(), new Date(input.publishedAt)))
    : 0;

  const featuredWeight = input.featured ? 50 : 0;
  const packageWeight = input.packageWeight * 10;
  const boost = input.boostScore;

  return featuredWeight + packageWeight + boost + freshnessHours / 24;
}
