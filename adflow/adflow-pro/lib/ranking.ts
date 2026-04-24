export function rank(ad: { featured?: boolean; weight?: number }): number {
  return (ad.featured ? 50 : 0) + (ad.weight || 1) * 10;
}