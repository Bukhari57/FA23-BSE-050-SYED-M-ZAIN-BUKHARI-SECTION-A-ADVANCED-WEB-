export function paginate(page: number, pageSize: number) {
  const safePage = Math.max(page, 1);
  const safeSize = Math.min(Math.max(pageSize, 1), 50);
  const from = (safePage - 1) * safeSize;
  const to = from + safeSize - 1;

  return { safePage, safeSize, from, to };
}

